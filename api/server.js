#!/usr/bin/env node

/**
 * Local development server for the Curio API.
 *
 * Wraps the Vercel serverless function so you can test it locally
 * without deploying or installing the Vercel CLI.
 *
 * Usage:
 *   export OPENAI_API_KEY="sk-..."
 *   node api/server.js
 *
 * Or with a .env file in the project root:
 *   npm run api
 */

const http = require('http');
const path = require('path');

// Load .env file from project root if it exists
try {
  const envPath = path.join(__dirname, '..', '.env');
  const fs = require('fs');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
} catch { /* no .env file — rely on exported env vars */ }

const handler = require('./generate');

const PORT = process.env.API_PORT || 3000;

const server = http.createServer(async (req, res) => {
  // Only handle /api/generate (strip path prefix for flexibility)
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname !== '/api/generate') {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found. Use POST /api/generate' }));
    return;
  }

  // Parse body for POST requests
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    await new Promise(resolve => req.on('end', resolve));
    try {
      req.body = JSON.parse(body);
    } catch {
      req.body = {};
    }
  }

  // Adapt Node http response to look like Vercel's
  const vercelRes = {
    _statusCode: 200,
    _headers: {},
    _body: null,
    setHeader(key, val) { this._headers[key] = val; },
    status(code) { this._statusCode = code; return this; },
    json(data) { this._body = JSON.stringify(data); this._done = true; },
    end() { this._done = true; },
  };

  try {
    await handler(req, vercelRes);
  } catch (err) {
    vercelRes._statusCode = 500;
    vercelRes._body = JSON.stringify({ error: err.message });
  }

  // Write real response
  for (const [k, v] of Object.entries(vercelRes._headers)) {
    res.setHeader(k, v);
  }
  res.setHeader('Content-Type', 'application/json');
  res.writeHead(vercelRes._statusCode);
  res.end(vercelRes._body || '');
});

server.listen(PORT, () => {
  const hasKey = !!process.env.OPENAI_API_KEY;
  console.log(`\n🚀 Curio API server running at http://localhost:${PORT}`);
  console.log(`   POST http://localhost:${PORT}/api/generate`);
  console.log(`   OpenAI key: ${hasKey ? '✅ loaded' : '❌ missing — set OPENAI_API_KEY'}\n`);
  if (!hasKey) {
    console.log('   Create a .env file in the project root:');
    console.log('   OPENAI_API_KEY=sk-...\n');
  }
});
