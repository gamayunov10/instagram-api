export class ReCaptchaGuardMock {
  async canActivate() {
    return { success: true };
  }
}
