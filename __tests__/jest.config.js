/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

module.exports = {
  globals: {
    "ts-jest": {
      tsconfig: "./tsconfig.json",
      isolatedModules: true,
    },
  },
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["/node_modules/"],
  coverageProvider: "v8",
  coverageReporters: ["json", "text", "lcov", "clover"],
  testEnvironment: "node",
  preset: "ts-jest",
  testMatch: ["**/__tests__/**/*.(spec|test).ts?(x)"],
  testPathIgnorePatterns: ["/node_modules/"],
  timers: "real",
};
