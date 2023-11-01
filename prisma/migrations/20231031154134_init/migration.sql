-- CreateTable
CREATE TABLE "NewUser" (
    "id" SERIAL NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL,
    "avatar_path" TEXT NOT NULL DEFAULT '/uploads/default-avatar.png',
    "phone" TEXT NOT NULL DEFAULT '',
    "password" TEXT NOT NULL,

    CONSTRAINT "NewUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewUser_email_key" ON "NewUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NewUser_password_key" ON "NewUser"("password");
