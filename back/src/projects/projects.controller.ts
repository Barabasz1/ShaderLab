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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AuthenticatedUser, Public, Unprotected } from 'nest-keycloak-connect';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client/extension';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller({ version: '1', path: 'projects' })
export class ProjectsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a project',
    description:
      'Creates a new project with an initial empty shader for the authenticated user.',
  })
  @ApiResponse({ status: 201, description: 'Project created successfully.' })
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

  @Public()
  @Get('community')
  @ApiOperation({
    summary: 'Get community projects',
    description:
      'Returns a paginated list of all public projects. No authentication required.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Number of results per page (default: 9)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Filter projects by name',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of public projects.',
  })
  async getCommunityProjects(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '9',
    @Query('search') search = '',
  ) {
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const take = parseInt(pageSize);
    const where = {
      isPublic: true,
      ...(search && {
        name: { contains: search, mode: 'insensitive' as const },
      }),
    };

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { shaders: true } } },
      }),
      this.prisma.project.count({ where }),
    ]);

    return { projects, total };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get project by ID',
    description: 'Returns a single project with its shaders.',
  })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Project found.' })
  @ApiResponse({ status: 404, description: 'Project not found.' })
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
  @ApiOperation({
    summary: 'Get my projects',
    description:
      'Returns a paginated list of projects owned by the authenticated user.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: 'Number of results per page (default: 9)',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of user projects.' })
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
  @ApiOperation({
    summary: 'Delete a project',
    description:
      'Deletes a project. Only the project owner can perform this action.',
  })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Project deleted.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — not the project owner.',
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  @ApiOperation({ summary: 'Delete a project' })
  async deleteProject(@Param('id') id: string, @AuthenticatedUser() user: any) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.ownerId !== user.sub)
      throw new ForbiddenException('Not the project owner');
    return this.prisma.project.delete({ where: { id } });
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a project',
    description:
      'Updates project name, description, or visibility. Only the project owner can perform this action.',
  })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  @ApiResponse({ status: 200, description: 'Project updated.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden — not the project owner.',
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
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
