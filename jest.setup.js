import '@testing-library/jest-dom';

// Polyfill for Next.js API routes testing
global.Request = global.Request || class Request {};
global.Response = global.Response || class Response {};
global.Headers = global.Headers || class Headers {};
global.fetch = global.fetch || jest.fn();
