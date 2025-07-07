import { Github } from '../icons/Github'
import { Support } from '../icons/Support'
import { Settings } from '../icons/Settings'
import { createSignal, onMount } from 'solid-js'
export const NavBar = () => {
  const [stars, setStars] = createSignal(0)

  onMount(async () => {
    const response = await fetch('https://api.github.com/repos/nachinsec/MemoryShell')
    const data = await response.json()
    setStars(data.stargazers_count)
  })

  const formatStars = () => {
    const num = stars()
    if (num < 1000) return num
    return (num / 1000).toFixed(1) + 'k'
  }
  return (
    <div class="fixed top-0 right-0 flex justify-end gap-3 m-4 z-50 bg-transparent items-center">
      <button
        title="Settings"
        class="hover:drop-shadow-[0_0_8px_var(--color-neon-blue)] transition"
      >
        <Settings width={24} height={24} color="white" />
      </button>
      <a
        href="https://github.com/nachinsec/MemoryShell"
        target="_blank"
        rel="noopener noreferrer"
        title="GitHub"
        class="hover:drop-shadow-[0_0_8px_var(--color-neon-blue)] transition flex"
      >
        <Github width={24} height={24} color="white" />
        <span class="text-white">{formatStars()}</span>
      </a>
      <a
        href="https://github.com/nachinsec/MemoryShell"
        target="_blank"
        rel="noopener noreferrer"
        title="GitHub"
        class="hover:drop-shadow-[0_0_8px_var(--color-neon-blue)] transition flex bg-white p-2 rounded-full items-center"
      >
        <Support width={20} height={20} color="black" />
        <p class="text-sm ml-2">Support</p>
      </a>
    </div>
  )
}
