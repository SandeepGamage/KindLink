/**
 * Centralized JWT configuration and startup validation.
 * Ensures the service fails fast with a clear fatal diagnostic if JWT_SECRET
 * is missing, preventing an apparently healthy service whose authentication paths fail later.
 */

const validateStartupConfig = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || !secret.trim()) {
    throw new Error('FATAL: JWT_SECRET environment variable is missing or empty. Authentication requires a secure secret.');
  }
};

const getJwtSecret = () => {
  validateStartupConfig();
  return process.env.JWT_SECRET;
};

module.exports = {
  validateStartupConfig,
  getJwtSecret,
};
