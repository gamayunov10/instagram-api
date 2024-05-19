import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsValidNumber(validationOptions?: ValidationOptions) {
  return (object: unknown, propertyName: string): void => {
    registerDecorator({
      name: 'IsValidNumber',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value: any): boolean => {
          if (typeof value === 'number') {
            return !Number.isNaN(value) && isFinite(value);
          } else if (typeof value === 'string') {
            return /^-?\d+(\.\d+)?$/.test(value);
          }
          return false;
        },
        defaultMessage: (validationArguments?: ValidationArguments): string =>
          `${validationArguments.property} should be a valid number or a string that can be converted to a number`,
      },
    });
  };
}
