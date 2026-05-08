"use client"

import { UploadButton as UTUploadButton } from "@uploadthing/react"
import { OurFileRouter } from "@/app/api/uploadthing/core"

export function UploadButton() {
  return (
    <UTUploadButton<OurFileRouter, "chatImage">
      endpoint="chatImage"
      className="ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90 ut-button:rounded-xl ut-button:px-4 ut-button:py-2"
    />
  )
}
