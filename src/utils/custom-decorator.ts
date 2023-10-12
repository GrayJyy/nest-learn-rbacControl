import { SetMetadata } from '@nestjs/common';

export const RequireLogin = () => SetMetadata('require_login', true);
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata('require_permission', permissions);
