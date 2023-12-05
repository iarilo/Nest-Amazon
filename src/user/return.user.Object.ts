import { Prisma } from "@prisma/client";

export const ReturnUserObject: Prisma.NewUserSelect = {
  id: true,
  name: true,
  email: true,
  avatarPath: true,
  phone: true,
  password: false,
};
