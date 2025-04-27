// Mock environment variables for testing
process.env.SECRET_ACCESS_KEY = "test_access_secret";
process.env.SECRET_REFRESH_KEY = "test_refresh_secret";

// Silence logger during tests
jest.mock("./src/config/logger", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));
