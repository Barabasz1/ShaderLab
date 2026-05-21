import { forwardRef, memo, useEffect, useImperativeHandle, useRef } from "react";
import { createRenderer } from "@/webgl/webglRenderer";

export interface ShaderCanvasHandle {
  compile: (vertSrc: string, fragSrc: string) => { error: string | null };
}

const ShaderCanvas = forwardRef<ShaderCanvasHandle>(function ShaderCanvas(
  _props,
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ReturnType<typeof createRenderer> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      rendererRef.current = createRenderer(canvas);
    } catch (e) {
      console.error("WebGL init failed:", e);
    }

    return () => {
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      compile(vertSrc: string, fragSrc: string) {
        return rendererRef.current?.compile(vertSrc, fragSrc) ?? { error: "Renderer not ready" };
      },
    }),
    [],
  );

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />;
});

export default memo(ShaderCanvas);
