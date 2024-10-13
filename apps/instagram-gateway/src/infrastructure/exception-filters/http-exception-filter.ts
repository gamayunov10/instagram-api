import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlContextType } from '@nestjs/graphql';

import { exceptionResponseType } from '../../base/types/exception.type';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const hostType = host.getType<GqlContextType>();

    switch (hostType) {
      case 'graphql':
        this.handleGraphQL(exception, host);
        break;
      case 'http':
        this.handleHttp(exception, host);
        break;
      case 'ws':
        this.handleWebSocket(exception, host);
        break;
      default:
        throw new Error('Unknown context type');
    }
  }

  private handleGraphQL(exception: HttpException, host: ArgumentsHost): void {
    const gqlHost = GqlArgumentsHost.create(host);
    const graphqlResponse = gqlHost.getContext(); // Получаем context для GraphQL

    const status = exception.getStatus();
    const responseBody: any = exception.getResponse();

    switch (status) {
      case HttpStatus.BAD_REQUEST:
      case HttpStatus.NOT_FOUND:
      case HttpStatus.UNAUTHORIZED:
      case HttpStatus.INTERNAL_SERVER_ERROR:
      case HttpStatus.FORBIDDEN:
        if (typeof responseBody.message !== 'string') {
          graphqlResponse.errors = responseBody.message;
        } else {
          graphqlResponse.errors = [{ message: responseBody.message }];
        }
        break;

      default:
        graphqlResponse.errors = [
          {
            statusCode: status,
            message: 'Unknown error occurred',
            timestamp: new Date().toISOString(),
          },
        ];
        break;
    }
  }

  private handleHttp(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    switch (status) {
      case HttpStatus.BAD_REQUEST:
      case HttpStatus.NOT_FOUND:
      case HttpStatus.UNAUTHORIZED:
      case HttpStatus.INTERNAL_SERVER_ERROR:
      case HttpStatus.FORBIDDEN:
        const errorsResponse: exceptionResponseType = {
          errorsMessages: [],
        };
        const responseBody: any = exception.getResponse();

        if (typeof responseBody.message !== 'string') {
          responseBody.message.forEach((m) =>
            errorsResponse.errorsMessages.push(m),
          );
          response.status(status).json(errorsResponse);
        } else {
          response.status(status).json({
            message: responseBody.message,
            statusCode: status,
            timestamp: new Date().toISOString(),
          });
        }
        break;

      default:
        response.status(status).json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
        break;
    }
  }

  private handleWebSocket(exception: HttpException, host: ArgumentsHost): void {
    const wsHost = host.switchToWs();
    const wsResponse = wsHost.getClient();

    const status = exception.getStatus();
    const responseBody: any = exception.getResponse();

    switch (status) {
      case HttpStatus.BAD_REQUEST:
      case HttpStatus.NOT_FOUND:
      case HttpStatus.UNAUTHORIZED:
      case HttpStatus.INTERNAL_SERVER_ERROR:
      case HttpStatus.FORBIDDEN:
        if (typeof responseBody.message !== 'string') {
          wsResponse.emit('error', responseBody.message);
        } else {
          wsResponse.emit('error', { message: responseBody.message });
        }
        break;

      default:
        wsResponse.emit('error', {
          statusCode: status,
          message: 'Unknown error occurred',
          timestamp: new Date().toISOString(),
        });
        break;
    }
  }
}
