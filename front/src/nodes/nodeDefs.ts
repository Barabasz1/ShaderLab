export type PortType = 'float' | 'vec2' | 'vec3' | 'vec4' | 'bool' | 'dyn'

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

export const PortTypeColors: Record<PortType, string> = {
  float: 'hsl(199,89%,48%)',
  vec2: 'hsl(145, 70%, 58%)',
  vec3: 'hsl(263,70%,58%)',
  vec4: 'hsl(330,81%,60%)',
  bool: 'hsl(32,95%,44%)',
  dyn: 'hsl(215,20%,45%)',
}

export const portTypeLabel = (type: PortType) => type

export const canConnectPortTypes = (source: PortType, target: PortType) =>
  source === target || source === 'dyn' || target === 'dyn'

const oneValue = (resolvedType: string) =>
  resolvedType === 'float' ? '1.0' : `${resolvedType}(1.0)`

export const NodeCategories = {
  INPUT: {
    label: "Input",
    color: "hsl(152,60%,40%)",
    bg: "hsl(152,60%,94%)",
  },

  MATH: {
    label: "Basic math",
    color: "hsl(199,89%,48%)",
    bg: "hsl(199,89%,94%)",
  },

  ADVANCED_MATH: {
    label: "Advanced math",
    color: "hsl(263,70%,58%)",
    bg: "hsl(263,70%,95%)",
  },

  VECTOR: {
    label: "Vector",
    color: "hsl(330,81%,60%)",
    bg: "hsl(330,81%,96%)",
  },

  PROCEDURAL: {
    label: "Procedural",
    color: "hsl(32,95%,44%)",
    bg: "hsl(32,95%,95%)",
  },
} as const;

export type NodeCategory = typeof NodeCategories[keyof typeof NodeCategories]

export interface NodeDef {
  label: string
  category: NodeCategory | null
  inputs: PortDef[]
  outputs: PortDef[]
  controls: ControlDef[]
  deletable?: boolean
  glsl?: GlslFn
}

