{
# bootstrap ? import <nixpkgs> {},
compiler ? "ghc883", doBenchmark ? false }:

let

  # fetcher = { owner, repo, rev, sha256, ... }: builtins.fetchTarball {
  #         inherit sha256;
  #         url = "https://github.com/${owner}/${repo}/archive/${rev}.tar.gz";
  # };

  # inherit (bootstrap) lib;

  # versions = lib.mapAttrs
  #          (_:fetcher)
  #          (builtins.fromJSON (builtins.readFile ./versions.json));

  # pkgs = import versions.nixpkgs {};

  sources = import ./nix/sources.nix;
  haskellNix = import sources."haskell.nix" { };
  nixpkgsSrc = haskellNix.sources.nixpkgs-2003;
  # nixpkgs = import sources.nixpkgs haskellNix.nixpkgsArgs;
  nixpkgs = import nixpkgsSrc haskellNix.nixpkgsArgs;
  haskell = nixpkgs.haskell-nix;

  project = haskell.cabalProject {
    src = haskell.haskellLib.cleanGit {
      name = "blog-hakyll";
      src = ./.;
    };
    compiler-nix-name = compiler;
    configureArgs = "";
    modules = [ ];
    index-state = "2020-07-05T00:00:00Z";
    plan-sha256 = "1v71yj9zwcblcvk55zpzrb11nixp0hkyq0rb1pnz4c5878v4aygd";
    materialized = ./blog-hakyll.materialized;
  };

  site = nixpkgs.stdenv.mkDerivation {
    name = "blog-hakyll-0.1.0.0";

    src = nixpkgs.lib.cleanSource ./public;
    LANG = "en_US.UTF-8";

    buildInputs = [ project.blog-hakyll.components.exes.site ];

    preConfigure = ''
      export LOCALE_ARCHIVE="${nixpkgs.glibcLocales}/lib/locale/locale-archive"
      export LANG="en_US.UTF-8"
      export LC_CTYPE="en_US.UTF-8"
    '';

    buildPhase = ''
      site build
    '';

    installPhase = ''
      cp -r _site $out
    '';
  };

  siteShell = project.shellFor {
    packages = ps: [ ps.blog-hakyll ];
    withHoogle = true;
    tools = {
      cabal = "3.2.0.0";
      hlint = "3.1.6";
    };
    buildInputs = with nixpkgs.haskellPackages; [ ghcid ];
    exactDeps = true;
  };

in if nixpkgs.lib.inNixShell then
  siteShell
else
  site

  #   f = { mkDerivation, aeson, base, bytestring, containers, hakyll
  #       , lens, lens-aeson, mtl, regex-pcre, stdenv, text, time
  #       , time-locale-compat, vector
  #       }:
  #       mkDerivation {
  #         pname = "blog-hakyll";
  #         version = "0.1.0.0";
  #         src = ./.;
  #         isLibrary = false;
  #         isExecutable = true;
  #         executableHaskellDepends = [
  #           aeson base bytestring containers hakyll lens lens-aeson mtl
  #           regex-pcre text time time-locale-compat vector
  #         ];
  #         executableSystemDepends = if pkgs.stdenv.isDarwin then [ pkgs.darwin.apple_sdk.frameworks.Cocoa pkgs.cabal-install ] else [ pkgs.cabal-install ];
  #         license = stdenv.lib.licenses.unfree;
  #         hydraPlatforms = stdenv.lib.platforms.none;
  #       };

  #   haskellPackages = if compiler == "default"
  #                        then pkgs.haskellPackages
  #                        else pkgs.haskell.packages.${compiler};

  #   variant = if doBenchmark then pkgs.haskell.lib.doBenchmark else pkgs.lib.id;

  #   drv = variant (haskellPackages.callPackage f {});

  # in

  #   if pkgs.lib.inNixShell then drv.env else drv
