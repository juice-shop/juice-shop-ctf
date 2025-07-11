module.exports = {
  extends: [
    'standard-with-typescript'
  ],
  plugins: ['@typescript-eslint'],
  env: {
    node: true
  },
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    project: './tsconfig.json'
  },
  ignorePatterns: [
    '.eslintrc.js',
    'build/**',
    'node_modules/**',
    '.nyc_output/**',
    'dist/**',
    ''
  ]
}
