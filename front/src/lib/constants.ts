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
