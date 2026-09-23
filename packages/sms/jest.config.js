module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  moduleNameMapper: {
    '^@common/shared-libs$': '<rootDir>/../../shared-libs/src'
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: { experimentalDecorators: true, emitDecoratorMetadata: true, strict: false } }]
  }
};
