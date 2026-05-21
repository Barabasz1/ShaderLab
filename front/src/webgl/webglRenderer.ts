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
  let locations: { pos: number; time: WebGLUniformLocation | null; res: WebGLUniformLocation | null } | null = null

  const quadBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW
  )

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

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

  function compileShader(src: string, type: number): WebGLShader {
    const shader = gl.createShader(type)
    if (!shader) throw new Error('Failed to create shader')
    gl.shaderSource(shader, src)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader)
      gl.deleteShader(shader)
      throw new Error(log ?? 'Shader compile error')
    }
    return shader
  }

  function linkProgram(vertSrc: string, fragSrc: string): WebGLProgram {
    const vert = compileShader(vertSrc, gl.VERTEX_SHADER)
    const frag = compileShader(fragSrc, gl.FRAGMENT_SHADER)
    const prog = gl.createProgram()
    if (!prog) throw new Error('Failed to create program')

    gl.attachShader(prog, vert)
    gl.attachShader(prog, frag)
    gl.linkProgram(prog)

    gl.deleteShader(vert)
    gl.deleteShader(frag)

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(prog)
      gl.deleteProgram(prog)
      throw new Error(log ?? 'Program link error')
    }
    return prog
  }

  function render(now: number) {
    if (!program || !locations) return
    const t = (now - startTime) / 1000

    gl.uniform1f(locations.time, t)
    gl.uniform2f(locations.res, canvas.width, canvas.height)

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
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
      const newProg = linkProgram(vertSrc, fragSrc)
      if (program) gl.deleteProgram(program)
      program = newProg
      startTime = performance.now()

      gl.useProgram(program)

      locations = {
        pos: gl.getAttribLocation(program, 'a_position'),
        time: gl.getUniformLocation(program, 'u_time'),
        res: gl.getUniformLocation(program, 'u_resolution'),
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
      gl.enableVertexAttribArray(locations.pos)
      gl.vertexAttribPointer(locations.pos, 2, gl.FLOAT, false, 0, 0)

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
