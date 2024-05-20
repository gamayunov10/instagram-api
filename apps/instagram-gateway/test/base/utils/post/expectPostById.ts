export const expectPostById = (
  response,
  description: string,
  authorId: string,
  url: string,
) => {
  expect(response.body.id).toBeDefined();
  expect(response.body.description).toBe(description);
  expect(response.body.createdAt).toBeDefined();
  expect(response.body.updatedAt).toBeDefined();
  expect(response.body.authorId).toBe(authorId);
  expect(response.body.imagesUrl).toBeInstanceOf(Array);
  expect(response.body.imagesUrl[0]).toContain(url);
};

// Example

//   {
//     id: 'cc1fb394-e203-4901-82cd-15ced90d5897',
//     description: 'description a',
//     createdAt: '2024-05-14T12:19:46.816Z',
//     updatedAt: '2024-05-14T12:19:46.816Z',
//     authorId: '1b17677d-34c3-432b-a26a-e724d3035d9a',
//     imagesUrl: [
//       'https://summer.storage.yandexcloud.net/content/users/1b17677d-34c3-432b-a26a-e724d3035d9a/post_image.png',
//     ],
//   },
