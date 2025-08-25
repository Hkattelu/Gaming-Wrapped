// jest.setup.js

// Mock process.env for testing
process.env.HOST_URL = 'test.vercel.app';
process.env.NEXT_PUBLIC_API_PORT = '3000';

// Enable React 18/19 act() behavior in this non-RTL setup
// See https://react.dev/warnings/react-dom-test-utils
// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Ensure Web Fetch API classes are available globally for modules like `next/server`
// Node 18+ provides these via undici, but some Jest environments may not expose them.
try {
  const { Request, Response, Headers, FormData, fetch } = require('undici');
  if (typeof global.Request === 'undefined') global.Request = Request;
  if (typeof global.Response === 'undefined') global.Response = Response;
  if (typeof global.Headers === 'undefined') global.Headers = Headers;
  if (typeof global.FormData === 'undefined') global.FormData = FormData;
  if (typeof globalThis.Request === 'undefined') globalThis.Request = Request;
  if (typeof globalThis.Response === 'undefined') globalThis.Response = Response;
  if (typeof globalThis.Headers === 'undefined') globalThis.Headers = Headers;
  if (typeof globalThis.FormData === 'undefined') globalThis.FormData = FormData;
  // Don't overwrite test-specific fetch mocks; only polyfill if missing
  if (typeof global.fetch === 'undefined') global.fetch = fetch;
  if (typeof globalThis.fetch === 'undefined') globalThis.fetch = fetch;
} catch {
  // If undici isn't available, ignore; individual tests often mock fetch anyway.
}
