import path from 'path';

export default {
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      reporter: ['text'],
      include: ['src/{common,pegin}/{providers,services,utils}/*.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
};
