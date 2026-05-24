let uid = 100;
export const makeId = () => String(++uid);

export const syncUid = (nodes: UiNode[], edges: UiEdge[]) => {
  let ids = [...nodes, ...edges].map((x) => parseInt(x.id)).filter(isFinite);

  if (ids.length === 0) return;

  uid = Math.max(uid, ...ids);
};
