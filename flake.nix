{
  description = "Hakyll blog - kaushikc.org";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowBroken = true;
        };

        haskellPackages = pkgs.haskellPackages;

        blog-hakyll = haskellPackages.callCabal2nix "blog-hakyll" ./. {
          # regex-pcre needs pcre
        };

        # Site derivation - builds the actual static site
        site = pkgs.stdenv.mkDerivation {
          name = "kaushikc-org-site";
          src = pkgs.lib.cleanSource ./.;

          buildInputs = [ blog-hakyll ];

          LANG = "en_US.UTF-8";
          LOCALE_ARCHIVE = pkgs.lib.optionalString pkgs.stdenv.isLinux
            "${pkgs.glibcLocales}/lib/locale/locale-archive";

          buildPhase = ''
            export LC_ALL=en_US.UTF-8
            site build
          '';

          installPhase = ''
            mkdir -p $out
            cp -r site/* $out/
            cp static/* $out/ 2>/dev/null || true
          '';
        };

      in {
        packages = {
          default = site;
          site-generator = blog-hakyll;
        };

        devShells.default = haskellPackages.shellFor {
          packages = p: [ blog-hakyll ];
          buildInputs = with pkgs; [
            haskellPackages.cabal-install
            haskellPackages.haskell-language-server
            haskellPackages.hlint
            pcre
          ];
        };
      });
}
