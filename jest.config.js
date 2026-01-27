module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/nodes'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'nodes/**/*.ts',
    '!nodes/**/*.test.ts',
    '!nodes/**/__tests__/**',
    '!nodes/**/types.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/nodes/$1',
  },
};
