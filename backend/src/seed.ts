import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { UserRole } from './users/user.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);

    const users = [
        {
            email: 'admin@admin.com',
            password: 'admin123',
            name: 'Admin User',
            role: UserRole.ADMIN,
        },
        {
            email: 'client@client.com',
            password: 'client123',
            name: 'Client User',
            role: UserRole.CLIENT,
        },
        {
            email: 'team@team.com',
            password: 'team123',
            name: 'Team User',
            role: UserRole.TEAM,
        },
    ];

    for (const userData of users) {
        const existingUser = await usersService.findOneByEmail(userData.email);
        if (existingUser) {
            console.log(`⏭️  User ${userData.email} already exists.`);
        } else {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            await usersService.create({
                ...userData,
                password: hashedPassword,
            });
            console.log(`✅ User ${userData.email} created successfully.`);
        }
    }

    await app.close();
    console.log('🌱 Database seeding completed!');
}

bootstrap();

