module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: { experimentalDecorators: true, emitDecoratorMetadata: true, strict: false, target: 'ES2022', module: 'commonjs' } }]
  }
};
