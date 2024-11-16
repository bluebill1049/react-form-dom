module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      'babel-plugin-react-compiler',
      {
        target: '18',
        sources: (filename) => {
          return filename.includes('__tests__');
        },
      },
    ],
  ],
};
