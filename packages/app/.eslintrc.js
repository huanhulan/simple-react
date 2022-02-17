module.exports = {
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['**/*.spec.ts', '**/*.babel.ts'] },
    ],
  },
};
