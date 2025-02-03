import { User, Post } from '@prisma/client';

export class Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt: Date | null;
  authorId: string;
  postId: string;
  parentId: string | null;
  author?: User | null;
  post?: Post | null;
}
