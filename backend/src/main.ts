import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable cookie parser
  app.use(cookieParser());

  // Enable helmet
  app.use(helmet());

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Register global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configure CORS with explicit settings
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const allowedOrigins = frontendUrl.split(',');

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
void bootstrap();
