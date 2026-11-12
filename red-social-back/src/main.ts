import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Fundamental para que el front de Angular se conecte
  await app.listen(3000);
}
bootstrap();
