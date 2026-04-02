// Proxy para desarrollo local - redirige /api al backend que elijas
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

console.log(`\n Proxy configurado: /api → ${BACKEND_URL}\n`);

module.exports = {
  "/api": {
    target: BACKEND_URL,
    secure: false,
    changeOrigin: true,
    logLevel: "debug"
  }
};