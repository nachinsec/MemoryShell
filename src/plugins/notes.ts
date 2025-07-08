import type { TerminalPlugin } from './types'
import { addNote, getAllNotes, clearNotes } from '../utils/db'

const notesPlugin: TerminalPlugin = {
  name: 'Notes',
  description: 'Manage notes',
  async onCommand(input, _) {
    if (input === 'note list') {
      const notes = await getAllNotes()
      if (!notes.length) return { output: 'No notes yet.' }
      return { output: notes.map((n) => `• ${n.content}`).join('\n') }
    }
    if (input === 'note clear') {
      await clearNotes()
      return { output: 'Notes cleared' }
    }
    if (input.startsWith('note ')) {
      const note = input.slice(5)
      await addNote(note)
      return { output: `Note saved: ${note}` }
    }
    console.log(input)
    return undefined
  },
}

export default notesPlugin
