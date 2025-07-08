export interface WorkerPluginHandle {
  name: string
  description: string
  sendCommand: (input: string) => Promise<{ output: string }>
  terminate: () => void
}

export function createPluginWorker(pluginCode: string): Promise<WorkerPluginHandle> {
  return new Promise((resolve, reject) => {
    const workerScript = `
        let plugin;
        ${pluginCode}
        if(!plugin && self.plugin) plugin = self.plugin;
        self.onmessage = async function(e) {
          const { input } = e.data;
          if (plugin && typeof plugin.onCommand === 'function') {
            let result = await plugin.onCommand(input, {});
            if (result && result.output) {
              self.postMessage({ output: result.output });
            } else {
              self.postMessage({})
            }
          } else {
            self.postMessage({})
          }
        };
        // Al iniciar, envía nombre y descripción para validación
        setTimeout(() => {
          if (plugin && plugin.name && plugin.description) {
            self.postMessage({ ready: true, name: plugin.name, description: plugin.description });
          } else {
            self.postMessage({ ready: false });
          }
        }, 0);
      `

    const blob = new Blob([workerScript], { type: 'application/javascript' })
    const worker = new Worker(URL.createObjectURL(blob))

    let name = ''
    let description = ''

    worker.onmessage = (e) => {
      const data = e.data
      if (data.ready) {
        name = data.name
        description = data.description
        resolve({
          name,
          description,
          sendCommand: (input: string) => {
            return new Promise((res) => {
              const onMsg = (ev: MessageEvent) => {
                worker.removeEventListener('message', onMsg)
                res(ev.data)
              }
              worker.addEventListener('message', onMsg)
              worker.postMessage({ input })
            })
          },
          terminate: () => worker.terminate(),
        })
      } else if (data.ready === false) {
        worker.terminate()
        reject(new Error('Plugin inválido: falta name o description'))
      }
    }
  })
}
