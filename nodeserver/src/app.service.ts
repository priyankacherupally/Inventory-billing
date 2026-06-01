import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health() {
    return {
      status: 'ok',
      service: 'patternlab-combo-server',
      timestamp: new Date().toISOString(),
    };
  }
}
