import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GqlArgumentsHost, GqlContextType } from '@nestjs/graphql';
import { GraphQLError } from 'graphql/error';

import { exceptionResponseType } from '../../base/types/exception.type';
import { ExceptionCodes } from '../../base/enums/exception-code.enum';

const throwInputGraphqlError = <T>(
  message: string,
  status: number,
  errorData: T,
) => {
  throw new GraphQLError(message, {
    extensions: {
      statusCode: convertToGraphQLStatus(status),
      message: errorData,
      code: convertToGraphQLStatus(status),
    },
  });
};

const convertToGraphQLStatus = (status: number): ExceptionCodes => {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return ExceptionCodes.BadRequest;
    case HttpStatus.UNAUTHORIZED:
      return ExceptionCodes.Unauthorized;
    case HttpStatus.FORBIDDEN:
      return ExceptionCodes.Forbidden;
    case HttpStatus.NOT_FOUND:
      return ExceptionCodes.NotFound;
    default:
      return ExceptionCodes.InternalServerError;
  }
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const hostType = host.getType<GqlContextType>();
    if (hostType === 'graphql') {
      if (exception instanceof HttpException) {
        const gqlHost = GqlArgumentsHost.create(host); // eslint-disable-line

        const response = exception.getResponse();
        const status = exception.getStatus();

        const messageResponse = exception.message;
        throwInputGraphqlError(messageResponse, status, response);
      }
      return exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    if (
      status === HttpStatus.BAD_REQUEST ||
      status === HttpStatus.NOT_FOUND ||
      status === HttpStatus.UNAUTHORIZED ||
      status === HttpStatus.INTERNAL_SERVER_ERROR
    ) {
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
        response.status(status).json(responseBody.message);
      }
    } else {
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}
