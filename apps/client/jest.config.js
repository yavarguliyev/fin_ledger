const TS_JEST_OPTIONS = {
  tsconfig: { experimentalDecorators: true, emitDecoratorMetadata: true, strict: false, target: 'ES2022', module: 'commonjs', allowJs: true }
};

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'test',
  setupFiles: ['<rootDir>/setup/angular.setup.ts', '<rootDir>/setup/local-storage.setup.ts'],
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['ts', 'mjs', 'js', 'json'],
  transform: {
    '^.+\\.(ts|mjs|js)$': ['ts-jest', TS_JEST_OPTIONS]
  },
  transformIgnorePatterns: ['/node_modules/(?!(@angular|rxjs|tslib|uuid)/)']
};
