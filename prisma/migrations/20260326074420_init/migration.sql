-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('magicAuth', 'passRes');

-- CreateEnum
CREATE TYPE "NodeStates" AS ENUM ('online', 'offline', 'error');

-- CreateEnum
CREATE TYPE "FileLocationStates" AS ENUM ('uploading', 'done', 'corrupted');

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "storage_name" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "folder_id" TEXT,
    "size" BIGINT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "email" TEXT,
    "pass" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "fullName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tokener" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "TokenType" NOT NULL,
    "expireAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tokener_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "exp" TIMESTAMP(3) NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nodes" (
    "id" TEXT NOT NULL,
    "hardware_id" TEXT NOT NULL,
    "current_ip" TEXT NOT NULL,
    "port" INTEGER NOT NULL,
    "name" TEXT,
    "total_space" BIGINT,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "last_connect" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Node_History" (
    "id" SERIAL NOT NULL,
    "current_ip" TEXT NOT NULL,
    "node_id" TEXT NOT NULL,
    "status" "NodeStates" NOT NULL,
    "name" TEXT,
    "total_space" BIGINT,
    "used_space" BIGINT,
    "cpu_used" DOUBLE PRECISION NOT NULL,
    "ram_used" BIGINT NOT NULL,
    "ram_total" BIGINT NOT NULL,
    "connect_from" TIMESTAMP(3),
    "recorced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Node_History_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileLocation" (
    "id" TEXT NOT NULL,
    "file_id" TEXT NOT NULL,
    "nodes_id" TEXT NOT NULL,
    "status" "FileLocationStates" NOT NULL,

    CONSTRAINT "FileLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Folder_user_id_idx" ON "Folder"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_user_key" ON "User"("user");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tokener" ADD CONSTRAINT "Tokener_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node_History" ADD CONSTRAINT "Node_History_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "Nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileLocation" ADD CONSTRAINT "FileLocation_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FileLocation" ADD CONSTRAINT "FileLocation_nodes_id_fkey" FOREIGN KEY ("nodes_id") REFERENCES "Nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
