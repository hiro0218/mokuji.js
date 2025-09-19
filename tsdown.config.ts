import { defineConfig } from 'tsdown';

export default defineConfig((options) => {
  return {
    entry: ['src/index.ts'],
    target: 'es2022',
    format: ['esm'],
    sourcemap: true,
    minify: !options.watch,
    treeshake: true,
    clean: true,
    dts: true,
    exports: true,
  };
});
