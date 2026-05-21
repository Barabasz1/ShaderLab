import type { NodeDef } from '../nodes/nodeDefs'

const vertexShader = `#version 100
precision mediump float;
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`

interface EvalNode {
  nodeId: string
  nodeType: string
  def: NodeDef
  resolvedType: string
  inputValues: Record<string, unknown>
  inputVars: Record<string, string | null>
  outputVars: Record<string, string>
  controls: Record<string, number>
}

function toFloat(value: unknown, fallback = 0): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback
  if (typeof value === 'boolean') return value ? 1 : 0
  if (value === '' || value === '-' || value === '.' || value === '-.') return fallback
  const parsed = Number(value ?? fallback)
  return Number.isFinite(parsed) ? parsed : fallback
}

function scalarLiteral(value: unknown, fallback = 0): string {
  return toFloat(value, fallback).toFixed(6)
}

function inlineDefault(type: string, inputValues: Record<string, unknown>, portId: string): string {
  if (type === 'vec2') return `vec2(${scalarLiteral(inputValues[`${portId}.x`])}, ${scalarLiteral(inputValues[`${portId}.y`])})`
  if (type === 'vec3') return `vec3(${scalarLiteral(inputValues[`${portId}.x`])}, ${scalarLiteral(inputValues[`${portId}.y`])}, ${scalarLiteral(inputValues[`${portId}.z`])})`
  if (type === 'vec4') return `vec4(${scalarLiteral(inputValues[`${portId}.x`])}, ${scalarLiteral(inputValues[`${portId}.y`])}, ${scalarLiteral(inputValues[`${portId}.z`])}, ${scalarLiteral(inputValues[`${portId}.w`], 1)})`
  if (type === 'bool') return toFloat(inputValues[portId]) ? 'true' : 'false'
  return scalarLiteral(inputValues[portId])
}

function generateNodeStatements(evalNode: EvalNode, allNodeDefs: Record<string, NodeDef>): string[] {
  const { nodeType, def, resolvedType, inputValues, inputVars, outputVars, controls } = evalNode

  const nodeDef = allNodeDefs[nodeType]
  if (!nodeDef?.glsl) return []

  const inputExprs = (def.inputs ?? []).map((inp) => {
    const v = inputVars[inp.id]
    if (v) return v
    const portType = inp.type === 'dyn' ? resolvedType : inp.type
    return inlineDefault(portType, inputValues, inp.id)
  })

  const outputNames = (def.outputs ?? []).map((out) => outputVars[out.id])

  const { statements } = nodeDef.glsl(inputExprs, outputNames, controls, resolvedType)
  return statements
}

export function translateToGLSL(
  evalNodes: EvalNode[],
  outputVarName: string | null,
  allNodeDefs: Record<string, NodeDef>
): { fragmentSrc: string; vertexSrc: string; error: string | null } {
  const lines: string[] = []

  lines.push('#version 100')
  lines.push('precision mediump float;')
  lines.push('')
  lines.push('uniform float u_time;')
  lines.push('uniform vec2  u_resolution;')
  lines.push('varying vec2  v_uv;')
  lines.push('')
  lines.push('void main() {')

  for (const evalNode of evalNodes) {
    const stmts = generateNodeStatements(evalNode, allNodeDefs)
    for (const stmt of stmts) {
      lines.push('  ' + stmt)
    }
  }

  if (outputVarName) {
    lines.push(`  gl_FragColor = ${outputVarName};`)
  } else {
    lines.push('  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);')
  }

  lines.push('}')

  return {
    fragmentSrc: lines.join('\n'),
    vertexSrc: vertexShader,
    error: null,
  }
}
