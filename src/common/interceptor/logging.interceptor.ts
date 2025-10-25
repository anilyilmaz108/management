import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();
    const { method, originalUrl } = request;

    const correlationId = request.correlationId;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const statusCode = response.statusCode;

        const log = {
          correlationId,
          method,
          originalUrl,
          statusCode,
          duration,
        };

        // Prod projede Winston/Elastic üzerinden yazılır
        console.log('PERF_LOG:', log);
      }),
    );
  }
}
