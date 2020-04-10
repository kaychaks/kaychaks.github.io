---
title : “Declarative, Decentralised, and Secure communication via Matrix, Jitsi, & NixOS”
published : 2019-04-09
tags : technology , nixos
link :
---

It has been one of my strong pursuit to figure out a properly encrypted and decentralised
communication setup. [Matrix](matrix.org)'s claim to provide that is pretty
strong against other alternatives. I've been using [Riot](riot.im), the most feature rich
Matrix client, but mainly as an IRC bouncer.

Just the other day I read this
awesome guide on _[Running your own secure communication service with Matrix and
Jitsi](https://matrix.org/blog/2020/04/06/running-your-own-secure-communication-service-with-matrix-and-jitsi)_
and realised it's not that difficult nowadays to setup all the pieces of the
puzzle.

And so if I want to follow those steps shown in the above article but rather
do it in NixOS - another project I am really excited about - how easy/difficult
it would be ?

Well apart from minor tweaks, it was pretty straightforward and I would argue
more simpler than how its done for a Debian based system. Following is the
rundown of how I made the relevant steps work for my setup. I am not going to
repeat all the nice technical explanations of above article. So anyone following
**should **first read the above article.

Before we begin, I would also like to address one difference from the basic premise of
the above article - Unlike in the above article the main domain
(_dangerousdemos.net_) is already pointing to an existing blog [hosted from a
Github
repository](https://help.github.com/en/github/working-with-github-pages/configuring-a-custom-domain-for-your-github-pages-site).
I think this might be a case for many like me who already have a domain name
serving a static blog (like this one) but
want to setup Matrix via the subdomains.

So lets begin,

## NixOS

With NixOS every step is declarative and hence we don't have to worry about the
mechanical rigor as is the case with most of the steps in the original article.
What it entails for us broadly are these 3 steps (_apart from some additional stuff_)

 - Update `/etc/nixos/configuration.nix`
 - Run `sudo nixos-rebuild switch`
 - Done!

[NixOS](https://nixos.org/) made following the original article really easy as I could make
mistakes and not worry because I could rollback and start again. Let that sink
in as I think that in itself is mind-blowing.

## DNS

Let's use the same domain name - _dangerousdemos.net_ - as used in the original
article for our explanations. As mentioned above, we have one change here that the root domain
already is redirecting to the static blog hosted in Github Pages. So we need to
setup `A` records for the following subdomains:

 - `matrix.dangerousdemos.net` (for Synapse)
 - `riot.dangerousdemos.net` (for Riot/Web)
 - `jitsi.dangerousdemos.net` (for Jitsi)
 - _`turn.dangerousdemos.net`_ (for coturn based `TURN` server that in original article is
   taken care by `jitsi-meet` installer)

_Its important for all these to setup in the DNS before we run our configurations
so that LetsEncrypt challenge flow works fine or else we might face errors._

## Firewall

We need to ensure that following ports are open in the NixOS firewall for all
the configurations to work fine

```bash
 # /etc/nixos/configuration.nix

  networking.firewall = {
    allowedUDPPorts = [ 5349 5350];
    allowedTCPPorts = [ 80 443 3478 3479];
  }
```

## Nginx with LetsEncrypt

 ```bash

 # /etc/nixos/configuration.nix


  services.nginx = {
    enable = true;
    virtualHosts = {

      ## virtual host for Syapse
      "matrix.dangerousdemos.net" = {
        ## for force redirecting HTTP to HTTPS
        forceSSL = true;
        ## this setting takes care of all LetsEncrypt business
        enableACME = true;
        locations."/" = {
          proxyPass = "http://localhost:8008";
        };
      };

      ## virtual host for Riot/Web
      "riot.dangerousdemos.net" = {
        ## for force redirecting HTTP to HTTPS
        forceSSL = true;
        ## this setting takes care of all LetsEncrypt business
        enableACME = true;
        ## root points to the riot-web package content, also configured via Nix
        locations."/" = {
            root = pkgs.riot-web;
        };
      };

      ## virtual host for Jitsi, reusing the same hostname as used
      ## while configuring jitsi-meet
      ${config.services.jitsi-meet.hostName} = {
        enableACME = true;
        forceSSL = true;
      };
    };

    ## other nginx specific best practices
    recommendedGzipSettings = true;
    recommendedOptimisation = true;
    recommendedTlsSettings = true;
  };
 ```

The above setups Nginx along with LetsEncrypt. If it's required (like in the
original article) to setup main domain as a virtual host then make an additional
entry inside `virtualHosts`

```bash

"dangerousdemos.net" = {
  forceSSL = true;
  enableACME = true;
  locations."/" = {
    root = "/var/www/dangerousdemos.net"
  }
}

```


## Synapse

```bash
 # /etc/nixos/configuration.nix

  services.matrix-synapse = {
    enable = true;

    ## domain for the Matrix IDs
    server_name = "dangerousdemos.net";

    ## enable metrics collection
    enable_metrics = true;

    ## enable user registration
    enable_registration = true;

    ## Synapse guys recommend to use PostgreSQL over SQLite
    database_type = "psycopg2";

    ## database setup clarified later
    database_args = {
      password = "synapse";
    };

    ## default http listener which nginx will passthrough to
    listeners = [
      {
        port = 8008;
        tls = false;
        resources = [
          {
            compress = true;
            names = ["client" "webclient" "federation"];
          }
        ];
      }
    ];

    ## coturn based TURN server integration (TURN server setup mentioned later),
    ## shared secret generated while configuring coturn
    ## and reused here (power of Nix being a real programming language)
    turn_uris = [
      "turn:turn.dangerousdemos.net:3478?transport=udp"
      "turn:turn.dangerousdemos.net:3478?transport=tcp"
    ];
    turn_shared_secret = config.services.coturn.static-auth-secret;
  };

```

Unlike in the original article we will do [what's recommended by Synapse team](https://github.com/matrix-org/synapse#using-postgresql) and
configure PostgreSQL. In the current NixOS configuration for
`services.matrix-synapse` it might be configuring PostgreSQL automatically based
on the `database_type` setting but that will change in the new versions of NixOS where
PostgreSQL setups need to happen separately. Here's how we will do it for Synapse

```bash
 # /etc/nixos/configuration.nix

  services.postgresql = {
    enable = true;

    ## postgresql user and db name remains in the
    ## service.matrix-synapse.database_args setting which
    ## by default is matrix-synapse
    initialScript = pkgs.writeText "synapse-init.sql" ''
        CREATE ROLE "matrix-synapse" WITH LOGIN PASSWORD 'synapse';
        CREATE DATABASE "matrix-synapse" WITH OWNER "matrix-synapse"
            TEMPLATE template0
            LC_COLLATE = "C"
            LC_CTYPE = "C";
        '';
  };
```

**Federation setting**

Original article's description for [how to configure so that Matrix could find
one's server is nice](https://matrix.org/blog/2020/04/06/running-your-own-secure-communication-service-with-matrix-and-jitsi#synapse). I am just leveraging that with one additional setting
required when there is already a static blog
running via Github Pages pointing to base domain:

 - create a file having this path `.well-known/matrix/server` in the top level of the Github
   repository serving the static site having the following content

   ```json
   { "m.server": "matrix.dangerousdemos.net:443" }
   ```
 - Github Pages via Jekyll exclude dotfiles/dotdirs from serving, so we need to
   explicitly include them by creating `_config.yml` at the top level of the
   Github repository having the following content

   ```yaml
   include: [".well-known"]
   ```

## Riot/Web

`riot-web` is a package already available within Nix packages which will take
care of getting the right release package along with signature verification. So we
can safely add the same to `systemPackages`  like this

```bash
 # /etc/nixos/configuration.nix

  environment = {
    systemPackages = with pkgs; [
        riot-web
    ];
  };

```

However, we need to let know Nix of the additional configuration required once
riot-web is setup. That we could do via _overlays_. This is another advantage of
declarative package management where we state in clear terms the state of our
system which also help us revert in case unexpected happens.

```bash
 # /etc/nixos/configuration.nix

  nixpkgs.overlays = [
    (self: super: {
        riot-web = super.riot-web.override {
            conf = {
                 default_server_config = {
                    "m.homeserver" = {
                        "base_url" = "https://matrix.dangerousdemos.net";
                        "server_name" = "dangerousdemos.net";
                    };
                    "m.identity_server" = {
                        "base_url" = "https://vector.im";
                    };
                 };

                 ## jitsi will be setup later,
                 ## but we need to add to Riot configuration
                 jitsi.preferredDomain = "jitsi.dangerousdemos.net";
            };
        };
    })
  ];

```

## Jitsi

Finally we head towards our last leg of configurations - setting up
`jitsi-meet`. Unfortunately, current master and stable channels of Nix packages
lack `jitsi-meet` and other supporting packages required to setup Jitsi.
However, it will change pretty soon thanks to the awesome work from user
[mmilata](https://github.com/mmilata) in this [pull
request](https://github.com/NixOS/nixpkgs/pull/82920). It's feature complete
and might come as part of the next Nix release (20.03). However, we can
already use the same via [NUR](https://github.com/nix-community/NUR).

```bash
 # /etc/nixos/configuration.nix

  imports =
    let
      nur-no-pkgs =
        import (
          builtins.fetchTarball
          "https://github.com/nix-community/NUR/archive/master.tar.gz"
        ) {};
    in
      [
        nur-no-pkgs.repos.mmilata.modules.jitsi-meet
      ];
```

The above import add only the new service to setup `jitsi-meet` without any
other OS specific stuff. And the configuration for the new service would
auto-magically setup the related software (like `videobridge` & `jicofo`) to have a functioning Jitsi, make sure
to add a new virtual host to the Nginx configuration with the Jitsi `hostName`
mentioned below, and enable LetsEncrypt certification for the same.

```bash
 # /etc/nixos/configuration.nix

  services.jitsi-meet = {
    enable = true;
    hostName = "jitsi.dangerousdemos.net";

    ## this setting is going to add relevant ports to
    ## networking.firewall.allowedTCPPorts &
    ## networking.firewall.allowedUDPPorts
    videobridge.openFirewall = true;
  };
```

## TURN server

`jitsi-meet` Debian package takes care of setting up TURN server but in our case
we need to take care of it ourselves. I followed the instructions mentioned in [this
documentation](https://github.com/matrix-org/synapse/blob/master/docs/turn-howto.md).
Nix already has a service configuration to setup `coturn`. Once set up, we will
integrate the relevant parts to Synapse (which we have already done above).


```bash
 # /etc/nixos/configuration.nix

  services.coturn = {
    enable = true;
    use-auth-secret = true;
    static-auth-secret = "XJmzTf6VixzX5pDZKHOxtiUenkKzr10tlhBWYoti5DvCxR4TM9XlRHxII3Ml6yV2";
    realm = "turn.dangerousdemos.net";
    no-tcp-relay = true;
    no-tls = true;
    no-dtls = true;
    extraConfig = ''
        user-quota=12
        total-quota=1200
        denied-peer-ip=10.0.0.0-10.255.255.255
        denied-peer-ip=192.168.0.0-192.168.255.255
        denied-peer-ip=172.16.0.0-172.31.255.255

        allowed-peer-ip=192.168.191.127
    '';
  };
```

`static-auth-secret` generated above is via the tool `pwgen` which in Nix we
could do like this

```bash
$ nix-shell -p pwgen --command "pwgen -s 64 1"
XJmzTf6VixzX5pDZKHOxtiUenkKzr10tlhBWYoti5DvCxR4TM9XlRHxII3Ml6yV2
```

## Conclusion

Once we have [all the above configuration in place](https://gist.github.com/kaychaks/c1a79aef68c32818dec7540412c9ee4b), now is the time to finally run them
all. This will take time to get all the necessary stuff downloaded and setup.

```bash
$ sudo nixos-rebuild switch
```

However, once its done you can launch Riot/Web, register a new user, create a room
with someone else from the same MatrixVerse, have end-to-end encrypted conversation,
and also start having a video call via Jitsi. All that infrastructure now
being 100% owned by you with a protocol enforcing privacy and decentralisation.
And finally every piece here is fully open-source.

In these times of covert and overt surveillance its imperative to take matters
at your hand. And when right tools make it simple to set them up and easy to
reason their behavior, it's a nice feeling.
