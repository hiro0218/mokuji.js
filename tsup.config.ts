import { defineConfig } from 'tsup';

export default defineConfig((options) => {
  return {
    entry: ['src/index.ts'],
    target: 'es2020',
    format: ['esm'],
    sourcemap: true,
    minify: !options.watch,
    treeshake: true,
    clean: true,
    dts: true,
  };
});
