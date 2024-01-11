import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({}),
    HttpModule,
    CacheModule.register({ ttl: 120 }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
