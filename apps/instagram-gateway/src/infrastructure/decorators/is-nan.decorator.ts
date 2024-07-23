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
          let numericValue: number;

          if (typeof value === 'number') {
            numericValue = value;
          } else if (typeof value === 'string') {
            if (/^-?\d+(\.\d+)?$/.test(value)) {
              numericValue = parseFloat(value);
            } else {
              return false;
            }
          } else {
            return false;
          }

          return (
            !Number.isNaN(numericValue) &&
            isFinite(numericValue) &&
            numericValue > 0
          );
        },
        defaultMessage: (validationArguments?: ValidationArguments): string =>
          `${validationArguments.property} should be a valid number or a string that can be converted to a number`,
      },
    });
  };
}
