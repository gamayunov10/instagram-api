export type StripeEventSubscriptionCreatedDataType = {
  id: string;
  object: 'subscription';
  application_fee_percent: number | null;
  automatic_tax: {
    enabled: boolean;
    liability: string | null;
  };
  billing_cycle_anchor: number;
  billing_cycle_anchor_config: string | null;
  billing_thresholds: string | null;
  cancel_at: number | null;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  cancellation_details: {
    comment: string | null;
    feedback: string | null;
    reason: string | null;
  };
  collection_method: string;
  created: number;
  currency: 'usd';
  current_period_end: number;
  current_period_start: number;
  customer: string;
  days_until_due: string | null;
  default_payment_method: string | null;
  default_source: string | null;
  default_tax_rates: Array<string>;
  description: null;
  discount: null;
  discounts: Array<string>;
  ended_at: string | null;
  invoice_settings: any;
  items: any;
  latest_invoice: string;
  livemode: boolean;
  metadata: any;
  next_pending_invoice_item_invoice: string | null;
  on_behalf_of: string | null;
  pause_collection: string | null;
  payment_settings: any;
  pending_invoice_item_interval: string | null;
  pending_setup_intent: string | null;
  pending_update: string | null;
  plan: {
    id: string;
    object: 'plan';
    active: boolean;
    aggregate_usage: string | null;
    amount: number;
    amount_decimal: string;
    billing_scheme: string | null;
    created: number;
    currency: string;
    interval: string;
    interval_count: number;
    livemode: boolean;
    metadata: any;
    meter: string | null;
    nickname: string | null;
    product: string | null;
    tiers_mode: string | null;
    transform_usage: string | null;
    trial_period_days: string | null;
    usage_type: string;
  };
  quantity: number;
  schedule: string | null;
  start_date: number;
  status:
    | 'active'
    | 'canceled'
    | 'incomplete'
    | 'incomplete_expired'
    | 'past_due'
    | 'paused'
    | 'trialing'
    | 'unpaid';
  test_clock: string | null;
  transfer_data: string | null;
  trial_end: string | null;
  trial_settings: any;
  trial_start: null;
};
