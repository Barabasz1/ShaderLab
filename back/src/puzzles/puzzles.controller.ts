import {
  Controller,
  Get,
  Res,
  Post,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthenticatedUser, Unprotected } from 'nest-keycloak-connect';
import { PrismaService } from '../prisma/prisma.service';


@ApiTags('Puzzles')
@ApiBearerAuth()
@Controller({ version: '1', path: 'puzzles' })
export class PuzzlesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Unprotected()
  @ApiBearerAuth('')
  @ApiOperation({
    summary: 'Get all puzzles',
    description:
      'Returns a list of all available puzzles. No authentication required.',
  })
  @ApiResponse({ status: 200, description: 'List of puzzles returned.' })
  async getPuzzles() {
    return this.prisma.puzzle.findMany({
      select: { id: true, name: true, description: true },
    });
  }

  @Get(':id')
  @Unprotected()
  @ApiBearerAuth('')
  @ApiOperation({
    summary: 'Get puzzle by ID',
    description:
      'Returns a single puzzle with its details and passing rating. No authentication required.',
  })
  @ApiParam({ name: 'id', description: 'Puzzle UUID' })
  @ApiResponse({ status: 200, description: 'Puzzle returned.' })
  @ApiResponse({ status: 404, description: 'Puzzle not found.' })
  async getPuzzleById(@Param('id') id: string) {
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
    return puzzle;
  }



  @Post(':id/submissions')
  @ApiOperation({ summary: 'Submit a puzzle rating' })
  async submitSolution(
    @Param('id') puzzleId: string,
    @Body() data: { shaderId: string; rating?: number },
    @AuthenticatedUser() user: any,
  ) {
    return this.prisma.puzzleSubmission.create({
      data: {
        puzzleId,
        userId: user.sub,
        shaderId: data.shaderId,
        rating: data.rating,
      },
    });
  }

  @Post(':id/submissions/v2')
  @ApiOperation({ summary: 'Submit puzzle shader data' })
  async submitSolutionV2(
    @Param('id') puzzleId: string,
    @Body() data: { graph: any; code?: string; rating?: number },
    @AuthenticatedUser() user: any,
  ) {
    const existing = await this.prisma.puzzleSubmission.findFirst({
      where: { puzzleId, userId: user.sub },
      select: { id: true, shaderId: true },
    });

    if (existing) {
      await this.prisma.shader.update({
        where: { id: existing .shaderId },
        data: { graph: data.graph, code: data.code },
      });

      return this.prisma.puzzleSubmission.update({
        where: { id: existing .id },
        data: { rating: data.rating },
      });
    }

    const shader = await this.prisma.shader.create({
      data: { graph: data.graph, code: data.code },
      select: { id: true },
    });

    return this.prisma.puzzleSubmission.create({
      data: {
        puzzleId,
        userId: user.sub,
        shaderId: shader.id,
        rating: data.rating,
      },
    });
  }
}
