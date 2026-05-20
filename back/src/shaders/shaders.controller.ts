import { Controller, Get, Patch, Param, Body, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Shaders')
@ApiBearerAuth()
@Controller('shaders')
export class ShadersController {
  constructor(private prisma: PrismaService) {}

  @Get(':id')
  async getShader(@Param('id') id: string) {
    // Note: You should add permission logic here to ensure the user 
    // is either the owner or a collaborator on the project this shader belongs to.
    return this.prisma.shader.findUnique({ where: { id } });
  }

  @Patch(':id/autosave')
  @ApiOperation({ summary: 'Autosave an independent shader graph' })
  async autosave(
    @Param('id') id: string,
    @Body() data: { graph: any, code: string }
  ) {
    return this.prisma.shader.update({
      where: { id },
      data: { graph: data.graph, code: data.code }
    });
  }
}