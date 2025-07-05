import { createSignal, onCleanup, createEffect } from 'solid-js'
import { addNote, getAllNotes, clearNotes } from '../utils/db'
import { COMMANDS } from '../constants/commands'
type HistoryEntry = {
  command: string
  output: string
}

export default function Terminal() {
  const [history, setHistory] = createSignal<HistoryEntry[]>([])
  const [input, setInput] = createSignal('')
  let inputRef: HTMLInputElement | undefined
  let scrollRef: HTMLDivElement | undefined

  setTimeout(() => inputRef?.focus(), 100)

  const handleCommand = async (e: Event) => {
    e.preventDefault()
    const value = input().trim()
    if (!value) return

    let output = ''
    if (value === COMMANDS.NOTE_LIST) {
      const notes = await getAllNotes()
      if (notes.length === 0) {
        output = 'Notes not found'
      } else {
        output = notes.map((note) => note.content).join('\n')
      }
    } else if (value === COMMANDS.NOTE_CLEAR) {
      await clearNotes()
      output = 'Notes cleared'
    } else if (value.startsWith(COMMANDS.NOTE + ' ')) {
      const noteContent = value.slice(5)
      output = `Note saved: ${noteContent}`
      await addNote(noteContent)
    } else if (value === COMMANDS.HELP) {
      output = `Commands: ${Object.values(COMMANDS).join(', ')}`
    } else if (value === COMMANDS.CLEAR) {
      setHistory([])
      setInput('')
      return
    } else {
      output = 'Command not recognized. Write "help" to see options.'
    }

    setHistory([...history(), { command: value, output }])
    setInput('')
    setTimeout(() => inputRef?.focus(), 50)
  }

  createEffect(() => {
    history()
    if (!scrollRef) return
    scrollRef.scrollTop = scrollRef.scrollHeight
  })
  onCleanup(() => {
    /* nada por ahora */
  })

  return (
    <div class="bg-black text-[var(--color-neon)] p-6 rounded-xl shadow-2xl font-mono max-w-2xl mx-auto terminal-border terminal-scanlines text-left relative min-w-[50rem]">
      <div ref={(el) => (scrollRef = el)} class="overflow-y-auto h-72 mb-4 pr-2 terminal-scrollbar">
        {history().map((entry, _) => (
          <div class="mb-2">
            <span class="text-[var(--color-neon-pink)] font-bold">$</span>
            <span class="ml-2">{entry.command}</span>
            <div class="ml-6 whitespace-pre-line text-[var(--color-neon-blue)]">{entry.output}</div>
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
          placeholder="Write a command..."
          autofocus
          autocomplete="off"
        />
      </form>
    </div>
  )
}
