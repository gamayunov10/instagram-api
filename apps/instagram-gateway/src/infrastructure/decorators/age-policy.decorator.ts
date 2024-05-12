import { registerDecorator, ValidationOptions } from 'class-validator';

export function AgePolicy(validationOptions?: ValidationOptions) {
  return (object: unknown, propertyName: string): void => {
    registerDecorator({
      name: 'AgePolicy',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: (value): boolean => {
          const currentDate = new Date();

          const parts = value.split('.');
          const birthDate = new Date(parts[2], parts[1] - 1, parts[0]);

          let age = currentDate.getFullYear() - birthDate.getFullYear();

          const monthDiff = currentDate.getMonth() - birthDate.getMonth();
          const dayDiff = currentDate.getDate() - birthDate.getDate();

          if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
          }

          return age >= 13;
        },

        defaultMessage: (): string =>
          `A user under 13 cannot create a profile. Privacy Policy`,
      },
    });
  };
}
