export const expectPostsView = (
  response,
  description: string,
  authorId: string,
  url: string,
) => {
  expect(response.body.items[0].id).toBeDefined();
  expect(response.body.items[0].description).toBe(description);
  expect(response.body.items[0].createdAt).toBeDefined();
  expect(response.body.items[0].updatedAt).toBeDefined();
  expect(response.body.items[0].authorId).toBe(authorId);
  expect(response.body.items[0].images).toBeInstanceOf(Array);
  expect(response.body.items[0].images[0]).toContain(url);
};

// Example

// {
//   pageNumber: ,
//   pageSize: ,
//   totalCount: ,
//   items: [
//     {
//       id: 'cc1fb394-e203-4901-82cd-15ced90d5897',
//       description: 'description a',
//       createdAt: '2024-05-14T12:19:46.816Z',
//       updatedAt: '2024-05-14T12:19:46.816Z',
//       authorId: '1b17677d-34c3-432b-a26a-e724d3035d9a',
//       imagesUrl: [
//         'https://summer.storage.yandexcloud.net/content/users/1b17677d-34c3-432b-a26a-e724d3035d9a/post_image.png',
//       ]
//     }
//   ]
// }
