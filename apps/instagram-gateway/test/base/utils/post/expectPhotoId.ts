export const expectPhotoId = (response) => {
  expect(response.body.imageId).toBeDefined();
};

// Example

// {
//   "imageId": "663de5dd3993b96116a53433"
// }
