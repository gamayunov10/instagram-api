import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

import { isValidUUID } from '../../base/utils/validations/uuid.validator';

export function IsValidArrayOfUuid(validationOptions?: ValidationOptions) {
  return (object: unknown, propertyName: string): void => {
    registerDecorator({
      name: 'isValidArrayOfUuid',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!Array.isArray(value)) return false;
          return value.every(
            (item: any) => typeof item === 'string' && isValidUUID(item),
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be an array of valid UUIDs.`;
        },
      },
    });
  };
}
