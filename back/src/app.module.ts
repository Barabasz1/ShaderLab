import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { 
  KeycloakConnectModule, 
  AuthGuard, 
  ResourceGuard, 
  RoleGuard 
} from 'nest-keycloak-connect';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';
import { PuzzlesModule } from './puzzles/puzzles.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    ProjectsModule,
    PuzzlesModule,
    KeycloakConnectModule.register({
      authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL!,
      realm: process.env.KEYCLOAK_REALM!,
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      secret: process.env.KEYCLOAK_SECRET!,
      bearerOnly: true, 
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AppModule {}