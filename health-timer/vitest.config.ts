import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@renderer': resolve(__dirname, 'src/renderer/src')
    }
  },
  test: {
    css: {
      modules: {
        classNameStrategy: 'non-scoped'
      }
    },
    environment: 'node',
    environmentMatchGlobs: [
      ['src/renderer/src/**/*.test.tsx', 'jsdom'],
    ],
    include: ['src/renderer/src/**/*.test.{ts,tsx}']
  }
})
