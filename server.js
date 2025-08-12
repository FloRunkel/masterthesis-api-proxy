import express from "express";
import httpProxy from "http-proxy";

const TARGET = process.env.TARGET || "http://masterthesis-backend-lb-1641888944.eu-central-1.elb.amazonaws.com:8080";
const app = express();
const proxy = httpProxy.createProxyServer({ changeOrigin: true });

// /api/* -> TARGET/api/*
app.use("/api", (req, res) => {
  proxy.web(req, res, { target: TARGET }, (err) => {
    console.error("proxy error:", err);
    res.statusCode = 502;
    res.end(JSON.stringify({ error: "proxy_failed" }));
  });
});

app.get("/", (_req, res) => res.json({ ok: true, target: TARGET }));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`proxy up on ${PORT}, target=${TARGET}`));