// force timezone to UTC to allow tests to work regardless of local timezone
// generally used by snapshots, but can affect specific tests
process.env.TZ = 'UTC';

const baseConfig = require('./.config/jest.config');

module.exports = {
  // Jest configuration provided by Grafana scaffolding
  ...baseConfig,

  // The scaffolded transform compiles JSX with the classic runtime, which needs
  // `React` in scope. tsconfig and webpack use the automatic runtime, so the
  // source files don't import React; match that here.
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        sourceMaps: 'inline',
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
            decorators: false,
            dynamicImport: true,
          },
          transform: {
            react: { runtime: 'automatic' },
          },
        },
      },
    ],
  },
};
