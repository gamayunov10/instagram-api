export type StripeEventCheckoutSessionDataType = {
  id: string;
  object: string;
  after_expiration: string | null;
  allow_promotion_codes: string | null;
  amount_subtotal: number;
  amount_total: number;
  automatic_tax: {
    enabled: boolean;
    liability: null;
    status: string | null;
  };
  billing_address_collection: string | null;
  cancel_url: string;
  client_reference_id: string;
  client_secret: string | null;
  consent: string | null;
  consent_collection: string | null;
  created: number;
  currency: string;
  currency_conversion: string | null;
  custom_fields: [];
  custom_text: {
    after_submit: string | null;
    shipping_address: string | null;
    submit: string | null;
    terms_of_service_acceptance: string | null;
  };
  customer: string;
  customer_creation: string | null;
  customer_details: {
    address: {
      city: string | null;
      country: string;
      line1: string | null;
      line2: string | null;
      postal_code: string | null;
      state: string | null;
    };
    email: string;
    name: string;
    phone: string | null;
    tax_exempt: string;
    tax_ids: Array<string>;
  };
  customer_email: string | null;
  expires_at: number;
  invoice: string;
  invoice_creation: string | null;
  livemode: boolean;
  locale: string | null;
  metadata: any;
  mode: string;
  payment_intent: string | null;
  payment_link: string | null;
  payment_method_collection: string;
  payment_method_configuration_details: string | null;
  payment_method_options: {
    card: {
      request_three_d_secure: string;
    };
  };
  payment_method_types: Array<string>;
  payment_status: string;
  phone_number_collection: {
    enabled: boolean;
  };
  recovered_from: string | null;
  saved_payment_method_options: {
    allow_redisplay_filters: Array<string>;
    payment_method_remove: string | null;
    payment_method_save: string | null;
  };
  setup_intent: string | null;
  shipping_address_collection: string | null;
  shipping_cost: string | null;
  shipping_details: string | null;
  shipping_options: [];
  status: string;
  submit_type: string | null;
  subscription: string;
  success_url: string;
  total_details: {
    amount_discount: number;
    amount_shipping: number;
    amount_tax: number;
  };
  ui_mode: string;
  url: string | null;
};
