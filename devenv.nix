{ pkgs, lib, config, inputs, ... }:

{
  languages.javascript.enable = true;
  languages.javascript.pnpm.enable = true;
  languages.javascript.npm.enable = true;

  languages.haskell.enable = true;
  languages.haskell.cabal.enable = true;
  
  packages = [ pkgs.pcre ];
}
