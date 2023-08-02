import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: ['.png','.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  build: {
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [
        "vue",
      ],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: "Vue",
        },
      },
    }
  }
  // css: {
  //   preprocessorOptions: {
  //     scss: {
  //       additionalData: `@import "@/common/styles/main.scss";`,
  //     }
  //   }
  // },
})
