import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        patoline: resolve(__dirname, 'my/patoline.html'),
        gen_shape: resolve(__dirname, 'my/gen_shape.html'),
        chroma: resolve(__dirname, 'my/chroma_color_tools.html'),
        ribbon: resolve(__dirname, 'my/linguistic_ribbon_editor.html'),
        barcode: resolve(__dirname, 'my/barcode_generator.html'),
        wb: resolve(__dirname, 'my/WB XLSX CSV Sanitizer.html'),
        world_clock: resolve(__dirname, 'my/world_clock.html')
      }
    }
  }
})
