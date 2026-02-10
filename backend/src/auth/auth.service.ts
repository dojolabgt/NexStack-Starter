import { Injectable, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { UserRole } from './constants/roles';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async validateUser(
    email: string,
    pass: string,
  ): Promise<AuthenticatedUser | null> {
    const user = await this.usersService.findOneByEmailWithPassword(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return this.mapToAuthenticatedUser(user);
    }
    return null;
  }

  // Helper to centralize the mapping from User entity to AuthenticatedUser
  // This avoids scattered casting throughout the codebase

  private mapToAuthenticatedUser(user: User): AuthenticatedUser {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, refreshToken, ...result } = user;
    return result;
  }

  async login(user: AuthenticatedUser) {
    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string) {
    return this.usersService.update(userId, { refreshToken: null });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findOneById(userId);
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(userId: string, email: string, role: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, role },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async getUserById(userId: string) {
    return this.usersService.findOneById(userId);
  }
}
