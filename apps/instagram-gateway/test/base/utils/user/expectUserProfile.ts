export const expectUserProfile = (response, profile) => {
  expect(response).toHaveProperty('username');
  expect(response.username).toBe(profile.username);

  expect(response).toHaveProperty('firstName');
  expect(response.firstName).toBe(profile.firstName);

  expect(response).toHaveProperty('lastName');
  expect(response.lastName).toBe(profile.lastName);
};

// Example

// {
//   id: '8cc88b32-20ed-4038-97fd-5deb43bc12a0',
//   email: 'login-user-1@gmail.com',
//   username: 'DiegoM',
//   firstName: 'Armando',
//   lastName: 'YouKnow',
//   birthDate: '31.10.1960',
//   city: 'q',
//   aboutMe: 'string_123',
//   passwordHash: '$2b$10$K06ACVskbs7CVFJDhas0YufIl3wpXPhq.pGlyoyOwR9W3/QV4Wmua',
//   createdAt: 2024-04-17T07:28:07.403Z,
//   isConfirmed: true,
//  }
