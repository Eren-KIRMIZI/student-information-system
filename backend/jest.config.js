export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/utils/**/*.js',
    'src/repositories/**/*.js',
    'src/services/**/*.js',
    '!src/queue/worker.js',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  extensionsToTreatAsEsm: [],
};
