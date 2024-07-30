import { PaypalBaseEventType } from './paypal-base-event.type';

export type PaypalEventSubscriptionActiveData = PaypalBaseEventType & {
  resource: {
    quantity: string;
    subscriber: {
      email_address: string;
      payer_id: string;
      name: object[];
    };
    create_time: string;
    custom_id: string;
    plan_overridden: boolean;
    shipping_amount: { currency_code: string; value: string };
    start_time: string;
    update_time: string;
    billing_info: {
      outstanding_balance: object[];
      cycle_executions: [];
      last_payment: object[];
      next_billing_time: string;
      failed_payments_count: number;
    };
    links: any;
    id: string;
    plan_id: string;
    status: string;
    status_update_time: string;
  };
  links: [
    {
      href: string;
      rel: string;
      method: string;
    },
    {
      href: string;
      rel: string;
      method: string;
    },
  ];
};
