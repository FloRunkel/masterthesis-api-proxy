import express from "express";
import httpProxy from "http-proxy";

const TARGET = process.env.TARGET || "http://masterthesis-backend-lb-1641888944.eu-central-1.elb.amazonaws.com:8080";

const app = express();
const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  ignorePath: false
});

// CORS-Middleware hinzufügen
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Preflight-Requests behandeln
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Healthcheck - muss VOR dem allgemeinen Routing stehen
app.get("/", (_req, res) => res.json({ ok: true, target: TARGET }));

// Alle Requests weiterleiten (einschließlich /api/* und alle anderen)
app.use("*", (req, res) => {
  console.log(`Proxying ${req.method} ${req.url} to ${TARGET}`);
  
  proxy.web(req, res, { target: TARGET }, (err) => {
    console.error("proxy error:", err);
    res.statusCode = 502;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: "proxy_failed", detail: String(err) }));
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`proxy up on ${PORT}, target=${TARGET}`));