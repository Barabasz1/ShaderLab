export const anchorCenter = (
  nodeId: string,
  side: string,
  port: string,
  anchorRefs: React.RefObject<Record<string, HTMLDivElement>>,
  wrapRef: React.RefObject<HTMLDivElement>,
) => {
  const key = `${nodeId}:${side}:${port}`;
  const el = anchorRefs.current[key];
  const wrap = wrapRef.current;
  if (!el || !wrap) return null;
  const er = el.getBoundingClientRect();
  const wr = wrap.getBoundingClientRect();
  return {
    x: er.left + er.width / 2 - wr.left,
    y: er.top + er.height / 2 - wr.top,
  };
};