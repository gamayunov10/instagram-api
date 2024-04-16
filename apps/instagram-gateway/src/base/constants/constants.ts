// Fields
export const emailField = 'email';
export const usernameField = 'username';
export const environmentField = 'environment';
export const userIdField = 'userId';
export const deviceIDField = 'deviceId';
export const emailOrPasswordField = 'email or password';

// Validation
export const userNotFound = 'User not found';
export const deviceNotFound = 'Device not found';
export const userNotFoundOrConfirmed =
  'User with provided email not found or already confirmed';
export const emailNotUnique = 'User with this email is already registered';
export const emailNotExist = `User with this email doesn't exist`;
export const emailNotSend = `An error occurred while sending a message`;
export const githubEmailNotAvailable = `An error occurred while trying to access github email`;
export const usernameNotUnique =
  'User with this username is already registered';
export const usernameIsIncorrect = 'The username must contain a-zA-Z0-9_-';
export const firstNameIsIncorrect = 'The firstName must contain a-z A-Z';
export const lastNameIsIncorrect = 'The lastName must contain a-z A-Z';
export const minChar1 = 'Minimum number of characters 1';
export const minChar6 = 'Minimum number of characters 6';
export const maxChar20 = 'Maximum number of characters 20';
export const maxChar30 = 'Maximum number of characters 30';
export const maxChar50 = 'Maximum number of characters 50';
export const maxChar200 = 'Maximum number of characters 200';
export const passwordIsIncorrect =
  'Password must contain 0-9, a-z, A-Z, ! " # $ % &\' ( ) * + , - . / : ; < = > ? @ [ \\ ] ^ _` { | } ~}';
export const emailIsIncorrect =
  'The email must match the format example@example.com';
export const recoveryCodeIsIncorrect = 'Recovery code is incorrect or expired';

export const linkIsExpired = `Looks like the verification link has expired. Not
to worry, we can send the link again`;
export const confirmationCodeIsIncorrect =
  'Confirmation code is incorrect, expired or user already confirmed';
export const emailOrPasswordIncorrect =
  'The email or password are incorrect. Try again please';

// Database
export const productionDbGuard = `You do not have permissions to perform this operation in this environment`;
