import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Sem o prefixo VITE_, a chave fica só no servidor e nunca vai para o navegador
  const env = loadEnv(mode, process.cwd(), '')

  const proxy = {
    '/api/pix/generate': {
      target: 'https://apipix-delta.vercel.app',
      changeOrigin: true,
      rewrite: () => '/api/pix2/generate',
      headers: { 'api-key': env.PIX_API_KEY },
    },
  }

  return {
    plugins: [react()],
    server: { proxy },
    preview: { proxy },
  }
})
