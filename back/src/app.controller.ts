import { Controller, Get } from '@nestjs/common';
import { Unprotected } from 'nest-keycloak-connect';

@Controller()
export class AppController {
  @Get()
  @Unprotected()
  healthCheck() {
    return { status: 'ShaderLab API is running!' };
  }
}
