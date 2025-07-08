import { openDB, type DBSchema } from 'idb'

interface MemoryShellDB extends DBSchema {
  notes: {
    key: number
    value: {
      id: number
      content: string
    }
  }
  plugins: {
    key: string
    value: {
      id: number
      name: string
      code: string
      enabled: boolean
    }
  }
}

const dbPromise = openDB<MemoryShellDB>('memoryshell', 2, {
  upgrade(db) {
    if (!db.objectStoreNames.contains('notes')) {
      db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true })
    }
    if (!db.objectStoreNames.contains('plugins')) {
      db.createObjectStore('plugins', { keyPath: 'id' })
    }
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

export const addPlugin = async (plugin: {
  id: number
  name: string
  code: string
  enabled: boolean
}) => {
  const db = await dbPromise
  await db.put('plugins', plugin)
}

export const getAllPlugins = async () => {
  const db = await dbPromise
  return db.getAll('plugins')
}

export const removePlugin = async (id: string) => {
  const db = await dbPromise
  await db.delete('plugins', id)
}
