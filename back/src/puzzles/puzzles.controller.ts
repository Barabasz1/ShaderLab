import { Controller, Get, Post, Param, Body, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthenticatedUser, Unprotected } from 'nest-keycloak-connect';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Puzzles')
@ApiBearerAuth()
@Controller('puzzles')
export class PuzzlesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Unprotected()
  @ApiBearerAuth('') 
  async getPuzzles() {
    return this.prisma.puzzle.findMany({
      select: { id: true, name: true, description: true } 
    });
  }

  @Post(':id/submissions')
  @ApiOperation({ summary: 'Submit an existing shader as a puzzle solution' })
  async submitSolution(
    @Param('id') puzzleId: string,
    @Body() data: { shaderId: string }, 
    @AuthenticatedUser() user: any
  ) {
      // this does not evalueate
    const mockRating = parseFloat(Math.random().toFixed(2));

    return this.prisma.puzzleSubmission.create({
      data: {
        puzzleId: puzzleId,
        userId: user.sub,
        shaderId: data.shaderId, // Link the submitted standalone shader
        rating: mockRating
      }
    });
  }
}