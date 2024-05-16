export const expectCreatedPostWithPhoto = (
  response,
  authorId: string,
  imageId: string,
  imageCount: number,
  description?: string,
) => {
  expect(response.body.id).toBeDefined();
  expect(response.body.authorId).toBe(authorId);

  expect(response.body.images).toBeDefined();
  expect(response.body.images).toHaveLength(imageCount);
  expect(response.body.images[0].imageId).toBe(imageId);

  if (description) {
    expect(response.body.description).toBe(description);
  }
};

// Example

// {
//   "id": "02ab0028-da9d-459d-b3ae-c4f7eb1d25dc",
//   "description": "sfdfsass",
//   "authorId": "e1bd19b9-161f-4e6c-80dd-bee8656a4604",
//   "images": [
//   {
//     "imageId": "663bcaddfe047e8b75000db4"
//   },
//   {
//     "imageId": "663c76713fee67cd646e1c94"
//   }
// ]
// }
