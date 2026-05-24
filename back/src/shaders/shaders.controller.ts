import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Shaders')
@ApiBearerAuth()
@Controller('shaders')
export class ShadersController {
  constructor(private prisma: PrismaService) {}

  private async getShaderForProject(projectId: string, userId: string) {
    const link = await this.prisma.projectShader.findFirst({
      where: {
        projectId,
        project: {
          OR: [
            { ownerId: userId },
            { collaborators: { some: { userId } } },
          ],
        },
      },
      include: { shader: true },
    });
    if (!link) throw new NotFoundException('Shader not found');
    return link.shader;
  }

  @Get('project/:projectId')
  async getShader(
    @AuthenticatedUser() user: any,
    @Param('projectId') projectId: string,
  ) {
    return this.getShaderForProject(projectId, user.sub);
  }

  @Patch('project/:projectId/autosave')
  @ApiOperation({ summary: 'Autosave shader for a project' })
  async autosave(
    @AuthenticatedUser() user: any,
    @Param('projectId') projectId: string,
    @Body() data: { graph: any; code: string },
  ) {
    const shader = await this.getShaderForProject(projectId, user.sub);
    return this.prisma.shader.update({
      where: { id: shader.id },
      data: { graph: data.graph, code: data.code },
    });
  }
}