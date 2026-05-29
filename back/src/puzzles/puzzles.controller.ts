import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthenticatedUser, Unprotected } from 'nest-keycloak-connect';
import { PrismaService } from '../prisma/prisma.service';
import { compareShaders } from './puzzle_evaluator';

@ApiTags('Puzzles')
@ApiBearerAuth()
@Controller('puzzles')
export class PuzzlesController {
  constructor(private prisma: PrismaService) {}

  private async ensureUserPuzzleSubmission(puzzleId: string, userId: string) {
    const puzzle = await this.prisma.puzzle.findUnique({
      where: { id: puzzleId },
      select: { id: true },
    });

    if (!puzzle) throw new NotFoundException('Puzzle not found');

    const existingSubmission = await this.prisma.puzzleSubmission.findUnique({
      where: { puzzleId_userId: { puzzleId, userId } },
      select: { id: true, shaderId: true, rating: true },
    });

    if (existingSubmission) return existingSubmission;

    const shader = await this.prisma.shader.create({
      data: { graph: {}, code: '' },
      select: { id: true },
    });

    return this.prisma.puzzleSubmission.create({
      data: {
        puzzleId,
        userId,
        shaderId: shader.id,
      },
      select: { id: true, shaderId: true, rating: true },
    });
  }

  @Get()
  @Unprotected()
  @ApiBearerAuth('')
  async getPuzzles() {
    return this.prisma.puzzle.findMany({
      select: { id: true, name: true, description: true },
    });
  }

  @Get(':id')
  async getPuzzleById(@Param('id') id: string, @AuthenticatedUser() user: any) {
    const puzzle = await this.prisma.puzzle.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        passingRating: true,
        solutionShader: {
          select: { code: true },
        },
      },
    });

    if (!puzzle) throw new NotFoundException('Puzzle not found');

    const submission = await this.ensureUserPuzzleSubmission(id, user.sub);

    return {
      ...puzzle,
      submission,
    };
  }

  @Get(':id/submission-shader')
  @ApiOperation({ summary: "Return the shader id for the user's puzzle submission" })
  async getSubmissionShaderId(
    @Param('id') puzzleId: string,
    @AuthenticatedUser() user: any,
  ) {   
    const submission = await this.ensureUserPuzzleSubmission(puzzleId, user.sub);
    return { shaderId: submission.shaderId };
  }

  @Post(':id/submissions')
  @ApiOperation({ summary: 'Create or overwrite the current user puzzle submission' })
  async submitSolution(
    @Param('id') puzzleId: string,
    @Body() data: { shaderId?: string; graph?: any; code?: string },
    @AuthenticatedUser() user: any,
  ) {
    const puzzle = await this.prisma.puzzle.findUnique({
      where: { id: puzzleId },
      select: {
        id: true,
        solutionShader: {
          select: { code: true },
        },
      },
    });

    if (!puzzle) throw new NotFoundException('Puzzle not found');
    if (!puzzle.solutionShader)
      throw new NotFoundException('Puzzle solution shader not found');

    const sourceShader = data.shaderId
      ? await this.prisma.shader.findUnique({
          where: { id: data.shaderId },
          select: { graph: true, code: true },
        })
      : null;

    if (data.shaderId && !sourceShader) throw new NotFoundException('Shader not found');

    const code = data.code ?? sourceShader?.code ?? '';
    const graph = data.graph ?? sourceShader?.graph ?? {};
    const rating = compareShaders(code, puzzle.solutionShader.code ?? '', true);

    const submission = await this.ensureUserPuzzleSubmission(puzzleId, user.sub);

    await this.prisma.shader.update({
      where: { id: submission.shaderId },
      data: { graph, code },
    });

    return this.prisma.puzzleSubmission.update({
      where: { puzzleId_userId: { puzzleId, userId: user.sub } },
      data: { rating },
      include: { shader: true },
    });
  }
}
