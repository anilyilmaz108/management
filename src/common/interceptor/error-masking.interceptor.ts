import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class ErrorMaskingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const correlationId = request.correlationId;

    return next.handle().pipe(
      catchError((err) => {
        const status =
          err instanceof HttpException
            ? err.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const safeResponse = {
          success: false,
          message:
            err?.response?.message || 'Beklenmeyen bir hata oluştu.',
          code: err?.code || 'INTERNAL_ERROR',
          correlationId,
          timestamp: new Date().toISOString(),
        };

        // Gerçek hatanın loglanması
        console.error('ERROR_LOG:', {
          correlationId,
          message: err.message,
          stack: err.stack,
        });

        return throwError(
          () => new HttpException(safeResponse, status),
        );
      }),
    );
  }
}
