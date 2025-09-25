import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private readonly config: ConfigService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const auth = req.headers['authorization'];
    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.slice(7);
      try {
        const payload = jwt.verify(token, this.config.get<string>('auth.jwtSecret')!);
        (req as any).user = payload;
      } catch (_) {
        // ignore invalid tokens in middleware
      }
    }
    next();
  }
}

