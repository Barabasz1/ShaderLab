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

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Create a project and its first linked shader' })
  async createProject(
    @Body() data: { name: string },
    @AuthenticatedUser() user: any,
  ) {
    return this.prisma.project.create({
      data: {
        name: data.name,
        ownerId: user.sub,
        shaders: {
          create: [
            {
              name: 'Main Shader',
              shader: {
                create: { graph: {}, code: '' },
              },
            },
          ],
        },
      },
      include: { shaders: { include: { shader: true } } },
    });
  }

  @Get(':id')
  async getProjectById(@Param('id') id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        shaders: { include: { shader: true } },
        collaborators: true,
      },
    });

    if (!project) throw new NotFoundException('Project not found');
    return project;
  }
}
