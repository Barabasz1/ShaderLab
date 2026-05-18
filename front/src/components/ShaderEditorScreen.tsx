
import {
  ReactFlowProvider,
} from '@xyflow/react'




function ShaderEditorInner() {
  return (
    <div>
    </div>
  )
}

export default function ShaderEditorScreen() {
  return (
    <ReactFlowProvider>
      <ShaderEditorInner />
    </ReactFlowProvider>
  )
}
