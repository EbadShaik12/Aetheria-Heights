import app, { connectDB } from '../server.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB connection failed in handler:', err.message);
    return res.status(500).json({
      error: 'Database connection failed',
      details: err.message
    });
  }
  return app(req, res);
}
