import { Injectable } from '@nestjs/common/decorators';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async ensureUserExists(user: any) {
    return this.prisma.user.upsert({
      where: { id: user.sub },
      update: {},
      create: {
        id: user.sub,
        email: user.email || `${user.preferred_username}@shaderlab.local`,
        username: user.preferred_username,
        password_hash: 'managed_by_keycloak',
      },
    });
  }
}
