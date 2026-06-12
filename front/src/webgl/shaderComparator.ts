import {
  comparedPixelChannels,
  comparisonDuration,
  comparisonHeight,
  comparisonSamples,
  comparisonWidth,
  createProgram,
  fullScreenVertexSrc,
  pixelStride,
  quadVertexCount,
  quadVertexData,
  setShaderUniforms,
  withPrecision,
} from "@/webgl/webglUtils";

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

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const createCanvas = (width: number, height: number) => {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(width, height);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
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

  const program = createProgram(gl, fullScreenVertexSrc, withPrecision(code));
  const buffer = gl.createBuffer();

  if (!buffer) throw new Error("Failed to create buffer");

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, quadVertexData, gl.STATIC_DRAW);

  gl.viewport(0, 0, width, height);
  gl.useProgram(program);
  setShaderUniforms(gl, program, width, height, time);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, quadVertexCount);
  gl.finish();

  const pixels = new Uint8Array(width * height * pixelStride);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  gl.deleteBuffer(buffer);
  gl.deleteProgram(program);

  return pixels;
};

const comparePixels = (a: Uint8Array, b: Uint8Array) => {
  let sum = 0;
  let count = 0;

  for (let i = 0; i < a.length; i += pixelStride) {
    const dr = a[i] - b[i];
    const dg = a[i + 1] - b[i + 1];
    const db = a[i + 2] - b[i + 2];

    sum += dr * dr + dg * dg + db * db;
    count += comparedPixelChannels;
  }

  const error = Math.sqrt(sum / count) / 255;

  return {
    error,
    rating: clamp01(1 - error),
  };
};

const getComparisonTimes = (options: ShaderSimilarityOptions) => {
  const samples = options.samples ?? comparisonSamples;
  const duration = options.duration ?? comparisonDuration;

  return (
    options.times ??
    Array.from({ length: samples }, (_, index) =>
      samples === 1 ? 0 : (index / (samples - 1)) * duration,
    )
  );
};

const compareTimeSamples = (
  solutionCode: string,
  userCode: string,
  options: ShaderSimilarityOptions,
): ShaderSimilarityResult => {
  const width = options.width ?? comparisonWidth;
  const height = options.height ?? comparisonHeight;
  const times = getComparisonTimes(options);
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
) => compareTimeSamples(solutionCode, userCode, {
  ...options,
  times: options.times ?? [options.time ?? 0],
});

export const compareShadersDynamic = (
  solutionCode: string,
  userCode: string,
  options: ShaderSimilarityOptions = {},
) => compareTimeSamples(solutionCode, userCode, options);
