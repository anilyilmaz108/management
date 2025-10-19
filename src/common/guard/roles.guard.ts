import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  ForbiddenException,
  Logger 
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../enum/roles.enum';
import { ROLES_KEY } from '../decorator/roles.decorator';


@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Controller veya Handler'dan gerekli rolleri al
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(), // Method seviyesi @Roles()
      context.getClass(),   // Controller seviyesi @Roles()
    ]);

    // Eğer @Roles() decorator'ı kullanılmamışsa erişime izin ver
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    // console.log(user);

    // JwtAuthGuard'dan gelen user bilgisi yoksa hata fırlat
    if (!user) {
      this.logger.warn('User information not found in request');
      throw new ForbiddenException('User information not found');
    }

    // Kullanıcının rolü gerekli roller arasında var mı kontrol et
    const hasRole = requiredRoles.some(role => role === user.role);

    if (!hasRole) {
      this.logger.warn(
        `User ${user.email} (role: ${user.role}) attempted to access resource requiring roles: [${requiredRoles.join(', ')}]`
      );
      throw new ForbiddenException(
        'You do not have permission to access this resource'
      );
    }

    this.logger.debug(
      `User ${user.email} (role: ${user.role}) granted access to resource`
    );

    return true;
  }
}
