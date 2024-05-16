import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import mongoose from 'mongoose';

export function IsValidArrayOfMongoIds(validationOptions?: ValidationOptions) {
  return (object: unknown, propertyName: string): void => {
    registerDecorator({
      name: 'isValidArrayOfMongoIds',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!Array.isArray(value)) return false;
          if (value.length > 10) return false;
          return value.every(
            (item: any) =>
              typeof item === 'string' && mongoose.Types.ObjectId.isValid(item),
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be an array of valid MongoDB ObjectIds. Max length 10`;
        },
      },
    });
  };
}
