import { createSignal } from 'solid-js'
import { addPlugin } from '../utils/db'
import { createPluginWorker } from '../plugins/worker'
import type { WorkerPluginHandle } from '../plugins/worker'

export default function PluginLoaderForm(props: {
  onPluginLoaded: (pluginHandle: WorkerPluginHandle) => void
}) {
  const [pluginCode, setPluginCode] = createSignal('')
  const [pluginName, setPluginName] = createSignal('')
  const [pluginDesc, setPluginDesc] = createSignal('')
  const [pluginError, setPluginError] = createSignal<string | null>(null)
  const [loading, setLoading] = createSignal(false)

  const handlePluginSubmit = async (e: Event) => {
    e.preventDefault()
    setPluginError(null)
    if (!pluginCode().trim() || !pluginName().trim()) {
      setPluginError('Todos los campos son obligatorios')
      return
    }
    setLoading(true)
    const id = Date.now()
    try {
      // Guarda el plugin en IndexedDB
      await addPlugin({
        id,
        name: pluginName(),
        code: pluginCode(),
        enabled: true,
      })
      // Carga el plugin en caliente
      const pluginHandle = await createPluginWorker(pluginCode())
      props.onPluginLoaded(pluginHandle)
      setPluginCode('')
      setPluginName('')
    } catch (err) {
      setPluginError('Error loading plugin.' + err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handlePluginSubmit} class="mb-4 p-3 rounded bg-gray-900 shadow">
      <div class="mb-2">
        <input
          class="w-full mb-1 p-1 rounded bg-black text-[var(--color-neon)] border border-[var(--color-neon-blue)]"
          placeholder="Plugin name"
          value={pluginName()}
          onInput={(e) => setPluginName(e.currentTarget.value)}
        />
        <textarea
          class="w-full h-24 p-1 rounded bg-black text-[var(--color-neon)] border border-[var(--color-neon-blue)]"
          placeholder="Paste the plugin code here (must define 'plugin = {...}')"
          value={pluginCode()}
          onInput={(e) => setPluginCode(e.currentTarget.value)}
        />
      </div>
      {pluginError() && <div class="text-red-500 mb-2">{pluginError()}</div>}
      <button
        class="bg-[var(--color-neon-blue)] text-black px-4 py-1 rounded font-bold hover:bg-[var(--color-neon-pink)] transition"
        type="submit"
        disabled={loading()}
      >
        {loading() ? 'Loading...' : 'Load plugin'}
      </button>
    </form>
  )
}
