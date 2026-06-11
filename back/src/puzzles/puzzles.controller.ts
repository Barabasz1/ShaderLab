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
import { compareShaders } from './puzzle_evaluator';

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
          select: { code: true }, // delete
        },
      },
    });

    if (!puzzle) throw new NotFoundException('Puzzle not found');
    return puzzle;
  }

  // @Get(':id/preview')
  // @Unprotected()
  // async getPuzzlePreview(
  //   @Param('id') id: string,
  //   @Res() res: Response,
  // ) {
  //   const puzzle = await this.prisma.puzzle.findUnique({
  //     where: { id },
  //     select: { solutionShader: { select: { code: true } } },
  //   });

  //   if (!puzzle) throw new NotFoundException('Puzzle not found');

  //   const png = this.shaderRenderer.renderToPng(puzzle.solutionShader.code);

  //   res.setHeader('Content-Type', 'image/png');
  //   res.setHeader('Cache-Control', 'public, max-age=86400');
  //   res.send(png);
  // }

  // @Post(':id/submissions')
  // @ApiOperation({ summary: 'Submit an existing shader as a puzzle solution' })
  // async submitSolution(
  //   @Param('id') puzzleId: string,
  //   @Body() data: { shaderId?: string; code?: string },
  //   @AuthenticatedUser() user: any,
  // ) {
  //   const puzzle = await this.prisma.puzzle.findUnique({
  //     where: { id: puzzleId },
  //     select: {
  //       id: true,
  //       solutionShader: {
  //         select: { code: true },
  //       },
  //     },
  //   });

  //   if (!puzzle) throw new NotFoundException('Puzzle not found');
  //   if (!puzzle.solutionShader)
  //     throw new NotFoundException('Puzzle solution shader not found');

  //   const shader = data.shaderId
  //     ? await this.prisma.shader.findUnique({
  //       where: { id: data.shaderId },
  //       select: { id: true, code: true },
  //     })
  //     : data.code
  //       ? await this.prisma.shader.create({
  //         data: { graph: {}, code: data.code },
  //         select: { id: true, code: true },
  //       })
  //       : null;

  //   if (!shader) throw new NotFoundException('Shader not found');

  //   const rating = compareShaders(shader.code, puzzle.solutionShader.code, true);

  //   return this.prisma.puzzleSubmission.create({
  //     data: {
  //       puzzleId,
  //       userId: user.sub,
  //       shaderId: shader.id,
  //       rating,
  //     },
  //   });
  // }
}
