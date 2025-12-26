module.exports = {
  // Use jsdom so DOM-based tests (e.g., React components) can run
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Minimal mock for next/server so route handlers can be imported in Jest without Web Request globals
    '^next/server$': '<rootDir>/src/lib/__mocks__/next-server.ts',
    '^@genkit-ai/googleai$': '<rootDir>/src/lib/__mocks__/googleai.ts',
    // Force CJS build for cheerio to avoid ESM issues in Jest/jsdom
    '^cheerio$': '<rootDir>/node_modules/cheerio/dist/commonjs/index.js'
  },
  transform: {
    '^.+\.(ts|tsx)$': ["babel-jest", { "configFile": "./babel.config.test.js" }]
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
};
