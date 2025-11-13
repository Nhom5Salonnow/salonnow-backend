module.exports = {
  apps: [{
    name: "demo-backend",
    script: "dist/main.js",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M'
  }]
};