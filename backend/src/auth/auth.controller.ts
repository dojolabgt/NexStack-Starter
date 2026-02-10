import { Controller, Post, UseGuards, Req, Res, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import type { Response as ExpressResponse, Request as ExpressRequest } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
        console.log('POST /auth/login called for user:', req.user);
        const { accessToken, refreshToken } = await this.authService.login(req.user);

        // Set Cookies
        res.cookie('Authentication', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60 * 1000, // 15 mins
        });

        res.cookie('Refresh', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        console.log('Cookies set successfully for user:', req.user?.['email']);
        console.log('Access token (first 20 chars):', accessToken.substring(0, 20));
        return res.send({ message: 'Login successful', user: req.user });
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Req() req: any, @Res() res: ExpressResponse) {
        if (req.user) {
            await this.authService.logout(req.user.id);
        }
        res.clearCookie('Authentication', { path: '/' });
        res.clearCookie('Refresh', { path: '/' });
        return res.send({ message: 'Logout successful' });
    }

    @UseGuards(RefreshTokenGuard)
    @Post('refresh')
    async refresh(@Req() req: any, @Res() res: ExpressResponse) {
        const { accessToken, refreshToken } = await this.authService.refreshTokens(
            req.user.sub,
            req.user.refreshToken,
        );
        // Set Cookies
        res.cookie('Authentication', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60 * 1000, // 15 mins
        });

        res.cookie('Refresh', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        return res.send({ message: 'Refresh successful' });
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Req() req: any) {
        console.log('GET /auth/me called');
        console.log('Cookies:', req.cookies);
        console.log('User from JWT:', req.user);

        const user = await this.authService.getUserById(req.user.id);
        if (!user) {
            console.log('User not found in database');
            throw new UnauthorizedException();
        }
        const { password, refreshToken, ...result } = user;
        console.log('Returning user:', result);
        return result;
    }

    @Get('csrf')
    getCsrfToken(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
        return res.send({ csrfToken: 'CSRF_TOKEN_PLACEHOLDER' });
    }
}
