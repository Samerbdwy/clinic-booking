import mongoose from 'mongoose';
import { config, assertConfig } from './config.js';
import app from './app.js';

assertConfig();

mongoose
  .connect(config.mongoUri)
  .then(() => {
    app.listen(config.port, () => console.log(`API running on port ${config.port}`));
  })
  .catch((err) => {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1);
  });
