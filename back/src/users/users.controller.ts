import { Controller, Get, Post, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('sync')
  @ApiOperation({ summary: 'Sync Keycloak login with PostgreSQL database' })
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
        // todo drop password hash
        password_hash: 'managed_by_keycloak',
      },
    });

    return dbUser;
  }

  @Get('me')
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
  @ApiOperation({ summary: 'Delete your account and all associated data' })
  async deleteAccount(@AuthenticatedUser() user: any) {
    return this.prisma.user.delete({
      where: { id: user.sub },
    });
  }
}
