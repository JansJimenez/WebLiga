import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. Prefijo global para versionamiento de la API REST
  app.setGlobalPrefix('api/v1');

  // 2. Habilitación de CORS para consumo desde Portal Web, PWA y Admin
  app.enableCors({
    origin: '*', // Configurable según variables de entorno para producción
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 3. Configuración estricta del ValidationPipe Global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remueve automáticamente propiedades que no estén en el DTO
      forbidNonWhitelisted: true, // Retorna error 400 si se envían propiedades no declaradas
      transform: true, // Transforma automáticamente payloads a las instancias y tipos de los DTOs
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`=======================================================`);
  logger.log(`⚽ API Liga Provincial de Fútbol en ejecución`);
  logger.log(`🚀 Servidor escuchando en: http://localhost:${port}/api/v1`);
  logger.log(`🛡️  Seguridad RBAC y Autenticación JWT activadas`);
  logger.log(`=======================================================`);
}

bootstrap();
