/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable unicorn/no-null */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ApiConfigService } from '../../shared/services/api-config.service';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    public readonly configService: ApiConfigService,
    public readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.authConfig.jwtSecret,
    });
  }

  async validate({ iat, exp, id }, done: (arg0: null, arg1: unknown) => void) {
    const timeDiff = exp - iat;

    if (timeDiff <= 0) {
      throw new UnauthorizedException();
    }

    const user = await this.userService.findOne({
      id,
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    delete user.password;
    done(null, user);
  }
}
