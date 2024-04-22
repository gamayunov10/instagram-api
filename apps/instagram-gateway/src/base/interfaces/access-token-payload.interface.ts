export interface JWTATPayload {
  userId: string;
  iat: number;
  exp: number;
}
