import { PaypalBaseEventType } from './paypal-base-event.type';

export type PaypalEventPaymentDataType = PaypalBaseEventType & {
  resource: {
    amount: { total: string; currency: string; details: any };
    payment_mode: string;
    create_time: string;
    custom: string;
    transaction_fee: { currency: string; value: string };
    billing_agreement_id: string;
    update_time: string;
    protection_eligibility_type: string;
    protection_eligibility: string;
    links: any;
    id: string;
    state: string;
    invoice_number: string;
  };
  links: any;
};
