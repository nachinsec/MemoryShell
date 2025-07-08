import type { JSX } from 'solid-js'

export interface PluginContext {
  addOutput: (output: string) => void
  getState: () => any
  setState: (state: any) => void
}

export interface PluginResult {
  output: string
  panel?: JSX.Element
}

export interface TerminalPlugin {
  name: string
  description: string
  onCommand: (
    input: string,
    context: PluginContext
  ) => PluginResult | void | Promise<PluginResult | void>
  renderPanel?: (context: PluginContext) => void
  onInit?: (context: PluginContext) => void
  onDispose?: () => void
}
