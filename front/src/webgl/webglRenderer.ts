import {
  createProgram,
  maxDevicePixelRatio,
  quadVertexCount,
  quadVertexData,
  setShaderUniforms,
} from "@/webgl/webglUtils";

interface Renderer {
  compile: (vertSrc: string, fragSrc: string) => { error: string | null }
  destroy: () => void
}

export function createRenderer(canvas: HTMLCanvasElement): Renderer {
  const glOrNull = (canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null
  if (!glOrNull) throw new Error('WebGL not supported')
  const gl = glOrNull

  let program: WebGLProgram | null = null
  let rafId: number | null = null
  let startTime = performance.now()

  const quadBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    quadVertexData,
    gl.STATIC_DRAW
  )

  const dpr = Math.min(window.devicePixelRatio || 1, maxDevicePixelRatio)

  const resize = (width: number, height: number) => {
    const w = Math.floor(width * dpr)
    const h = Math.floor(height * dpr)
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
      gl.viewport(0, 0, w, h)
    }
  }

  const observer = new ResizeObserver((entries) => {
    const rect = entries[0]?.contentRect
    if (rect) resize(rect.width, rect.height)
  })
  observer.observe(canvas)

  function render(now: number) {
    if (!program) return
    const t = (now - startTime) / 1000

    setShaderUniforms(gl, program, canvas.width, canvas.height, t)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, quadVertexCount)
    rafId = requestAnimationFrame(render)
  }

  function stopLoop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  function compile(vertSrc: string, fragSrc: string): { error: string | null } {
    stopLoop()
    try {
      const newProg = createProgram(gl, vertSrc, fragSrc)
      if (program) gl.deleteProgram(program)
      program = newProg
      startTime = performance.now()

      gl.useProgram(program)
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
      gl.enableVertexAttribArray(0)
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

      rafId = requestAnimationFrame(render)
      return { error: null }
    } catch (err) {
      return { error: (err as Error).message }
    }
  }

  function destroy() {
    stopLoop()
    observer.disconnect()
    if (program) gl.deleteProgram(program)
    if (quadBuffer) gl.deleteBuffer(quadBuffer)
  }

  return { compile, destroy }
}
