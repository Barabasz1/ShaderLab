import { Module } from '@nestjs/common';
import { PuzzlesController } from './puzzles.controller';

@Module({
  controllers: [PuzzlesController],
})
export class PuzzlesModule {}