import { JWTATPayload } from './access-token-payload.interface';

export interface JWTRTPayload extends JWTATPayload {
  deviceId: string;
}