export const nodeDefs: Record<string, NodeDef> = {
  float: {
    label: 'Float',
    category: NodeCategories.INPUT,
    inputs: [],
    outputs: [{ id: 'out', label: 'Out', type: 'float' }],
    controls: [{ id: 'value', label: 'Value', type: 'float', default: 0.0 }],
    glsl: (_inputs, outputs, controls) => ({
      statements: [`float ${outputs[0]} = ${Number(controls['value']).toFixed(6)};`],
    }),
  },

  vec2: {
    label: 'Vec2',
    category: NodeCategories.INPUT,
    inputs: [],
    outputs: [{ id: 'out', label: 'Out', type: 'vec2' }],
    controls: [
      { id: 'x', label: 'X', type: 'float', default: 0.0 },
      { id: 'y', label: 'Y', type: 'float', default: 0.0 },
    ],
    glsl: (_inputs, outputs, controls) => ({
      statements: [
        `vec2 ${outputs[0]} = vec2(${Number(controls['x']).toFixed(6)}, ${Number(controls['y']).toFixed(6)});`,
      ],
    }),
  },

  vec3: {
    label: 'Vec3',
    category: NodeCategories.INPUT,
    inputs: [],
    outputs: [{ id: 'out', label: 'Out', type: 'vec3' }],
    controls: [
      { id: 'x', label: 'X', type: 'float', default: 0.0 },
      { id: 'y', label: 'Y', type: 'float', default: 0.0 },
      { id: 'z', label: 'Z', type: 'float', default: 0.0 },
    ],
    glsl: (_inputs, outputs, controls) => ({
      statements: [
        `vec3 ${outputs[0]} = vec3(${Number(controls['x']).toFixed(6)}, ${Number(controls['y']).toFixed(6)}, ${Number(controls['z']).toFixed(6)});`,
      ],
    }),
  },

  vec4: {
    label: 'Vec4',
    category: NodeCategories.INPUT,
    inputs: [],
    outputs: [{ id: 'out', label: 'Out', type: 'vec4' }],
    controls: [
      { id: 'x', label: 'X', type: 'float', default: 0.0 },
      { id: 'y', label: 'Y', type: 'float', default: 0.0 },
      { id: 'z', label: 'Z', type: 'float', default: 0.0 },
      { id: 'w', label: 'W', type: 'float', default: 1.0 },
    ],
    glsl: (_inputs, outputs, controls) => ({
      statements: [
        `vec4 ${outputs[0]} = vec4(${Number(controls['x']).toFixed(6)}, ${Number(controls['y']).toFixed(6)}, ${Number(controls['z']).toFixed(6)}, ${Number(controls['w']).toFixed(6)});`,
      ],
    }),
  },

  rgb: {
    label: 'RGB',
    category: NodeCategories.INPUT,
    inputs: [],
    outputs: [{ id: 'out', label: 'Out', type: 'vec3' }],
    controls: [
      { id: 'r', label: 'R', type: 'float', default: 1.0 },
      { id: 'g', label: 'G', type: 'float', default: 0.0 },
      { id: 'b', label: 'B', type: 'float', default: 0.0 },
    ],
    glsl: (_inputs, outputs, controls) => ({
      statements: [
        `vec3 ${outputs[0]} = vec3(${Number(controls['r']).toFixed(6)}, ${Number(controls['g']).toFixed(6)}, ${Number(controls['b']).toFixed(6)});`,
      ],
    }),
  },

  rgba: {
    label: 'RGBA',
    category: NodeCategories.INPUT,
    inputs: [],
    outputs: [{ id: 'out', label: 'Out', type: 'vec4' }],
    controls: [
      { id: 'r', label: 'R', type: 'float', default: 1.0 },
      { id: 'g', label: 'G', type: 'float', default: 0.0 },
      { id: 'b', label: 'B', type: 'float', default: 0.0 },
      { id: 'a', label: 'A', type: 'float', default: 1.0 },
    ],
    glsl: (_inputs, outputs, controls) => ({
      statements: [
        `vec4 ${outputs[0]} = vec4(${Number(controls['r']).toFixed(6)}, ${Number(controls['g']).toFixed(6)}, ${Number(controls['b']).toFixed(6)}, ${Number(controls['a']).toFixed(6)});`,
      ],
    }),
  },

  time: {
    label: 'Time',
    category: NodeCategories.INPUT,
    inputs: [],
    outputs: [{ id: 'out', label: 'Out', type: 'float' }],
    controls: [],
    glsl: (_inputs, outputs) => ({
      statements: [`float ${outputs[0]} = u_time;`],
    }),
  },

  uv: {
    label: 'UV',
    category: NodeCategories.INPUT,
    inputs: [],
    outputs: [{ id: 'out', label: 'Out', type: 'vec2' }],
    controls: [],
    glsl: (_inputs, outputs) => ({
      statements: [`vec2 ${outputs[0]} = v_uv;`],
    }),
  },

  output: {
    label: 'Output',
    category: null,
    inputs: [{ id: 'color', label: 'Color', type: 'vec4' }],
    outputs: [],
    controls: [],
    deletable: false,
  },

  add: {
    label: 'Add',
    category: NodeCategories.MATH,
    inputs: [
      { id: 'a', label: 'A', type: 'dyn' },
      { id: 'b', label: 'B', type: 'dyn' },
    ],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`${resolvedType} ${outputs[0]} = ${inputs[0]} + ${inputs[1]};`],
    }),
  },

  subtract: {
    label: 'Subtract',
    category: NodeCategories.MATH,
    inputs: [
      { id: 'a', label: 'A', type: 'dyn' },
      { id: 'b', label: 'B', type: 'dyn' },
    ],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`${resolvedType} ${outputs[0]} = ${inputs[0]} - ${inputs[1]};`],
    }),
  },

  multiply: {
    label: 'Multiply',
    category: NodeCategories.MATH,
    inputs: [
      { id: 'a', label: 'A', type: 'dyn' },
      { id: 'b', label: 'B', type: 'dyn' },
    ],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`${resolvedType} ${outputs[0]} = ${inputs[0]} * ${inputs[1]};`],
    }),
  },

  divide: {
    label: 'Divide',
    category: NodeCategories.MATH,
    inputs: [
      { id: 'a', label: 'A', type: 'dyn' },
      { id: 'b', label: 'B', type: 'dyn' },
    ],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`${resolvedType} ${outputs[0]} = ${inputs[0]} / ${inputs[1]};`],
    }),
  },

  power: {
    label: 'Power',
    category: NodeCategories.MATH,
    inputs: [
      { id: 'a', label: 'A', type: 'dyn' },
      { id: 'b', label: 'B', type: 'float' },
    ],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [
        `${resolvedType} ${outputs[0]} = pow(${inputs[0]}, ${resolvedType === 'float' ? inputs[1] : `${resolvedType}(${inputs[1]})`});`,
      ],
    }),
  },

  squareRoot: {
    label: 'Square root',
    category: NodeCategories.MATH,
    inputs: [{ id: 'a', label: 'A', type: 'dyn' }],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`${resolvedType} ${outputs[0]} = sqrt(${inputs[0]});`],
    }),
  },

  modulo: {
    label: 'Modulo',
    category: NodeCategories.MATH,
    inputs: [
      { id: 'a', label: 'A', type: 'dyn' },
      { id: 'b', label: 'B', type: 'float' },
    ],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`${resolvedType} ${outputs[0]} = mod(${inputs[0]}, ${inputs[1]});`],
    }),
  },

  sin: {
    label: 'Sin',
    category: NodeCategories.MATH,
    inputs: [{ id: 'a', label: 'A', type: 'dyn' }],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`${resolvedType} ${outputs[0]} = sin(${inputs[0]});`],
    }),
  },

  cos: {
    label: 'Cos',
    category: NodeCategories.MATH,
    inputs: [{ id: 'a', label: 'A', type: 'dyn' }],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`${resolvedType} ${outputs[0]} = cos(${inputs[0]});`],
    }),
  },

  asin: {
    label: 'Arcsine',
    category: NodeCategories.MATH,
    inputs: [{ id: 'a', label: 'A', type: 'dyn' }],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`${resolvedType} ${outputs[0]} = asin(${inputs[0]});`],
    }),
  },

  acos: {
    label: 'Arccosine',
    category: NodeCategories.MATH,
    inputs: [{ id: 'a', label: 'A', type: 'dyn' }],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`${resolvedType} ${outputs[0]} = acos(${inputs[0]});`],
    }),
  },

  tan: {
    label: 'Tangent',
    category: NodeCategories.MATH,
    inputs: [{ id: 'a', label: 'A', type: 'dyn' }],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`${resolvedType} ${outputs[0]} = tan(${inputs[0]});`],
    }),
  },

  abs: {
    label: 'Abs',
    category: NodeCategories.ADVANCED_MATH,
    inputs: [{ id: 'a', label: 'A', type: 'dyn' }],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`${resolvedType} ${outputs[0]} = abs(${inputs[0]});`],
    }),
  },

  negate: {
    label: 'Negate',
    category: NodeCategories.ADVANCED_MATH,
    inputs: [{ id: 'a', label: 'A', type: 'dyn' }],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`${resolvedType} ${outputs[0]} = -${inputs[0]};`],
    }),
  },

  min: {
    label: 'Min',
    category: NodeCategories.ADVANCED_MATH,
    inputs: [
      { id: 'a', label: 'A', type: 'dyn' },
      { id: 'b', label: 'B', type: 'float' },
    ],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`${resolvedType} ${outputs[0]} = min(${inputs[0]}, ${inputs[1]});`],
    }),
  },

  max: {
    label: 'Max',
    category: NodeCategories.ADVANCED_MATH,
    inputs: [
      { id: 'a', label: 'A', type: 'dyn' },
      { id: 'b', label: 'B', type: 'float' },
    ],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`${resolvedType} ${outputs[0]} = max(${inputs[0]}, ${inputs[1]});`],
    }),
  },

  clamp: {
    label: 'Clamp',
    category: NodeCategories.ADVANCED_MATH,
    inputs: [
      { id: 'value', label: 'Value', type: 'dyn' },
      { id: 'min', label: 'Min', type: 'float' },
      { id: 'max', label: 'Max', type: 'float' },
    ],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [
        `${resolvedType} ${outputs[0]} = clamp(${inputs[0]}, ${inputs[1]}, ${inputs[2]});`,
      ],
    }),
  },

  oneMinus: {
    label: 'One minus',
    category: NodeCategories.ADVANCED_MATH,
    inputs: [{ id: 'a', label: 'A', type: 'dyn' }],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`${resolvedType} ${outputs[0]} = ${oneValue(resolvedType)} - ${inputs[0]};`],
    }),
  },

  ceil: {
    label: 'Ceiling',
    category: NodeCategories.ADVANCED_MATH,
    inputs: [{ id: 'a', label: 'A', type: 'dyn' }],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`${resolvedType} ${outputs[0]} = ceil(${inputs[0]});`],
    }),
  },

  floor: {
    label: 'Floor',
    category: NodeCategories.ADVANCED_MATH,
    inputs: [{ id: 'a', label: 'A', type: 'dyn' }],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`${resolvedType} ${outputs[0]} = floor(${inputs[0]});`],
    }),
  },

  round: {
    label: 'Round',
    category: NodeCategories.ADVANCED_MATH,
    inputs: [{ id: 'a', label: 'A', type: 'dyn' }],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`${resolvedType} ${outputs[0]} = floor(${inputs[0]} + ${resolvedType === 'float' ? '0.5' : `${resolvedType}(0.5)`});`],
    }),
  },

  sign: {
    label: 'Sign',
    category: NodeCategories.ADVANCED_MATH,
    inputs: [{ id: 'a', label: 'A', type: 'dyn' }],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`${resolvedType} ${outputs[0]} = sign(${inputs[0]});`],
    }),
  },

  lerp: {
    label: 'Lerp',
    category: NodeCategories.ADVANCED_MATH,
    inputs: [
      { id: 'a', label: 'A', type: 'dyn' },
      { id: 'b', label: 'B', type: 'dyn' },
      { id: 't', label: 'T', type: 'float' },
    ],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`${resolvedType} ${outputs[0]} = mix(${inputs[0]}, ${inputs[1]}, ${inputs[2]});`],
    }),
  },

  dotProduct: {
    label: 'Dot product',
    category: NodeCategories.VECTOR,
    inputs: [
      { id: 'a', label: 'A', type: 'dyn' },
      { id: 'b', label: 'B', type: 'dyn' },
    ],
    outputs: [{ id: 'out', label: 'Out', type: 'float' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`float ${outputs[0]} = ${resolvedType === 'float' ? `${inputs[0]} * ${inputs[1]}` : `dot(${inputs[0]}, ${inputs[1]})`};`],
    }),
  },

  length: {
    label: 'Length',
    category: NodeCategories.VECTOR,
    inputs: [{ id: 'in', label: 'In', type: 'dyn' }],
    outputs: [{ id: 'out', label: 'Out', type: 'float' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`float ${outputs[0]} = ${resolvedType === 'float' ? `abs(${inputs[0]})` : `length(${inputs[0]})`};`],
    }),
  },

  normalize: {
    label: 'Normalize',
    category: NodeCategories.VECTOR,
    inputs: [{ id: 'in', label: 'In', type: 'dyn' }],
    outputs: [{ id: 'out', label: 'Out', type: 'dyn' }],
    controls: [],
    glsl: (inputs, outputs, _c, resolvedType) => ({
      statements: [`${resolvedType} ${outputs[0]} = ${resolvedType === 'float' ? `sign(${inputs[0]})` : `normalize(${inputs[0]})`};`],
    }),
  },

  splitVec2: {
    label: 'Split Vec2',
    category: NodeCategories.VECTOR,
    inputs: [{ id: 'in', label: 'In', type: 'vec2' }],
    outputs: [
      { id: 'x', label: 'X', type: 'float' },
      { id: 'y', label: 'Y', type: 'float' },
    ],
    controls: [],
    glsl: (inputs, outputs) => ({
      statements: [
        `float ${outputs[0]} = ${inputs[0]}.x;`,
        `float ${outputs[1]} = ${inputs[0]}.y;`,
      ],
    }),
  },

  splitVec3: {
    label: 'Split Vec3',
    category: NodeCategories.VECTOR,
    inputs: [{ id: 'in', label: 'In', type: 'vec3' }],
    outputs: [
      { id: 'x', label: 'X', type: 'float' },
      { id: 'y', label: 'Y', type: 'float' },
      { id: 'z', label: 'Z', type: 'float' },
    ],
    controls: [],
    glsl: (inputs, outputs) => ({
      statements: [
        `float ${outputs[0]} = ${inputs[0]}.x;`,
        `float ${outputs[1]} = ${inputs[0]}.y;`,
        `float ${outputs[2]} = ${inputs[0]}.z;`,
      ],
    }),
  },

  splitVec4: {
    label: 'Split Vec4',
    category: NodeCategories.VECTOR,
    inputs: [{ id: 'in', label: 'In', type: 'vec4' }],
    outputs: [
      { id: 'x', label: 'X', type: 'float' },
      { id: 'y', label: 'Y', type: 'float' },
      { id: 'z', label: 'Z', type: 'float' },
      { id: 'w', label: 'W', type: 'float' },
    ],
    controls: [],
    glsl: (inputs, outputs) => ({
      statements: [
        `float ${outputs[0]} = ${inputs[0]}.x;`,
        `float ${outputs[1]} = ${inputs[0]}.y;`,
        `float ${outputs[2]} = ${inputs[0]}.z;`,
        `float ${outputs[3]} = ${inputs[0]}.w;`,
      ],
    }),
  },

  combineVec2: {
    label: 'Combine Vec2',
    category: NodeCategories.VECTOR,
    inputs: [
      { id: 'x', label: 'X', type: 'float' },
      { id: 'y', label: 'Y', type: 'float' },
    ],
    outputs: [{ id: 'out', label: 'Out', type: 'vec2' }],
    controls: [],
    glsl: (inputs, outputs) => ({
      statements: [`vec2 ${outputs[0]} = vec2(${inputs[0]}, ${inputs[1]});`],
    }),
  },

  combineVec3: {
    label: 'Combine Vec3',
    category: NodeCategories.VECTOR,
    inputs: [
      { id: 'x', label: 'X', type: 'float' },
      { id: 'y', label: 'Y', type: 'float' },
      { id: 'z', label: 'Z', type: 'float' },
    ],
    outputs: [{ id: 'out', label: 'Out', type: 'vec3' }],
    controls: [],
    glsl: (inputs, outputs) => ({
      statements: [`vec3 ${outputs[0]} = vec3(${inputs[0]}, ${inputs[1]}, ${inputs[2]});`],
    }),
  },

  combineVec4: {
    label: 'Combine Vec4',
    category: NodeCategories.VECTOR,
    inputs: [
      { id: 'x', label: 'X', type: 'float' },
      { id: 'y', label: 'Y', type: 'float' },
      { id: 'z', label: 'Z', type: 'float' },
      { id: 'w', label: 'W', type: 'float' },
    ],
    outputs: [{ id: 'out', label: 'Out', type: 'vec4' }],
    controls: [],
    glsl: (inputs, outputs) => ({
      statements: [`vec4 ${outputs[0]} = vec4(${inputs[0]}, ${inputs[1]}, ${inputs[2]}, ${inputs[3]});`],
    }),
  },

  simpleNoise: {
    label: 'Simple Noise',
    category: NodeCategories.PROCEDURAL,
    inputs: [
      { id: 'uv', label: 'UV', type: 'vec2' },
      { id: 'scale', label: 'Scale', type: 'float' },
    ],
    outputs: [{ id: 'out', label: 'Out', type: 'float' }],
    controls: [],
    glsl: (inputs, outputs) => {
      const n = outputs[0]
      return {
        statements: [
          `vec2 ${n}_p = floor(${inputs[0]} * max(${inputs[1]}, 0.0001));`,
          `vec2 ${n}_f = fract(${inputs[0]} * max(${inputs[1]}, 0.0001));`,
          `${n}_f = ${n}_f * ${n}_f * (3.0 - 2.0 * ${n}_f);`,
          `float ${n}_a = fract(sin(dot(${n}_p + vec2(0.0, 0.0), vec2(127.1, 311.7))) * 43758.5453123);`,
          `float ${n}_b = fract(sin(dot(${n}_p + vec2(1.0, 0.0), vec2(127.1, 311.7))) * 43758.5453123);`,
          `float ${n}_c = fract(sin(dot(${n}_p + vec2(0.0, 1.0), vec2(127.1, 311.7))) * 43758.5453123);`,
          `float ${n}_d = fract(sin(dot(${n}_p + vec2(1.0, 1.0), vec2(127.1, 311.7))) * 43758.5453123);`,
          `float ${n} = mix(mix(${n}_a, ${n}_b, ${n}_f.x), mix(${n}_c, ${n}_d, ${n}_f.x), ${n}_f.y);`,
        ],
      }
    },
  },

  voronoiNoise: {
    label: 'Voronoi Noise',
    category: NodeCategories.PROCEDURAL,
    inputs: [
      { id: 'uv', label: 'UV', type: 'vec2' },
      { id: 'scale', label: 'Scale', type: 'float' },
    ],
    outputs: [{ id: 'out', label: 'Out', type: 'float' }],
    controls: [],
    glsl: (inputs, outputs) => {
      const n = outputs[0]
      return {
        statements: [
          `vec2 ${n}_p = floor(${inputs[0]} * max(${inputs[1]}, 0.0001));`,
          `vec2 ${n}_f = fract(${inputs[0]} * max(${inputs[1]}, 0.0001));`,
          `float ${n}_m = 8.0;`,
          `for (int ${n}_j = -1; ${n}_j <= 1; ${n}_j++) {`,
          `for (int ${n}_i = -1; ${n}_i <= 1; ${n}_i++) {`,
          `vec2 ${n}_g = vec2(float(${n}_i), float(${n}_j));`,
          `vec2 ${n}_o = fract(sin(vec2(dot(${n}_p + ${n}_g, vec2(127.1, 311.7)), dot(${n}_p + ${n}_g, vec2(269.5, 183.3)))) * 43758.5453123);`,
          `vec2 ${n}_r = ${n}_g + ${n}_o - ${n}_f;`,
          `${n}_m = min(${n}_m, dot(${n}_r, ${n}_r));`,
          `}`,
          `}`,
          `float ${n} = sqrt(${n}_m);`,
        ],
      }
    },
  },
}
