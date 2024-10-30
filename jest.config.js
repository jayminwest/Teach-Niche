module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/src/tests/__mocks__/fileMock.js'
  },
  testMatch: [
    '<rootDir>/src/tests/**/*.test.js'
  ],
  collectCoverageFrom: [
    'src/components/**/*.{js,jsx}',
    '!src/components/**/*.d.ts'
  ]
}; 