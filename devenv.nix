{ pkgs, lib, config, inputs, ... }:

{
  cachix.enable = false;
  languages.typescript.enable = true;
  languages.javascript = {
    enable = true;
    pnpm.enable = true;
    package = pkgs.nodejs_latest;
  };
}
