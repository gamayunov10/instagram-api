export const expectPublicPostsView = (
  response,
  pagesCount: number,
  pageSize: number,
  totalCount: number,
  description: string,
  authorId: string,
  avatar: { url: string },
  url: string,
) => {
  expect(response.body).toHaveProperty('pagesCount');
  expect(response.body.pagesCount).toBe(pagesCount);

  expect(response.body).toHaveProperty('page');

  expect(response.body).toHaveProperty('pageSize');
  expect(response.body.pageSize).toBe(pageSize);

  expect(response.body).toHaveProperty('totalCount');
  expect(response.body.totalCount).toBe(totalCount);

  expect(response.body).toHaveProperty('items');
  expect(response.body.items).toBeInstanceOf(Array);

  expect(response.body.items[0].id).toBeDefined();
  expect(response.body.items[0].description).toBe(description);
  expect(response.body.items[0].createdAt).toBeDefined();
  expect(response.body.items[0].updatedAt).toBeDefined();
  expect(response.body.items[0].authorId).toBe(authorId);
  expect(response.body.items[0].avatar).toBe({ url: String });
  expect(response.body.items[0].imagesUrl).toBeInstanceOf(Array);
  expect(response.body.items[0].imagesUrl[0]).toContain(url);
};

// Example

// {
//   "pagesCount": 1,
//   "page": 0,
//   "pageSize": 8,
//   "totalCount": 1,
//   "items": [
//   {
//     "id": "3c15d0f8-30a5-4fa5-9880-0e2e58f97ce8",
//     "description": "description images 2",
//     "createdAt": "2024-05-19T08:46:57.711Z",
//     "updatedAt": "2024-05-19T08:46:57.711Z",
//     "authorId": "bededf3a-9236-4a5d-b042-bb1105fed873",
//     "imagesUrl": [
//       "https://summer.storage.yandexcloud.net/content/users/bededf3a-9236-4a5d-b042-bb1105fed873/post_image.jpeg"
//     ]
//   }
// ]
// }
