import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
   app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,               // strips unknown properties
      forbidNonWhitelisted: true,    // throws if unknown props are sent
      transform: true,               // auto-converts types
    }),
  );
   app.enableCors({
    origin: process.env.CORS_ORIGIN === '*' ? true : process.env.CORS_ORIGIN,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
