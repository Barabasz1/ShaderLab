import { Controller, Get, Post, Delete } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller({ version: '1', path: 'users' })
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('sync')
  @ApiOperation({
    summary: 'Sync user',
    description:
      'Creates or updates the authenticated user in the database based on their Keycloak profile. Call this on every login.',
  })
  @ApiResponse({ status: 201, description: 'User synced successfully.' })
  async syncUser(@AuthenticatedUser() user: any) {
    const dbUser = await this.prisma.user.upsert({
      where: { id: user.sub },
      update: {
        email: user.email || `${user.preferred_username}@shaderlab.local`,
        username: user.preferred_username,
      },
      create: {
        id: user.sub,
        email: user.email || `${user.preferred_username}@shaderlab.local`,
        username: user.preferred_username,
        password_hash: 'managed_by_keycloak',
      },
    });

    return dbUser;
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get my profile',
    description:
      "Returns the authenticated user's profile including owned projects, collaborations, and submissions.",
  })
  @ApiResponse({ status: 200, description: 'User profile returned.' })
  @ApiResponse({
    status: 404,
    description: 'User not found — call /sync first.',
  })
  async getProfile(@AuthenticatedUser() user: any) {
    return this.prisma.user.findUnique({
      where: { id: user.sub },
      include: {
        ownedProjects: {
          include: { shaders: { include: { shader: true } } },
        },
        collaborations: {
          include: { project: true },
        },
        submissions: true,
      },
    });
  }

  @Delete('me')
  @ApiOperation({
    summary: 'Delete account',
    description:
      "Permanently deletes the authenticated user's account and all associated data including projects and shaders.",
  })
  @ApiResponse({ status: 200, description: 'Account deleted.' })
  async deleteAccount(@AuthenticatedUser() user: any) {
    return this.prisma.user.delete({
      where: { id: user.sub },
    });
  }
}
