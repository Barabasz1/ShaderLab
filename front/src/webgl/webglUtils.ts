export const quadVertexData = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
export const quadVertexCount = 4;
export const comparisonWidth = 128;
export const comparisonHeight = 128;
export const comparisonSamples = 8;
export const comparisonDuration = 4;
export const pixelStride = 4;
export const comparedPixelChannels = 3;
export const maxDevicePixelRatio = 1.5;

export const fullScreenVertexSrc = `#version 100
precision mediump float;
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const withPrecision = (code: string) =>
  /precision\s+(lowp|mediump|highp)\s+float\s*;/.test(code)
    ? code
    : `precision highp float;\n${code}`;

export const compileShader = (
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

export const createProgram = (
  gl: WebGLRenderingContext,
  vertexSrc: string,
  fragmentSrc: string,
) => {
  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSrc);
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);
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

export const setShaderUniforms = (
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
