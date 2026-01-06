{ pkgs, ... }: {
  channel = "stable-24.05";

  packages = [
    pkgs.nodejs_20
  ];

  idx.extensions = [
    "bradlc.vscode-tailwindcss"
    "esbenp.prettier-vscode"
    "dbaeumer.vscode-eslint"
  ];

  idx.previews = {
    previews = {
      web = {
        command = [
          "npm"
          "run"
          "dev"
          "--"
          "--port"
          "$PORT"
          "--host"
          "0.0.0.0"
        ];
        manager = "web";
        env = {
          VITE_SERVER_HMR_PROTOCOL = "wss";
          VITE_SERVER_HMR_HOST = "$CODE_WORKSPACE_DOMAIN";
          VITE_SERVER_HMR_PORT = "443";
        };
      };
    };
  };
}
