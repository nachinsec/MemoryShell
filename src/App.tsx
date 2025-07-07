import Terminal from './components/Terminal'
import { NavBar } from './components/NavBar'

export default function App() {
  return (
    <>
      <NavBar />
      <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-black via-gray-900 to-[var(--color-gradient-from)]">
        <header class="mb-8 text-center">
          <h1 class="text-4xl font-bold tracking-widest text-[var(--color-neon)] drop-shadow-neon">
            MemoryShell
          </h1>
          <p class="text-[var(--color-neon-blue)] text-lg mt-2">Your terminal fast and private.</p>
        </header>
        <Terminal />
        <footer class="mt-8 text-xs text-gray-500">
          © 2025 Nachinsec •{' '}
          <a href="https://github.com/nachinsec" class="underline">
            GitHub
          </a>
        </footer>
      </div>
    </>
  )
}
