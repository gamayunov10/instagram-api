import Buffer from 'node:buffer';

export class StripeSignatureRequest {
  data: Buffer;
  signature: string[] | string;
}
