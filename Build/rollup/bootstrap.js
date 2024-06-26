import terser from '@rollup/plugin-terser';

export default {
  input: 'node_modules/bootstrap/dist/js/bootstrap.esm.js',
  output: {
    file: '../typo3/sysext/core/Resources/Public/JavaScript/Contrib/bootstrap.js',
    format: 'esm',
  },
  plugins: [
    terser({ ecma: 8 }),
    {
      name: 'externals',
      resolveId: (source) => {
        if (source === '@popperjs/core') {
          return { id: 'node_modules/@popperjs/core/dist/esm/index.js' }
        }
        return null
      }
    }
  ],
};
