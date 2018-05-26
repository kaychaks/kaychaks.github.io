{ mkDerivation, aeson, base, bytestring, containers, hakyll, lens
, lens-aeson, mtl, regex-pcre, stdenv, text, time
, time-locale-compat, vector
}:
mkDerivation {
  pname = "blog-hakyll";
  version = "0.1.0.0";
  src = ./.;
  isLibrary = false;
  isExecutable = true;
  executableHaskellDepends = [
    aeson base bytestring containers hakyll lens lens-aeson mtl
    regex-pcre text time time-locale-compat vector
  ];
  executableSystemDepends = [pkgs.darwin.apple_sdk.frameworks.Cocoa];
  license = stdenv.lib.licenses.unfree;
  hydraPlatforms = stdenv.lib.platforms.none;
}
