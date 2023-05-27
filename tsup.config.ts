import { defineConfig } from 'tsup';

export default defineConfig((options) => {
  return {
    target: 'es2020',
    format: ['cjs', 'esm'],
    sourcemap: true,
    minify: !options.watch,
    clean: true,
    dts: true,
  };
});
