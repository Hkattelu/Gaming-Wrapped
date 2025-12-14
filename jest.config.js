module.exports = {
  // Use jsdom so DOM-based tests (e.g., React components) can run
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Minimal mock for next/server so route handlers can be imported in Jest without Web Request globals
    '^next/server$': '<rootDir>/src/lib/__mocks__/next-server.ts',
    '^@genkit-ai/googleai$': '<rootDir>/src/lib/__mocks__/googleai.ts',
  },
  transform: {
    '^.+\.(ts|tsx)$': ["babel-jest", { "configFile": "./babel.config.test.js" }]
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
};
