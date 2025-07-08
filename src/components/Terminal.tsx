import { createSignal, onCleanup, createEffect, onMount } from 'solid-js'
import { plugins } from '../plugins'
import { COMMANDS } from '../constants/commands'
import { createPluginWorker } from '../plugins/worker'
import type { WorkerPluginHandle } from '../plugins/worker'
import { getAllPlugins } from '../utils/db'
import PluginLoaderForm from './PluginLoaderForm'
type HistoryEntry = {
  command: string
  output: string
}

export default function Terminal() {
  const [command, setCommand] = createSignal<string[]>([])
  const [commandIndex, setCommandIndex] = createSignal<number | null>(null)
  const [history, setHistory] = createSignal<HistoryEntry[]>([])
  const [externalPlugins, setExternalPlugins] = createSignal<WorkerPluginHandle[]>([])
  const [input, setInput] = createSignal('')
  let inputRef: HTMLInputElement | undefined
  let scrollRef: HTMLDivElement | undefined

  setTimeout(() => inputRef?.focus(), 100)

  onMount(async () => {
    const pluginsFromDB = await getAllPlugins()
    const loadedPlugins: WorkerPluginHandle[] = []
    for (const p of pluginsFromDB) {
      if (p.enabled) {
        try {
          const pluginHandle = await createPluginWorker(p.code)
          loadedPlugins.push(pluginHandle)
        } catch (e) {
          console.error('Error cargando plugin externo:', e)
        }
      }
    }
    setExternalPlugins(loadedPlugins)
  })
  const handleCommand = async (e: Event) => {
    e.preventDefault()
    const value = input().trim()
    if (!value) return
    console.log(value)
    for (const plugin of plugins) {
      console.log(plugin.name)
      if (plugin.onCommand) {
        const result = await plugin.onCommand(value, {
          addOutput: (text: string) => setHistory([...history(), { command: value, output: text }]),
          getState: () => ({}),
          setState: () => {},
        })
        if (result && result.output) {
          setHistory([...history(), { command: value, output: result.output }])
          setInput('')
          return
        }
      }
    }

    for (const plugin of externalPlugins()) {
      console.log(plugin.name)
      try {
        const result = await plugin.sendCommand(value)
        if (result && result.output) {
          setHistory([...history(), { command: value, output: result.output }])
          setInput('')
          return
        }
      } catch (err) {
        console.error('Plugin externo error:', err)
      }
    }

    if (value === COMMANDS.CLEAR) {
      setHistory([])
      setInput('')
      return
    }

    if (value === COMMANDS.HELP) {
      setHistory([
        ...history(),
        { command: value, output: `Commands: ${Object.values(COMMANDS).join(', ')}` },
      ])
      setCommand([...command(), value])
      setInput('')
      setCommandIndex(null)
      setTimeout(() => inputRef?.focus(), 50)
      return
    }

    console.log(value)
    setHistory([
      ...history(),
      { command: value, output: 'Command not recognized. Write "help" to see options.' },
    ])

    setCommand([...command(), value])
    setInput('')
    setCommandIndex(null)
    setTimeout(() => inputRef?.focus(), 50)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const hist = command()
      if (!hist.length) return
      const idx = commandIndex() === null ? hist.length - 1 : Math.max(0, commandIndex()! - 1)
      setInput(hist[idx])
      setCommandIndex(idx)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const hist = command()
      if (!hist.length) return
      if (commandIndex() === null) return
      const idx = commandIndex() === null ? hist.length : commandIndex()! + 1
      if (idx === hist.length) {
        setInput('')
        setCommandIndex(null)
      } else {
        setInput(hist[idx])
        setCommandIndex(idx)
      }
    }
  }

  createEffect(() => {
    history()
    if (!scrollRef) return
    scrollRef.scrollTop = scrollRef.scrollHeight
  })

  onCleanup(() => {
    /* nada por ahora */
    externalPlugins().forEach((p) => p.terminate())
  })

  return (
    <>
      <PluginLoaderForm
        onPluginLoaded={(pluginHandle: WorkerPluginHandle) =>
          setExternalPlugins([...externalPlugins(), pluginHandle])
        }
      />
      <div class="bg-black text-[var(--color-neon)] p-6 rounded-xl shadow-2xl font-mono max-w-2xl mx-auto terminal-border terminal-scanlines text-left relative min-w-[20rem] xs:max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl w-full">
        <div
          ref={(el) => (scrollRef = el)}
          class="overflow-y-auto h-72 mb-4 pr-2 terminal-scrollbar"
        >
          {history().map((entry, _) => (
            <div class="mb-2">
              <span class="text-[var(--color-neon-pink)] font-bold">$</span>
              <span class="ml-2">{entry.command}</span>
              <div class="ml-6 whitespace-pre-line text-[var(--color-neon-blue)]">
                {entry.output}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleCommand} class="flex items-center">
          <span class="text-[var(--color-neon-pink)] font-bold mr-2">$</span>
          <input
            ref={inputRef}
            class="bg-transparent border-none outline-none flex-1 text-[var(--color-neon)] placeholder-[var(--color-neon-blue)] text-lg"
            value={input()}
            onInput={(e) => setInput(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a command..."
            autofocus
            autocomplete="off"
          />
        </form>
      </div>
    </>
  )
}
