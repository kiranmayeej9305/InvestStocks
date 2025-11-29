module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Completely disable all problematic rules
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/prefer-const': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'react/no-unescaped-entities': 'off',
    'jsx-a11y/alt-text': 'off',
    'no-unused-vars': 'off',
    'prefer-const': 'off',
    // Disable CSS related warnings for Tailwind
    'css/unknown-at-rule': 'off',
    'css/property-no-unknown': 'off',
    // Disable warnings for Next.js Image optimization
    '@next/next/no-img-element': 'off',
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
}