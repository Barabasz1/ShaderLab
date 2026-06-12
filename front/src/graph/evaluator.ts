import type { NodeDef, PortType } from '../nodes/nodeDefs'

interface Edge {
  id?: string
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
}

interface Node<T = any> {
  id: string
  data?: T
}

interface EvalNode {
  nodeId: string
  nodeType: string
  def: NodeDef
  resolvedType: string
  inputValues: Record<string, unknown>
  inputVars: Record<string, string | null>
  inputTypes: Record<string, string>
  inputVarTypes: Record<string, string | null>
  outputVars: Record<string, string>
  controls: Record<string, number>
}

interface EvaluateResult {
  evalNodes: EvalNode[]
  outputVarName: string | null
  error: string | null
}

const typeRank: Record<string, number> = {
  bool: -1,
  float: 0,
  vec2: 1,
  vec3: 2,
  vec4: 3,
  dyn: 0,
}

function outputVarName(nodeId: string, portId: string) {
  return `v_${nodeId.replace(/-/g, '_')}_${portId}`
}

function dominantType(a: string, b: string) {
  return (typeRank[b] ?? 0) > (typeRank[a] ?? 0) ? b : a
}

function portType(type: PortType, resolvedType: string) {
  return type === 'dyn' ? resolvedType : type
}

function buildConnectionMap(edges: Edge[]) {
  const map = new Map<string, { nodeId: string; portId: string }>()
  for (const edge of edges) {
    if (!edge.targetHandle) continue
    const targetKey = `${edge.target}::${edge.targetHandle}`
    map.set(targetKey, { nodeId: edge.source, portId: edge.sourceHandle ?? '' })
  }
  return map
}

function topoSort(nodeIds: string[], deps: Map<string, string[]>): string[] {
  const inDegree = new Map(nodeIds.map((id) => [id, 0]))
  const children = new Map(nodeIds.map((id) => [id, [] as string[]]))

  for (const [node, depList] of deps) {
    for (const dep of depList) {
      inDegree.set(node, (inDegree.get(node) ?? 0) + 1)
      children.get(dep)?.push(node)
    }
  }

  const queue = nodeIds.filter((id) => inDegree.get(id) === 0)
  const sorted: string[] = []

  while (queue.length > 0) {
    const node = queue.shift()!
    sorted.push(node)
    for (const child of children.get(node) ?? []) {
      const deg = (inDegree.get(child) ?? 0) - 1
      inDegree.set(child, deg)
      if (deg === 0) queue.push(child)
    }
  }

  if (sorted.length !== nodeIds.length) {
    throw new Error('Cycle detected in shader graph')
  }
  return sorted
}

function getDefForNode(node: Node<any>, nodeDefs: Record<string, NodeDef>): NodeDef | null {
  const nt = node.data?.nodeType
  return nodeDefs[nt] ?? null
}

function buildExpectedTypeMap(
  rfNodes: Node<any>[],
  rfEdges: Edge[],
  nodeDefs: Record<string, NodeDef>
) {
  const nodesById = new Map(rfNodes.map((n) => [n.id, n]))
  const expected = new Map<string, PortType>()

  for (const edge of rfEdges) {
    if (!edge.sourceHandle || !edge.targetHandle) continue
    const targetNode = nodesById.get(edge.target)
    if (!targetNode) continue
    const targetDef = getDefForNode(targetNode, nodeDefs)
    const targetPort = targetDef?.inputs.find((port) => port.id === edge.targetHandle)
    if (!targetPort || targetPort.type === 'dyn') continue

    const varName = outputVarName(edge.source, edge.sourceHandle)
    const current = expected.get(varName)
    expected.set(varName, current ? dominantType(current, targetPort.type) as PortType : targetPort.type)
  }

  return expected
}

