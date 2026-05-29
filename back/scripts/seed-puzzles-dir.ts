import fs from 'node:fs';
import path from 'node:path';
import { prisma, disconnectPrisma } from './prisma-seed-client';

type ShaderSeed = {
  graph: unknown;
  code?: string | null;
};

type PuzzleSeed = {
  name?: string | null;
  description?: string | null;
  passingRating: number;
};

type SeedFolder = {
  dir: string;
  shaderPath: string;
  puzzlePath: string;
};

function readJson<T>(filePath: string): T {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf8');

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    throw new Error(`Invalid JSON in ${filePath}: ${(error as Error).message}`);
  }
}

function assertObject(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be a JSON object`);
  }
}

function validateShader(input: ShaderSeed, filePath: string) {
  assertObject(input, filePath);

  if (!('graph' in input)) {
    throw new Error(`${filePath} must contain "graph"`);
  }

  if ('code' in input && input.code !== null && typeof input.code !== 'string') {
    throw new Error(`${filePath} field "code" must be a string or null`);
  }
}

function validatePuzzle(input: PuzzleSeed, filePath: string) {
  assertObject(input, filePath);

  if (typeof input.passingRating !== 'number') {
    throw new Error(`${filePath} must contain numeric "passingRating"`);
  }

  if ('name' in input && input.name !== null && typeof input.name !== 'string') {
    throw new Error(`${filePath} field "name" must be a string or null`);
  }

  if (
    'description' in input &&
    input.description !== null &&
    typeof input.description !== 'string'
  ) {
    throw new Error(`${filePath} field "description" must be a string or null`);
  }
}

function hasSeedPair(dir: string): boolean {
  return (
    fs.existsSync(path.join(dir, 'shader.json')) &&
    fs.existsSync(path.join(dir, 'puzzle.json'))
  );
}

function findSeedFolders(rootDir: string): SeedFolder[] {
  const absoluteRoot = path.resolve(rootDir);

  if (!fs.existsSync(absoluteRoot)) {
    throw new Error(`Seed directory does not exist: ${absoluteRoot}`);
  }

  const stat = fs.statSync(absoluteRoot);
  if (!stat.isDirectory()) {
    throw new Error(`Seed path must be a directory: ${absoluteRoot}`);
  }

  if (hasSeedPair(absoluteRoot)) {
    return [
      {
        dir: absoluteRoot,
        shaderPath: path.join(absoluteRoot, 'shader.json'),
        puzzlePath: path.join(absoluteRoot, 'puzzle.json'),
      },
    ];
  }

  const folders = fs
    .readdirSync(absoluteRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(absoluteRoot, entry.name))
    .filter(hasSeedPair)
    .sort((a, b) => a.localeCompare(b))
    .map((dir) => ({
      dir,
      shaderPath: path.join(dir, 'shader.json'),
      puzzlePath: path.join(dir, 'puzzle.json'),
    }));

  if (folders.length === 0) {
    throw new Error(
      `No seed folders found in ${absoluteRoot}. Expected either:\n` +
        `  ${path.join(absoluteRoot, 'shader.json')}\n` +
        `  ${path.join(absoluteRoot, 'puzzle.json')}\n` +
        `or subfolders like:\n` +
        `  ${path.join(absoluteRoot, 'my-puzzle', 'shader.json')}\n` +
        `  ${path.join(absoluteRoot, 'my-puzzle', 'puzzle.json')}`,
    );
  }

  return folders;
}

async function seedOneFolder(folder: SeedFolder) {
  const shaderInput = readJson<ShaderSeed>(folder.shaderPath);
  const puzzleInput = readJson<PuzzleSeed>(folder.puzzlePath);

  validateShader(shaderInput, folder.shaderPath);
  validatePuzzle(puzzleInput, folder.puzzlePath);

  return prisma.$transaction(async (tx) => {
    const shader = await tx.shader.create({
      data: {
        graph: shaderInput.graph as object,
        code: shaderInput.code ?? null,
      },
    });

    const puzzle = await tx.puzzle.create({
      data: {
        name: puzzleInput.name ?? null,
        description: puzzleInput.description ?? null,
        passingRating: puzzleInput.passingRating,
        shaderId: shader.id,
      },
      include: {
        solutionShader: true,
      },
    });

    return { shader, puzzle };
  });
}

async function main() {
  const seedRoot = process.argv[2] ?? './seed/puzzles';
  const folders = findSeedFolders(seedRoot);

  console.log(`Found ${folders.length} puzzle seed folder(s).`);

  for (const folder of folders) {
    console.log(`\nSeeding: ${folder.dir}`);
    const result = await seedOneFolder(folder);
    console.log(`Created shader: ${result.shader.id}`);
    console.log(`Created puzzle: ${result.puzzle.id}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectPrisma();
  });
