export type PaymentSessionType = {
  success_url: string;
  cancel_url: string;
  line_items: [
    {
      price_data: {
        product_data: {
          name: string;
          description: string;
        };
        unit_amount: number;
        currency: string;
      };
      quantity: number;
    },
  ];
  mode: string;
  client_reference_id: string;
};
