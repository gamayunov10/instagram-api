export const expectDevice = (response, deviceId: string) => {
  expect(response.body).toBeInstanceOf(Array);
  expect(response.body[0]).toHaveProperty('deviceId');
  expect(response.body[0]).toHaveProperty('title');
  expect(response.body[0]).toHaveProperty('lastActiveDate');

  expect(response.body[0].deviceId).toBe(deviceId);
  expect(response.body[0].title).toBeDefined();
  expect(response.body[0].lastActiveDate).toBeDefined;
};

// Example

// [
//   {
//     "deviceId": "string"
//     "title": "string",
//     "lastActiveDate": "string",
//   }
// ]
