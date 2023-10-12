import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { Role } from './user/entities/role.entity';

declare module 'express' {
  interface Request {
    user: { username: string; roles: Role[] };
  }
}

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject(JwtService)
  private readonly jwtService: JwtService;

  @Inject(Reflector)
  private readonly reflector: Reflector;
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const _request: Request = context.switchToHttp().getRequest();
    const _authorization = _request.headers?.authorization;
    const _isRequireLogin = this.reflector.getAllAndOverride<boolean, string>(
      'require_login',
      [context.getClass(), context.getHandler()],
    );

    if (!_isRequireLogin) return true;
    if (!_authorization) throw new UnauthorizedException('用户未登录');
    try {
      const _token = _authorization.split(' ')[1];
      const _data: { user: { username: string; roles: Role[] } } =
        this.jwtService.verify(_token);
      _request.user = _data.user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('token 失效，请重新登录');
    }
  }
}
