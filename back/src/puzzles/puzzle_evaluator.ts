

export function compareShaders(
  ratedFragShader: string,
  refFragShader: string,
  isStatic: boolean
): number {
  if (!isStatic) {
    throw new Error("Dynamic shader comparison needs time sampling.");
  }

  const width = 256;
  const height = 256;

  const ratedPixels = renderShaderToPixels(ratedFragShader, width, height);
  const refPixels = renderShaderToPixels(refFragShader, width, height);

  if (!ratedPixels || !refPixels) return 0;

  return comparePixelsRMSE(ratedPixels, refPixels);
}

function renderShaderToPixels(
  fragShaderSource: string,
  width: number,
  height: number
): Uint8Array | null {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const gl = canvas.getContext("webgl");
  if (!gl) return null;

  const vertexShaderSource = `
    attribute vec2 a_position;

    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const wrappedFragmentShader = `
    precision highp float;

    uniform vec2 u_resolution;

    ${fragShaderSource}
  `;

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, wrappedFragmentShader);

  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn(gl.getProgramInfoLog(program));
    return null;
  }

  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]),
    gl.STATIC_DRAW
  );

  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  if (resolutionLocation) {
    gl.uniform2f(resolutionLocation, width, height);
  }

  gl.viewport(0, 0, width, height);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  const pixels = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  return pixels;
}

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function comparePixelsRMSE(a: Uint8Array, b: Uint8Array): number {
  if (a.length !== b.length) return 0;

  let error = 0;
  let samples = 0;

  for (let i = 0; i < a.length; i += 4) {
    const dr = a[i] - b[i];
    const dg = a[i + 1] - b[i + 1];
    const db = a[i + 2] - b[i + 2];

    error += dr * dr + dg * dg + db * db;
    samples += 3;
  }

  const mse = error / samples;
  const rmse = Math.sqrt(mse);

  const similarity = 1 - rmse / 255;

  return Math.max(0, Math.min(1, similarity));
}