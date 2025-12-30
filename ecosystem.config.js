module.exports = {
  apps: [
    {
      name: "cron",
      cwd: "./apps/cron",
      script: "pnpm start"
    },
    {
      name: "frontend",
      cwd: "./apps/nextjs",
      script: "pnpm start"
    },
    {
      name: "preview",
      cwd: "./apps/preview",
      script: "pnpm start"
    },
    {
      name: "websocket",
      cwd: "./apps/nextjs",
      script: "pnpm start:ws"
    }
  ]
}
