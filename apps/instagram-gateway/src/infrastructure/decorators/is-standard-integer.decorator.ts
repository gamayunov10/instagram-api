import { IsInt, Max, Min } from 'class-validator';

export const IsStandardInteger =
  () => (target: Record<string, any>, key: string) => {
    Min(1)(target, key);
    Max(999999999)(target, key);
    IsInt()(target, key);
  };
