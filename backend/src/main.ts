import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

function validateEnv() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32) {
    console.error(
      '❌ FATAL: JWT_SECRET is missing or too short (min 32 chars). ' +
      'Set it in your .env file. Refusing to start.',
    );
    process.exit(1);
  }
}

async function bootstrap() {
  validateEnv();
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Backend running at http://localhost:${port}/graphql`);
}

bootstrap();
