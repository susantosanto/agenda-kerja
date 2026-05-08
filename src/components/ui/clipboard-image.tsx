"use client"

import { useState, useEffect } from "react"
import { X, Loader2, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { UploadButton } from "@/components/ui/upload-button"
import { generateReactHelpers } from "@uploadthing/react"
import { OurFileRouter } from "@/app/api/uploadthing/core"

const { useUploadThing } = generateReactHelpers<OurFileRouter>()

interface ImageAttachment {
  id: string
  url: string
  preview: string
}

interface ClipboardImageProps {
  onImagesChange: (images: ImageAttachment[]) => void
  disabled?: boolean
  className?: string
}

export function ClipboardImage({
  onImagesChange,
  disabled = false,
  className,
}: ClipboardImageProps) {
  const { toast } = useToast()
  const [images, setImages] = useState<ImageAttachment[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const { startUpload, isUploading: isUploadThingUploading } = useUploadThing("chatImage", {
    onClientUploadComplete: (res) => {
      if (res && res.length > 0) {
        const uploadedUrl = res[0].url
        const newImage: ImageAttachment = {
          id: uploadedUrl,
          url: uploadedUrl,
          preview: uploadedUrl,
        }
        const updatedImages = [...images, newImage]
        setImages(updatedImages)
        onImagesChange(updatedImages)
        toast({
          title: "Screenshot attached",
          description: "Gambar berhasil diupload",
        })
      }
      setIsUploading(false)
    },
    onUploadError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Gagal mengupload gambar",
        variant: "destructive",
      })
      setIsUploading(false)
    },
  })

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (disabled || isUploading || isUploadThingUploading) return

      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault()
          const blob = item.getAsFile()
          if (blob) {
            setIsUploading(true)
            startUpload([blob])
          }
          break
        }
      }
    }

    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [disabled, isUploading, isUploadThingUploading, startUpload, images])

  const removeImage = (id: string) => {
    const updated = images.filter((img) => img.id !== id)
    setImages(updated)
    onImagesChange(updated)
  }

  if (images.length === 0 && !isUploading && !isUploadThingUploading) {
    return null
  }

  return (
    <div className={cn("flex flex-wrap gap-2 mb-2", className)}>
      {images.map((image) => (
        <div
          key={image.id}
          className="relative group rounded-xl overflow-hidden border border-border/50"
        >
          <img
            src={image.url}
            alt="Attachment"
            className="h-20 w-auto rounded-xl object-cover"
          />
          <button
            type="button"
            onClick={() => removeImage(image.id)}
            className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}

      {(isUploading || isUploadThingUploading) && (
        <div className="h-20 w-20 rounded-xl border border-border/50 bg-muted/50 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
