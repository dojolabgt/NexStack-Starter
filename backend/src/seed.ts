import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { UserRole } from './auth/constants/roles';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const configService = app.get(ConfigService);
  const adminPassword =
    configService.get<string>('SEED_ADMIN_PASSWORD') || 'admin123';
  const clientPassword =
    configService.get<string>('SEED_CLIENT_PASSWORD') || 'client123';
  const teamPassword =
    configService.get<string>('SEED_TEAM_PASSWORD') || 'team123';

  const users = [
    {
      email: 'admin@admin.com',
      password: adminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
    {
      email: 'client@client.com',
      password: clientPassword,
      name: 'Client User',
      role: UserRole.USER,
    },
    {
      email: 'team@team.com',
      password: teamPassword,
      name: 'Team User',
      role: UserRole.TEAM,
    },
  ];

  for (const userData of users) {
    const existingUser = await usersService.findOneByEmail(userData.email);
    if (existingUser) {
      console.log(`⏭️  User ${userData.email} already exists.`);
      if (existingUser.role !== userData.role) {
        await usersService.update(existingUser.id, { role: userData.role });
        console.log(
          `🔄 Updated role for ${userData.email} to ${userData.role}`,
        );
      }
    } else {
      // Pass plain password; UsersService.create handles hashing
      await usersService.create(userData);
      console.log(`✅ User ${userData.email} created successfully.`);
    }
  }

  await app.close();
  console.log('🌱 Database seeding completed!');
}

void bootstrap();
