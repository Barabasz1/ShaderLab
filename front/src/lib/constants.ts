export const CAT: Record<string, { color: string; bg: string }> = {
  Math: { color: "hsl(199,89%,48%)", bg: "hsl(199,89%,94%)" },
  Logic: { color: "hsl(263,70%,58%)", bg: "hsl(263,70%,95%)" },
  Data: { color: "hsl(43,96%,42%)", bg: "hsl(43,96%,94%)" },
  IO: { color: "hsl(152,60%,40%)", bg: "hsl(152,60%,94%)" },
  Utility: { color: "hsl(0,0%,42%)", bg: "hsl(0,0%,94%)" },
};

export const CATALOG = [
  {
    cat: "Math",
    items: [
      {
        type: "add",
        label: "Add",
        icon: "+",
        inputs: ["a", "b"],
        outputs: ["result"],
      },
      {
        type: "subtract",
        label: "Subtract",
        icon: "−",
        inputs: ["a", "b"],
        outputs: ["result"],
      },
      {
        type: "multiply",
        label: "Multiply",
        icon: "×",
        inputs: ["a", "b"],
        outputs: ["result"],
      },
      {
        type: "divide",
        label: "Divide",
        icon: "÷",
        inputs: ["a", "b"],
        outputs: ["result"],
      },
      {
        type: "abs",
        label: "Abs",
        icon: "|x|",
        inputs: ["x"],
        outputs: ["result"],
      },
      {
        type: "clamp",
        label: "Clamp",
        icon: "[ ]",
        inputs: ["x", "min", "max"],
        outputs: ["result"],
      },
    ],
  },
  {
    cat: "Logic",
    items: [
      {
        type: "and",
        label: "AND",
        icon: "∧",
        inputs: ["a", "b"],
        outputs: ["out"],
      },
      {
        type: "or",
        label: "OR",
        icon: "∨",
        inputs: ["a", "b"],
        outputs: ["out"],
      },
      {
        type: "not",
        label: "NOT",
        icon: "¬",
        inputs: ["in"],
        outputs: ["out"],
      },
      {
        type: "compare",
        label: "Compare",
        icon: "≶",
        inputs: ["a", "b"],
        outputs: ["<", ">", "="],
      },
      {
        type: "branch",
        label: "Branch",
        icon: "⑂",
        inputs: ["cond", "t", "f"],
        outputs: ["out"],
      },
    ],
  },
  {
    cat: "Data",
    items: [
      {
        type: "number",
        label: "Number",
        icon: "#",
        inputs: [],
        outputs: ["value"],
      },
      {
        type: "string",
        label: "String",
        icon: '"',
        inputs: [],
        outputs: ["value"],
      },
      {
        type: "boolean",
        label: "Boolean",
        icon: "◉",
        inputs: [],
        outputs: ["value"],
      },
      {
        type: "array",
        label: "Array",
        icon: "[]",
        inputs: ["…"],
        outputs: ["arr"],
      },
      {
        type: "object",
        label: "Object",
        icon: "{}",
        inputs: ["…"],
        outputs: ["obj"],
      },
    ],
  },
  {
    cat: "IO",
    items: [
      {
        type: "input",
        label: "Input",
        icon: "→",
        inputs: [],
        outputs: ["value"],
      },
      {
        type: "output",
        label: "Output",
        icon: "←",
        inputs: ["value"],
        outputs: [],
      },
      { type: "log", label: "Log", icon: "▤", inputs: ["value"], outputs: [] },
      {
        type: "display",
        label: "Display",
        icon: "◫",
        inputs: ["value"],
        outputs: [],
      },
    ],
  },
  {
    cat: "Utility",
    items: [
      {
        type: "merge",
        label: "Merge",
        icon: "⇒",
        inputs: ["a", "b"],
        outputs: ["out"],
      },
      {
        type: "split",
        label: "Split",
        icon: "⇐",
        inputs: ["in"],
        outputs: ["a", "b"],
      },
      {
        type: "delay",
        label: "Delay",
        icon: "⏱",
        inputs: ["in"],
        outputs: ["out"],
      },
      { type: "comment", label: "Comment", icon: "✎", inputs: [], outputs: [] },
    ],
  },
];

export const META: Record<string, any> = {};
CATALOG.forEach(({ cat, items }) =>
  items.forEach((i) => {
    META[i.type] = { ...i, cat };
  }),
);
