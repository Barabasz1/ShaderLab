import { ControlValue, getGraphState, setGraphState } from "@/components/state/graphState";
import { useCallback } from "react";

export function useNodeChange() {
  const onControlChange = useCallback(
    (nodeId: string, controlId: string, value: ControlValue) => {
      setGraphState({
        nodes: getGraphState().nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                controlValues: {
                  ...(node.controlValues ?? {}),
                  [controlId]: value,
                },
              }
            : node,
        ),
      });
    },
    [],
  );

  const onInlineValueChange = useCallback(
    (nodeId: string, inputId: string, value: ControlValue) => {
      setGraphState({
        nodes: getGraphState().nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                inlineValues: {
                  ...(node.inlineValues ?? {}),
                  [inputId]: value,
                },
              }
            : node,
        ),
      });
    },
    [],
  );

  return { onControlChange, onInlineValueChange };
}
