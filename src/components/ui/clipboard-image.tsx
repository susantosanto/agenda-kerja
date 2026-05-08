"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Image as ImageIcon, Loader2, X, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

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
  const [uploading, setUploading] = useState(false)

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (disabled || uploading) return
      
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault()
          const blob = item.getAsFile()
          if (blob) {
            await uploadImage(blob)
          }
          break
        }
      }
    }

    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [disabled, uploading])

  const uploadImage = async (blob: Blob) => {
    setUploading(true)

    try {
      // Create preview
      const preview = URL.createObjectURL(blob)
      const tempId = `temp-${Date.now()}`
      
      // Add to state immediately for preview
      const newImage: ImageAttachment = {
        id: tempId,
        url: preview,
        preview,
      }
      setImages((prev) => [...prev, newImage])
      onImagesChange([...images, newImage])

      // Upload to server
      const formData = new FormData()
      formData.append("file", blob, "screenshot.png")

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        throw new Error("Upload failed")
      }

      const { url } = await res.json()
      
      // Update with real URL
      setImages((prev) =>
        prev.map((img) =>
          img.id === tempId ? { ...img, id: url, url } : img
        )
      )
      onImagesChange(
        images.map((img) =>
          img.id === tempId ? { ...img, id: url, url } : img
        )
      )

      toast({
        title: "Screenshot attached",
        description: "Gambar berhasil dilampirkan",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengupload gambar",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (id: string) => {
    const image = images.find((img) => img.id === id)
    if (image?.preview.startsWith("blob:")) {
      URL.revokeObjectURL(image.preview)
    }
    const updated = images.filter((img) => img.id !== id)
    setImages(updated)
    onImagesChange(updated)
  }

  if (images.length === 0) {
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
          {/* Remove button */}
          <button
            type="button"
            onClick={() => removeImage(image.id)}
            className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      
      {uploading && (
        <div className="h-20 w-20 rounded-xl border border-border/50 bg-muted/50 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
