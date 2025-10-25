import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class PasswordPolicyPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (!value.password) {
      throw new BadRequestException('Password is required');
    }

    const password = value.password;
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,])[A-Za-z\d@$!%*?&.,]{8,}$/;

    if (!regex.test(password)) {
      throw new BadRequestException(
        'Password must include uppercase, lowercase, number, special character and be at least 8 characters long.',
      );
    }

    return value;
  }
}
