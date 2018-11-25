{ nixpkgs ? import <nixpkgs> {}, compiler ? "default", doBenchmark ? false }:

let

  inherit (nixpkgs) pkgs;

  f = { mkDerivation, aeson, base, bytestring, containers, hakyll
      , lens, lens-aeson, mtl, regex-pcre, stdenv, text, time
      , time-locale-compat, vector
      }:
      mkDerivation {
        pname = "blog-hakyll";
        version = "0.1.0.0";
        allowUnfree = true;
        src = ./.;
        isLibrary = false;
        isExecutable = true;
        executableHaskellDepends = [
          aeson base bytestring containers hakyll lens lens-aeson mtl
          regex-pcre text time time-locale-compat vector
        ];
        executableSystemDepends = if pkgs.stdenv.isDarwin then [pkgs.darwin.apple_sdk.frameworks.Cocoa] else [];
        license = stdenv.lib.licenses.unfree;
        hydraPlatforms = stdenv.lib.platforms.none;
      };

  haskellPackages = if compiler == "default"
                       then pkgs.haskellPackages
                       else pkgs.haskell.packages.${compiler};

  variant = if doBenchmark then pkgs.haskell.lib.doBenchmark else pkgs.lib.id;

  drv = variant (haskellPackages.callPackage f {});

in

  if pkgs.lib.inNixShell then drv.env else drv
