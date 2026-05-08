"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  onRemove?: () => void
  currentImage?: string | null
  className?: string
  disabled?: boolean
}

export function ImageUpload({
  onImageUploaded,
  onRemove,
  currentImage,
  className,
  disabled = false,
}: ImageUploadProps) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Listen for paste events
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (disabled || isUploading) return
      
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault()
          const file = item.getAsFile()
          if (file) {
            await uploadFile(file)
          }
          break
        }
      }
    }

    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [disabled, isUploading])

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Hanya file gambar yang diizinkan",
        variant: "destructive",
      })
      return
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Ukuran file maksimal 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to server
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Upload gagal")
      }

      const { url } = await res.json()
      onImageUploaded(url)
      
      toast({
        title: "Success",
        description: "Gambar berhasil diupload",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal mengupload gambar",
        variant: "destructive",
      })
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      
      if (disabled || isUploading) return

      const files = e.dataTransfer.files
      if (files.length > 0) {
        await uploadFile(files[0])
      }
    },
    [disabled, isUploading]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onRemove?.()
  }

  // If there's a preview, show it
  if (previewUrl) {
    return (
      <div className={cn("relative group", className)}>
        <div className="relative rounded-xl overflow-hidden border border-border/50 bg-muted/30">
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-48 rounded-xl object-contain"
          />
          {/* Overlay with remove button */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
              className="rounded-lg"
            >
              <X className="h-4 w-4 mr-1" />
              Hapus
            </Button>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show upload area
  return (
    <div
      ref={containerRef}
      className={cn(
        "relative rounded-xl border-2 border-dashed border-border/50 bg-muted/20 p-4 transition-all cursor-pointer hover:border-primary/50 hover:bg-muted/30",
        isDragging && "border-primary bg-primary/5",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) uploadFile(file)
        }}
        disabled={disabled}
      />

      <div className="flex flex-col items-center justify-center gap-2 text-center">
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Mengupload...</p>
          </>
        ) : (
          <>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Tempel screenshot atau drag & drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                atau klik untuk upload • Maks 5MB
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
