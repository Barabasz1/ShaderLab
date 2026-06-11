import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Shaders')
@ApiBearerAuth()
@Controller({ version: '1', path: 'shaders' })
export class ShadersController {
  constructor(private prisma: PrismaService) {}

  private async getShaderForProject(projectId: string, userId: string) {
    const link = await this.prisma.projectShader.findFirst({
      where: {
        projectId,
        project: {
          OR: [{ ownerId: userId }, { collaborators: { some: { userId } } }],
        },
      },
      include: { shader: true },
    });
    if (!link) throw new NotFoundException('Shader not found');
    return link.shader;
  }

  @Get('project/:projectId')
  @ApiOperation({
    summary: 'Get shader',
    description:
      'Returns the shader linked to a project. Accessible by the project owner.',
  })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Shader returned.' })
  @ApiResponse({
    status: 404,
    description: 'Shader not found or access denied.',
  })
  async getShader(
    @AuthenticatedUser() user: any,
    @Param('projectId') projectId: string,
  ) {
    return this.getShaderForProject(projectId, user.sub);
  }

  @Patch('project/:projectId/autosave')
  @ApiOperation({
    summary: 'Autosave shader',
    description:
      'Saves the current graph and generated GLSL code for a project shader. Accessible by the project owner.',
  })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Shader saved.' })
  @ApiResponse({
    status: 404,
    description: 'Shader not found or access denied.',
  })
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
