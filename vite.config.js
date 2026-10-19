import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'// or similar react plugin

export default defineConfig({
  plugins: [react()],
  base: '/Visualise_Regressions/', // 👈 ADD THIS LINE (include the slashes!)
})