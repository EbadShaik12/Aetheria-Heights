import app, { connectDB } from '../server.js';

// Wrap the Express app to ensure DB is connected before every request
export default async function handler(req, res) {
  await connectDB();
  return app(req, res);
}
