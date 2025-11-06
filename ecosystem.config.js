module.exports = {
  apps: [
    {
      name: "frontend",
      cwd: "./apps/nextjs",
      script: "pnpm start"
    },
    {
      name: "websocket",
      cwd: "./apps/nextjs",
      script: "pnpm start:ws"
    }
  ]
}
