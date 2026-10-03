import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  clinicTz: process.env.CLINIC_TZ || 'Africa/Cairo',
};

// Fail fast on startup instead of running with unsafe defaults.
export function assertConfig() {
  const problems = [];
  if (!config.mongoUri) problems.push('MONGODB_URI is missing');
  if (!config.jwtSecret || config.jwtSecret.length < 32) {
    problems.push('JWT_SECRET must be at least 32 characters');
  }
  if (problems.length) {
    console.error('Configuration error:\n- ' + problems.join('\n- '));
    process.exit(1);
  }
}
