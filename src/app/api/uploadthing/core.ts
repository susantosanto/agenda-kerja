import { createUploadthing, type FileRouter } from "uploadthing/server"
import { auth } from "@/lib/auth"

const f = createUploadthing()

export const ourFileRouter = {
  // Route for chat messages and task comments
  chatImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  }).middleware(async () => {
    const session = await auth()
    if (!session?.user) {
      throw new Error("Unauthorized")
    }
    return { userId: session.user.id }
  }).onUploadComplete(async ({ metadata, file }) => {
    return {
      uploadedBy: metadata.userId,
      url: file.url,
      name: file.name,
    }
  }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
