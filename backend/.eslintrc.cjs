module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  extends: [
    '../.eslintrc.base.cjs',
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
    'prefer-const': 'warn',
    'no-var': 'warn',
    eqeqeq: ['warn', 'always'],
    'no-empty': 'warn',
    'no-duplicate-imports': 'error',
    'no-shadow': 'warn',
  },
  ignorePatterns: ['node_modules/', 'dist/', 'coverage/'],
};
