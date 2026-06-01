import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByUsernameWithPassword(
      dto.username,
    );

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      role: user.role,
    };

    const token = await this.jwtService.signAsync({
      sub: safeUser.id,
      username: safeUser.username,
      role: safeUser.role,
    });

    return { token, user: safeUser };
  }

  async me(userId: string) {
    return this.usersService.findOne(userId);
  }
}