function resolveNodeType(
  nodeId: string,
  nodeDef: NodeDef,
  connMap: Map<string, { nodeId: string; portId: string }>,
  outputTypeMap: Map<string, string>,
  expectedTypeMap: Map<string, PortType>
): string {
  const hasDynamic = [...(nodeDef.inputs ?? []), ...(nodeDef.outputs ?? [])].some(
    (p) => p.type === 'dyn'
  )
  if (!hasDynamic) return 'float'

  let inputType = 'float'
  let hasInputType = false

  for (const input of nodeDef.inputs ?? []) {
    if (input.type !== 'dyn') continue
    const key = `${nodeId}::${input.id}`
    const src = connMap.get(key)
    if (!src) continue
    const srcType = outputTypeMap.get(outputVarName(src.nodeId, src.portId)) ?? 'float'
    if (srcType === 'bool' || srcType === 'dyn') continue
    inputType = dominantType(inputType, srcType)
    hasInputType = true
  }

  if (hasInputType) return inputType

  let expectedType = 'float'
  let hasExpectedType = false

  for (const output of nodeDef.outputs ?? []) {
    if (output.type !== 'dyn') continue
    const type = expectedTypeMap.get(outputVarName(nodeId, output.id))
    if (!type || type === 'bool' || type === 'dyn') continue
    expectedType = dominantType(expectedType, type)
    hasExpectedType = true
  }

  return hasExpectedType ? expectedType : 'float'
}

export function evaluateGraph(
  rfNodes: Node<any>[],
  rfEdges: Edge[],
  nodeDefs: Record<string, NodeDef>
): EvaluateResult {
  try {
    const connMap = buildConnectionMap(rfEdges)
    const nodesById = new Map(rfNodes.map((n) => [n.id, n]))
    const expectedTypeMap = buildExpectedTypeMap(rfNodes, rfEdges, nodeDefs)

    const deps = new Map(rfNodes.map((n) => [n.id, [] as string[]]))
    for (const edge of rfEdges) {
      deps.get(edge.target)?.push(edge.source)
    }

    const sortedIds = topoSort(rfNodes.map((n) => n.id), deps)
    const outputTypeMap = new Map<string, string>()
    const evalNodes: EvalNode[] = []

    for (const nodeId of sortedIds) {
      const node = nodesById.get(nodeId)
      if (!node) continue
      const def = getDefForNode(node, nodeDefs)
      if (!def) continue

      const resolvedType = resolveNodeType(nodeId, def, connMap, outputTypeMap, expectedTypeMap)

      const outputVars: Record<string, string> = {}
      for (const out of def.outputs ?? []) {
        const varName = outputVarName(nodeId, out.id)
        const type = portType(out.type, resolvedType)
        outputVars[out.id] = varName
        outputTypeMap.set(varName, type)
      }

      const inputVars: Record<string, string | null> = {}
      const inputTypes: Record<string, string> = {}
      const inputVarTypes: Record<string, string | null> = {}
      for (const inp of def.inputs ?? []) {
        const src = connMap.get(`${nodeId}::${inp.id}`)
        const varName = src ? outputVarName(src.nodeId, src.portId) : null
        inputVars[inp.id] = varName
        inputTypes[inp.id] = portType(inp.type, resolvedType)
        inputVarTypes[inp.id] = varName ? outputTypeMap.get(varName) ?? null : null
      }

      const inputValues: Record<string, unknown> = { ...(node.data?.inlineValues ?? {}) }
      const controlValues: Record<string, number> = { ...(node.data?.controlValues ?? {}) }
      for (const ctrl of def.controls ?? []) {
        if (!(ctrl.id in controlValues)) controlValues[ctrl.id] = ctrl.default
      }

      evalNodes.push({
        nodeId,
        nodeType: node.data?.nodeType,
        def,
        resolvedType,
        inputValues,
        inputVars,
        inputTypes,
        inputVarTypes,
        outputVars,
        controls: controlValues,
      })
    }

    const outputEvalNode = evalNodes.find((en) => en.nodeType === 'output')
    const graphOutputVarName = outputEvalNode?.inputVars['color'] ?? null

    return { evalNodes, outputVarName: graphOutputVarName, error: null }
  } catch (err) {
    return { evalNodes: [], outputVarName: null, error: (err as Error).message }
  }
}
