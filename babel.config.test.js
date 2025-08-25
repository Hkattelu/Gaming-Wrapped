module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    // Enable JSX/TSX transform for React components in tests
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
};
