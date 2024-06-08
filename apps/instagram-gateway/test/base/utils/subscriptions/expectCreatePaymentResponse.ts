export const expectCreatePaymentResponse = (response) => {
  expect(response.body).toHaveProperty('url');
  expect(typeof response.body.url).toBe('string');
};

// Example

// {
//     "url": "https://checkout.stripe.com/c/pay/cs_test_a1jdX4rp4jXzbBAW29zXil3JOE0bl6aakkLKtOsx1lnaIADDib9doBFm7P#fidkdWxOYHwnPyd1blpxYHZxWjA0SnFEQUtAbHVqaDd2V0B3f2ZAYGBhXUg1fHNjaXBOf3BKMGdsYWgwc3E3Z29BbTZ1UW9tcTROYlF%2FXXBnfUFVdV8wdzZudGlnN29qRDd9V19sSXFucFR2NTVDT3djfW5KRicpJ2N3amhWYHdzYHcnP3F3cGApJ2lkfGpwcVF8dWAnPyd2bGtiaWBabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYHgl"
// }
