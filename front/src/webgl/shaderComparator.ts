export interface ShaderSimilarityOptions {
  width?: number;
  height?: number;
  time?: number;
  times?: number[];
  samples?: number;
  duration?: number;
}

export interface ShaderSimilarityResult {
  rating: number;
  error: number;
  samples: number;
  width: number;
  height: number;
}

const vertexSrc = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const withPrecision = (code: string) =>
  /precision\s+(lowp|mediump|highp)\s+float\s*;/.test(code)
    ? code
    : `precision highp float;\n${code}`;

const createCanvas = (width: number, height: number) => {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(width, height);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

const compileShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) => {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Failed to create shader");

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const error = gl.getShaderInfoLog(shader) || "Shader compile error";
    gl.deleteShader(shader);
    throw new Error(error);
  }

  return shader;
};

const createProgram = (gl: WebGLRenderingContext, fragmentSrc: string) => {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSrc);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, withPrecision(fragmentSrc));
  const program = gl.createProgram();

  if (!program) throw new Error("Failed to create program");

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.bindAttribLocation(program, 0, "a_position");
  gl.linkProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const error = gl.getProgramInfoLog(program) || "Shader link error";
    gl.deleteProgram(program);
    throw new Error(error);
  }

  return program;
};

const setUniforms = (
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  width: number,
  height: number,
  time: number,
) => {
  const uResolution = gl.getUniformLocation(program, "u_resolution");
  const iResolution = gl.getUniformLocation(program, "iResolution");
  const resolution = gl.getUniformLocation(program, "resolution");
  const uTime = gl.getUniformLocation(program, "u_time");
  const iTime = gl.getUniformLocation(program, "iTime");
  const timeUniform = gl.getUniformLocation(program, "time");

  if (uResolution) gl.uniform2f(uResolution, width, height);
  if (iResolution) gl.uniform3f(iResolution, width, height, 1);
  if (resolution) gl.uniform2f(resolution, width, height);
  if (uTime) gl.uniform1f(uTime, time);
  if (iTime) gl.uniform1f(iTime, time);
  if (timeUniform) gl.uniform1f(timeUniform, time);
};

const renderShader = (
  code: string,
  width: number,
  height: number,
  time: number,
) => {
  const canvas = createCanvas(width, height);
  const gl = canvas.getContext("webgl", {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: true,
  }) as WebGLRenderingContext | null;

  if (!gl) throw new Error("WebGL is not available");

  const program = createProgram(gl, code);
  const buffer = gl.createBuffer();

  if (!buffer) throw new Error("Failed to create buffer");

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );

  gl.viewport(0, 0, width, height);
  gl.useProgram(program);
  setUniforms(gl, program, width, height, time);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.finish();

  const pixels = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  gl.deleteBuffer(buffer);
  gl.deleteProgram(program);

  return pixels;
};

const comparePixels = (a: Uint8Array, b: Uint8Array) => {
  let sum = 0;
  let count = 0;

  for (let i = 0; i < a.length; i += 4) {
    const dr = a[i] - b[i];
    const dg = a[i + 1] - b[i + 1];
    const db = a[i + 2] - b[i + 2];

    sum += dr * dr + dg * dg + db * db;
    count += 3;
  }

  const error = Math.sqrt(sum / count) / 255;

  return {
    error,
    rating: clamp01(1 - error),
  };
};

const compareAtTimes = (
  solutionCode: string,
  userCode: string,
  times: number[],
  options: ShaderSimilarityOptions,
): ShaderSimilarityResult => {
  const width = options.width ?? 128;
  const height = options.height ?? 128;
  let rating = 0;
  let error = 0;

  times.forEach((time) => {
    const solutionPixels = renderShader(solutionCode, width, height, time);
    const userPixels = renderShader(userCode, width, height, time);
    const result = comparePixels(solutionPixels, userPixels);

    rating += result.rating;
    error += result.error;
  });

  return {
    rating: clamp01(rating / times.length),
    error: error / times.length,
    samples: times.length,
    width,
    height,
  };
};

export const compareShadersStatic = (
  solutionCode: string,
  userCode: string,
  options: ShaderSimilarityOptions = {},
) => compareAtTimes(solutionCode, userCode, [options.time ?? 0], options);

export const compareShadersDynamic = (
  solutionCode: string,
  userCode: string,
  options: ShaderSimilarityOptions = {},
) => {
  const samples = options.samples ?? 8;
  const duration = options.duration ?? 4;
  const times =
    options.times ??
    Array.from({ length: samples }, (_, index) =>
      samples === 1 ? 0 : (index / (samples - 1)) * duration,
    );

  return compareAtTimes(solutionCode, userCode, times, options);
};
