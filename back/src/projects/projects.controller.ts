import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  NotFoundException,
  Delete,
  ForbiddenException,
  Patch,
  Query,
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

  @Get('community')
  async getCommunityProjects(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '9',
  ) {
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where: { isPublic: true },
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { shaders: true } } },
      }),
      this.prisma.project.count({ where: { isPublic: true } }),
    ]);

    return { projects, total };
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

  @Get()
  async getUserProjects(
    @AuthenticatedUser() user: any,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '9',
  ) {
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where: { ownerId: user.sub },
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { shaders: true } } },
      }),
      this.prisma.project.count({ where: { ownerId: user.sub } }),
    ]);

    return { projects, total };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  async deleteProject(@Param('id') id: string, @AuthenticatedUser() user: any) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.ownerId !== user.sub)
      throw new ForbiddenException('Not the project owner');
    return this.prisma.project.delete({ where: { id } });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project name, description and visibility' })
  async updateProject(
    @Param('id') id: string,
    @Body() data: { name?: string; description?: string; isPublic?: boolean },
    @AuthenticatedUser() user: any,
  ) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.ownerId !== user.sub)
      throw new ForbiddenException('Not the project owner');

    return this.prisma.project.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),
      },
    });
  }
}
