import { Transform } from 'class-transformer';

export const TransformToInteger = () =>
  Transform(({ value }) => {
    const intValue = Number(value);
    if (isNaN(intValue) || !Number.isInteger(intValue)) {
      return false;
    }
    return intValue;
  });
