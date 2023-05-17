const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig.json')
const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  preset: '@shelf/jest-dynamodb',
  transform: {
    ...tsjPreset.transform,
    '^.+\\.tsx?$': 'ts-jest'
  },
  setupFilesAfterEnv: ["./test-utils/setup.ts"],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>" }),
    "@stub": ["<rootDir>/test-utils/stub"]
  },
};
