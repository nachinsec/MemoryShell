import { openDB, type DBSchema } from 'idb'

interface MemoryShellDB extends DBSchema {
  notes: {
    key: number
    value: {
      id: number
      content: string
    }
  }
}

const dbPromise = openDB<MemoryShellDB>('memoryshell', 1, {
  upgrade(db) {
    db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true })
  },
})

export const addNote = async (content: string) => {
  const db = await dbPromise
  const id = Date.now()
  await db.add('notes', { id, content })
}

export const getAllNotes = async () => {
  const db = await dbPromise
  return db.getAll('notes')
}

export const clearNotes = async () => {
  const db = await dbPromise
  await db.clear('notes')
}
