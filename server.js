import express from "express";
import httpProxy from "http-proxy";

const TARGET = process.env.TARGET || "http://masterthesis-backend-lb-1641888944.eu-central-1.elb.amazonaws.com:8080";

const app = express();
const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  ignorePath: false
});

const API_PREFIX = "/api";

// /api/* -> TARGET/api/*
app.use(API_PREFIX, (req, res) => {
  // Wichtig: Express entfernt den Mount-Pfad. Also wieder /api davor setzen:
  req.url = API_PREFIX + req.url;   // z.B. aus "/login" wird "/api/login"

  proxy.web(req, res, { target: TARGET }, (err) => {
    console.error("proxy error:", err);
    res.statusCode = 502;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: "proxy_failed", detail: String(err) }));
  });
});

// Healthcheck
app.get("/", (_req, res) => res.json({ ok: true, target: TARGET }));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`proxy up on ${PORT}, target=${TARGET}`));