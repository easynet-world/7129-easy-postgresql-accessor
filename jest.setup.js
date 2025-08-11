// Load environment variables for testing
require('dotenv').config({ path: '.env.test' });

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  debug: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
