import type { SyntheticEvent } from 'react'
import type { FileRejection, FileWithPath } from 'react-dropzone'
import type { Crop } from 'react-image-crop'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/theme-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import 'react-image-crop/dist/ReactCrop.css'

type FileWithPreview = FileWithPath & {
  preview: string
}

export function App() {
  const [avatar, setAvatar] = useState('')
  const aspect = 1
  const [file, setFile] = useState<FileWithPreview | null>(null)
  const [open, setOpen] = useState(false)
  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    maxSize: 500 * 1024, // 500kb
    noDrag: true,
    accept: {
      'image/*': [],
    },
    onDrop: useCallback((acceptedFiles: FileWithPath[], fileRejections: FileRejection[]) => {
      if (fileRejections.length > 0) {
        toast.error(fileRejections[0].errors[0].message)
        return
      }

      const file = acceptedFiles[0]
      const fileWithPreview = Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
      setFile(fileWithPreview)
      setOpen(true)
    }, []),
    onError: (errors: Error) => {
      console.error(errors)
    },
  })
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [croppedImage, setCroppedImage] = useState<string | null>(null)

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => {
      if (file) {
        URL.revokeObjectURL(file.preview)
      }
    }
  }, [file])

  function onImageLoad(e: SyntheticEvent<HTMLImageElement>) {
    if (file) {
      URL.revokeObjectURL(file.preview)
    }
    const { width, height } = e.currentTarget
    setCrop(
      centerCrop(
        makeAspectCrop(
          { unit: '%', width: 50, height: 50 },
          aspect,
          width,
          height,
        ),
        width,
        height,
      ),
    )
  }

  function onCropComplete(crop: Crop) {
    if (imgRef.current && crop.width && crop.height) {
      setCroppedImage(getCroppedImg(imgRef.current, crop))
    }
  }

  function getCroppedImg(image: HTMLImageElement, crop: Crop) {
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    canvas.width = crop.width * scaleX
    canvas.height = crop.height * scaleY
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      toast.error('No canvas context')
      return null
    }
    ctx.imageSmoothingEnabled = true
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY,
    )
    return canvas.toDataURL('image/png', 1.0)
  }

  function handleSave() {
    if (!croppedImage) {
      return
    }
    setAvatar(croppedImage)
    setOpen(false)
  }

  return (
    <div className="relative font-sans antialiased">
      <div className="flex flex-col gap-5 items-center justify-center min-h-svh">
        <Avatar
          {...getRootProps()}
          className="size-16 rounded-full border-2 border-dashed shadow cursor-pointer"
        >
          <input {...getInputProps()} />
          <AvatarImage src={avatar} />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Avatar Preview</DialogTitle>
              <DialogDescription>
                This is a preview of the avatar you selected.
              </DialogDescription>
            </DialogHeader>
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={c => onCropComplete(c)}
              circularCrop={true}
              aspect={aspect}
              minWidth={10}
              minHeight={10}
              className="max-h-[500px]"
            >
              <img
                ref={imgRef}
                src={file?.preview}
                alt={file?.name}
                className="size-full object-contain"
                onLoad={onImageLoad}
              />
            </ReactCrop>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSave} disabled={!croppedImage}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex gap-2.5 items-center">
          <Button variant="outline" asChild>
            <a
              href="https://github.com/mancuoj-collective/remix-tmpl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="iconify carbon--logo-github size-4" />
              GitHub
            </a>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
