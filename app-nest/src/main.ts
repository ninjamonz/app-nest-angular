import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { initializeApp, cert } from 'firebase-admin/app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false, // BFF
    }),
  );

  // --------------------------- SWAGGER --------------------------- //
  const config = new DocumentBuilder()
    .setTitle('Secret experiment.')
    .setDescription('We are electric.')
    .setVersion('0.1')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // --------------------------- FIREBASE --------------------------- //
  initializeApp({
    credential: cert(process.env.FIREBASE_ADMIN_SDK_CONFIG),
  });

  await app.listen(3000);
}
bootstrap();
