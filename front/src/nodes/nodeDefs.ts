export type PortType = 'float' | 'vec4' | 'bool' | 'any'

export interface PortDef {
  id: string
  label: string
  type: PortType
}

export interface ControlDef {
  id: string
  label: string
  type: 'float' | 'bool'
  default: number
  min?: number
  max?: number
}

export type GlslFn = (
  inputs: string[],
  outputs: string[],
  controls: Record<string, number>,
  resolvedType: string
) => { statements: string[] }

export interface NodeDef {
  label: string
  category: string | null
  inputs: PortDef[]
  outputs: PortDef[]
  controls: ControlDef[]
  glsl?: GlslFn
}

export const NodeCategories = {
  INPUT: 'Input',
  MATH: 'Basic math',
  ADVANCED_MATH: 'Advanced math',
  NOISE: "Noise"
} as const

export type NodeCategory = typeof NodeCategories[keyof typeof NodeCategories]

export const nodeDefs: Record<string, NodeDef> = {
  float: {
    label: 'Float',
    category: NodeCategories.INPUT,
    inputs: [],
    outputs: [{ id: 'value', label: 'Value', type: 'float' }],
    controls: [{ id: 'value', label: 'Value', type: 'float', default: 0.0 }],
    glsl: (_inputs, outputs, controls) => ({
      statements: [`float ${outputs[0]} = ${Number(controls['value']).toFixed(6)};`],
    }),
  },
}

export const fixedNodeDefs = {
  graphUv: {
    label: 'UV',
    category: null,
    inputs: [],
    outputs: [{ id: 'uv', label: 'UV', type: 'vec4' as PortType }],
    controls: [],
  },
  graphOutput: {
    label: 'Output',
    category: null,
    inputs: [{ id: 'color', label: 'Color', type: 'vec4' as PortType }],
    outputs: [],
    controls: [],
  },
}
