import { Injectable } from '@nestjs/common';
import { PasswordRecoveryCode, PrismaClient, User } from '@prisma/client';

@Injectable()
export class UsersQueryRepository {
  constructor(private prismaClient: PrismaClient) {}

  async findUserById(id: string) {
    return this.prismaClient.user.findUnique({
      where: { id },
    });
  }

  async findUserByEmail(email: string) {
    return this.prismaClient.user.findUnique({
      where: { email },
    });
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return this.prismaClient.user.findUnique({
      where: { username },
    });
  }

  async findUserProviderInfo(userId: string) {
    return this.prismaClient.userProviderInfo.findMany({
      where: { userId: userId },
    });
  }

  async findPasswordRecoveryRecord(
    code: string,
  ): Promise<PasswordRecoveryCode | null> {
    return this.prismaClient.passwordRecoveryCode.findUnique({
      where: { recoveryCode: code },
    });
  }

  async getUserWithRelations(email: string) {
    return await this.prismaClient.user.findFirst({
      where: { email },
      include: {
        confirmationCode: true,
        PasswordRecoveryCode: true,
      },
    });
  }

  async findUserByEmailConfirmationCode(confirmationCode: string) {
    return this.prismaClient.user.findFirst({
      where: {
        confirmationCode: {
          confirmationCode: confirmationCode,
        },
      },
      include: {
        confirmationCode: true,
      },
    });
  }
}
