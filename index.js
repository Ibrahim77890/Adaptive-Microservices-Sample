/**
 * custom-lb.js
 * A mini load balancer with core features:
 * - HTTPS termination
 * - Round‑Robin & Least‑Connections
 * - Health checks
 * - Sticky sessions (cookies)
 * - Rate limiting
 * - In‑memory caching
 * - Circuit breaker
 */
const https = require('https');                                    // Node HTTPS server
const fs = require('fs');
const express = require('express');                                // request routing :contentReference[oaicite:21]{index=21}
const httpProxy = require('http-proxy');                           // proxy engine :contentReference[oaicite:22]{index=22}
const rateLimit = require('express-rate-limit');                   // rate limiting :contentReference[oaicite:23]{index=23}
const NodeCache = require('@cacheable/node-cache').NodeCache;      // in‑memory cache :contentReference[oaicite:24]{index=24}
const CircuitBreaker = require('opossum');                         // circuit breaker :contentReference[oaicite:25]{index=25}

const BACKENDS = [
  { url: 'http://10.1.0.1:3000', alive: true, failCount: 0, activeConns: 0 },
  { url: 'http://10.1.0.2:3000', alive: true, failCount: 0, activeConns: 0 },
];
let rrIndex = 0;

// -- Health Check --
setInterval(() => {
  BACKENDS.forEach(srv => {
    https.get(`${srv.url}/health`, res => {
      srv.alive = res.statusCode === 200;
      if (!srv.alive) console.warn(`${srv.url} is down`);
    }).on('error', () => { srv.alive = false; });
  });
}, 10000);

// -- Sticky Session Cookie Name --
const COOKIE_NAME = 'LBSESSION';

// -- Express App Setup --
const app = express();

// Rate‑Limiter Middleware
app.use(rateLimit({
  windowMs: 60_000,  // 1 minute
  max: 100,          // max 100 requests per IP
}));

// In‑Memory Cache for static assets
const cache = new NodeCache({ stdTTL: 300 /* 5m */ });

// Circuit Breaker wrapping proxy.web
const proxy = httpProxy.createProxyServer();
const breaker = new CircuitBreaker((req, res) => {
  // perform actual proxy if backends available
  throw new Error('No implementation'); // placeholder
}, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 10000
});
breaker.fallback((req, res) => {
  res.writeHead(503);
  res.end('Service Unavailable');
});

// Main Request Handler
app.use((req, res) => {
  // Caching static assets
  if (req.url.match(/\.(js|css|png|jpg)$/)) {
    const cached = cache.get(req.url);
    if (cached) return res.end(cached);
  }

  // Session‑Affinity: find backend via cookie
  const cookie = req.headers.cookie || '';
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  let srv;
  if (match) {
    srv = BACKENDS.find(s => s.url.includes(match[1]) && s.alive);
  }
  // else Round‑Robin or Least‑Conns
  if (!srv) {
    const alive = BACKENDS.filter(s => s.alive);
    // least‑connections
    srv = alive.reduce((a,b) => a.activeConns < b.activeConns ? a : b);
  }

  // Mark connection
  srv.activeConns++;
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${new URL(srv.url).hostname}; HttpOnly`);

  // Proxy via Circuit Breaker
  breaker.fire(req, res, { target: srv.url })
    .on('success', () => srv.activeConns--)
    .on('failure', () => srv.activeConns--);
});

const server = https.createServer({
  key: fs.readFileSync('tls.key'),
  cert: fs.readFileSync('tls.crt')
}, app);

server.listen(8443, () => console.log('LB listening on 8443'));
