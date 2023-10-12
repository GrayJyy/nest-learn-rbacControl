import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user/user.service';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { RedisService } from './redis/redis.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(UserService)
  private readonly userService: UserService;

  @Inject(Reflector)
  private readonly reflector: Reflector;

  @Inject(RedisService)
  private readonly redisService: RedisService;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const _request: Request = context.switchToHttp().getRequest();
    if (!_request.user) {
      return true;
    }
    const _requirePermissions = await this.reflector.getAllAndOverride(
      'require_permission',
      [context.getClass(), context.getHandler()],
    );

    // 从 redis 里查权限列表
    let _permissions = await this.redisService.listGet(
      `rbac_control_user_${_request.user.username}_permission`,
    );

    // 如果 redis 里没有 先存到 redis
    if (_permissions.length === 0) {
      const _roles = await this.userService.findRoleByIds(
        _request.user.roles.map((i) => i.id),
      );
      _permissions = _roles.reduce((total, current) => {
        total.push(...current.permissions.map((i) => i.name));
        return total;
      }, []);
      await this.redisService.listSet(
        `rbac_control_user_${_request.user.username}_permission`,
        _permissions,
        60 * 30, // 缓存时间 30分钟
      );
    }

    _requirePermissions.forEach((currentPermission: string) => {
      if (!_permissions.some((i) => i === currentPermission))
        throw new UnauthorizedException('无权限访问该接口');
    });
    return true;
  }
}
