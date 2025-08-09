import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ConfigService} from "@nestjs/config";
import {ValidationPipe} from "@nestjs/common";
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  const configService = app.get(ConfigService);
  // Read the port from .env, defaulting to 3000 if not set
  const port = configService.get<number>('APP_PORT', 3000);
  console.log("this is port ",port)

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Strips away properties that are not defined in the DTO
    forbidNonWhitelisted: true, // Throws an error if non-whitelisted properties are sent
    transform: true, // Automatically transforms payload objects to DTO instances
  }));
  await app.listen(port);
}
bootstrap();
