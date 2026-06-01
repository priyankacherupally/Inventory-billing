import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly config: ConfigService) {}

  login(dto: LoginDto) {
    const validUser = this.config.get<string>('STATIC_USERNAME', 'admin');
    const validPass = this.config.get<string>('STATIC_PASSWORD', 'admin@123');

    if (dto.username !== validUser || dto.password !== validPass) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const user = {
      id: '1',
      username: validUser,
      name: 'Admin',
      role: 'admin',
    };

    const payload = {
      sub: user.id,
      username: user.username,
      iat: Date.now(),
    };
    const token = Buffer.from(JSON.stringify(payload)).toString('base64');

    return { token, user };
  }
}
