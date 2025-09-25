import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../apex/user/entities/user.entity';
import { RevokedToken } from '../entities/revoked-token.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(RevokedToken) private readonly revokedRepo: Repository<RevokedToken>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('auth.jwtSecret'),
    });
  }

  async validate(payload: any) {
    const user = await this.usersRepo.findOne({ where: { id: payload.sub } });
    if (!user || !user.isActive) throw new UnauthorizedException();
    const tokenVer = typeof payload.ver === 'number' ? payload.ver : 0;
    if (tokenVer !== user.tokenVersion) throw new UnauthorizedException();
    // Reject if this specific JWT is revoked
    if (payload.jti) {
      const revoked = await this.revokedRepo.findOne({ where: { jti: payload.jti } });
      if (revoked) throw new UnauthorizedException();
    }
    return payload; // attached to req.user
  }
}
