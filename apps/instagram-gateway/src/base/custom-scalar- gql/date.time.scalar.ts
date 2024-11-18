import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind } from 'graphql/language';

@Scalar('DateTimeScalar')
export class DateTimeScalar implements CustomScalar<string, Date> {
  description = 'Custom DateTime scalar type';

  serialize(value: Date): string {
    const date = new Date(value);
    if (!(date instanceof Date)) {
      throw new Error(`Expected a Date object, but got ${typeof value}`);
    }
    return date.toISOString();
  }

  parseValue(value: string): Date {
    return new Date(value); // Преобразуем строку ISO в объект Date
  }

  parseLiteral(ast: any): Date {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  }
}
