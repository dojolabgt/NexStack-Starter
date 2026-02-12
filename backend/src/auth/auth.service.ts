import { Injectable, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { UserRole } from './constants/roles';
import { User } from '../users/user.entity';

import { SettingsService } from '../settings/settings.service';
import { RegisterDto } from './dto/register.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private settingsService: SettingsService,
    private mailService: MailService,
  ) { }

  async register(registerDto: RegisterDto) {
    const settings = await this.settingsService.getSettings();
    if (!settings.allowRegistration) {
      throw new ForbiddenException('Registration is disabled by administrator');
    }

    const existingUser = await this.usersService.findOneByEmail(registerDto.email);
    if (existingUser) {
      throw new ForbiddenException('User already exists');
    }

    const newUser = await this.usersService.create(registerDto);
    return this.login(this.mapToAuthenticatedUser(newUser));
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return { message: 'If user exists, email sent' };
    }

    // Generate specific reset token
    const token = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, type: 'reset' },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '1h',
      },
    );

    // For now, log to console
    this.configService.get('NODE_ENV') !== 'production' &&
      console.log(`Reset Token for ${email}: ${token}`);

    try {
      await this.mailService.sendPasswordReset(user, token);
    } catch (error) {
      console.error(`Error sending email to ${user.email}:`, error);
      // We might not want to throw here to avoid leaking error details or blocking the flow
      // But depending on requirements, we could throw. 
      // For now, let's log and proceed as "success" to UI to avoid enumeration, but maybe log internally.
    }

    return { message: 'If user exists, email sent', token }; // Returning token for dev ease, remove in prod!!
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (payload.type !== 'reset') {
        throw new ForbiddenException('Invalid token type');
      }

      const user = await this.usersService.findOneById(payload.sub);
      if (!user) {
        throw new ForbiddenException('Invalid token');
      }

      await this.usersService.setPassword(user.id, newPassword);

      return { message: 'Password updated successfully' };

    } catch (error) {
      throw new ForbiddenException('Invalid or expired token');
    }
  }

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
