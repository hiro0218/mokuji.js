import { defineConfig } from 'tsup';

export default defineConfig((options) => {
  return {
    entry: ['src/index.ts'],
    target: 'es2024',
    format: ['esm', 'cjs'],
    sourcemap: true,
    minify: !options.watch,
    treeshake: true,
    clean: true,
    dts: true,
    splitting: false,
    esbuildOptions(options) {
      options.banner = {
        js: '/**\n * mokuji.js - A table of content JavaScript Library\n * @license MIT\n * @author hiro\n * @repository https://github.com/hiro0218/mokuji.js\n */',
      };
    },
  };
});
