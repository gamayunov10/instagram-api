// Fields
export const confirmCodeField = 'code';
export const emailField = 'email';
export const environmentField = 'environment';
export const userIdField = 'userId';
export const deviceIDField = 'deviceId';
export const deviceNotFound = 'Device not found';

// Validation
export const userNotFound = 'User not found';
export const userNotFoundOrConfirmed =
  'User with provided email not found or already confirmed';
export const emailNotUnique = 'User with this email is already registered';
export const emailNotExist = `User with this email doesn't exist`;
export const emailNotSend = `An error occurred while sending a message`;
export const githubEmailNotAvailable = `An error occurred while trying to access github email`;
export const usernameNotUnique =
  'User with this username is already registered';
export const usernameIsIncorrect = 'The username must contain a-zA-Z0-9_-';
export const passwordIsIncorrect =
  'Password must contain 0-9, a-z, A-Z, ! " # $ % &\' ( ) * + , - . / : ; < = > ? @ [ \\ ] ^ _` { | } ~}';
export const emailIsIncorrect =
  'The email must match the format example@example.com';
export const recoveryCodeIsIncorrect = 'Recovery code is incorrect or expired';

export const linkIsExpired = `Looks like the verification link has expired. Not
to worry, we can send the link again`;
export const confirmationCodeIsIncorrect =
  'Confirmation code is incorrect, expired or user already confirmed';

// Database
export const productionDbGuard = `You do not have permissions to perform this operation in this environment`;
export const loginIsIncorrect = 'If the password or login is wrong';
