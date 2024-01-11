import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  All,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Query,
  Req,
  Request,
} from '@nestjs/common';
import axios from 'axios';
import { Cache } from 'cache-manager';


@Controller()
export class AppController {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  @All('/:service')
  async getBffService(
    @Req() request: Request,
    @Param('service') service: string,
    @Query('id') id: string,
  ): Promise<any> {

    if (!process.env[service])
      throw new HttpException('Something is wrong', HttpStatus.BAD_GATEWAY);

    const pathReguest =
      request.method === 'GET' && request.url.includes('products');

    try {
      if (pathReguest) {
        const cache = await this.cacheManager.get(request.url);
        if (cache) return cache || null;
      }

      const response = await axios.request({
        method: request.method,
        url: process.env[service] + (id ? `/${id}` : ''),
        data: Object.keys(request.body).length > 0 ? request.body : null,
      });

      if (pathReguest) await this.cacheManager.set(request.url, response.data);

      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response.data.message,
        error.response.status,
      );
    }
  }
}