import * as Buffer from 'node:buffer';
import { Request } from 'express';

export class PaypalSignatureRequest {
  data: Buffer;
  request: Request;
}
