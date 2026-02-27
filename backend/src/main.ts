import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://fitness-coaching-platform-frontend.vercel.app',
      'https://fitness-coaching-platform-frontend-alwylfmtu.vercel.app',
      process.env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
  });

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT || 4000);
  console.log(`Backend running on http://localhost:4000`);
}
bootstrap();
