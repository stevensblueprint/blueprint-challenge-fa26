module.exports = {
  testEnvironment: "jsdom",
  roots: ["<rootDir>/src"],
  setupFilesAfterEnv: ["<rootDir>/src/test/setupTests.ts"],
  testMatch: ["**/*.test.ts", "**/*.test.tsx"],
  transform: {
    "^.+\\.(ts|tsx|js)$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.jest.json",
      },
    ],
  },
  transformIgnorePatterns: ["/node_modules/(?!reicon-react/)"],
  moduleNameMapper: {
    "^reicon-react/icons/(.*)$": "<rootDir>/node_modules/reicon-react/icons/$1.js",
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
  },
};
