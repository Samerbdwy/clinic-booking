// Entry point for running the API as a Vercel serverless function (no credit card needed).
import mongoose from 'mongoose';
import app from '../src/app.js';
import { config } from '../src/config.js';

// Reuse one database connection between requests on a warm function instance.
let connecting = null;
function connect() {
  if (!connecting) {
    connecting = mongoose
      .connect(config.mongoUri, { maxPoolSize: 5, serverSelectionTimeoutMS: 8000 })
      .catch((err) => {
        connecting = null; // allow a retry on the next request
        throw err;
      });
  }
  return connecting;
}

export default async function handler(req, res) {
  // The health check works even if the database is down, which helps when debugging.
  if (!req.url.startsWith('/api/health')) {
    try {
      if (!config.mongoUri) throw new Error('MONGODB_URI is not set');
      await connect();
    } catch (err) {
      console.error('Database connection failed:', err.message);
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ error: 'Service unavailable' }));
    }
  }
  return app(req, res);
}