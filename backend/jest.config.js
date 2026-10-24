module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  passWithNoTests: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts'],
};