// Fields
export const confirmCodeField = 'code';
export const emailField = 'email';
export const environmentField = 'environment';

// Validation
export const emailNotUnique = 'User with this email is already registered';
export const emailNotExist = `User with this email doesn't exist`;
export const emailNotSend = `An error occurred while sending a message`;
export const usernameNotUnique =
  'User with this username is already registered';
export const usernameIsIncorrect = 'The username must contain a-zA-Z0-9_-';
export const passwordIsIncorrect =
  'Password must contain 0-9, a-z, A-Z, ! " # $ % &\' ( ) * + , - . / : ; < = > ? @ [ \\ ] ^ _` { | } ~}';
export const emailIsIncorrect =
  'The email must match the format example@example.com';
export const loginIsIncorrect = 'If the password or login is wrong'

export const linkIsExpired = `Looks like the verification link has expired. Not
to worry, we can send the link again`;
export const confirmationCodeIsIncorrect =
  'Confirmation code is incorrect, expired or user already confirmed';

// Database
export const productionDbGuard = `You do not have permissions to perform this operation in this environment`;
