import type { SyntheticEvent } from 'react'
import type { FileRejection, FileWithPath } from 'react-dropzone'
import type { Crop } from 'react-image-crop'
import { useCallback, useEffect, useState } from 'react'
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
  const user = { name: 'test', image: '' }
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
  const [crop, setCrop] = useState<Crop>()

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

  function handleSave() {

  }

  return (
    <div className="relative font-sans antialiased">
      <div className="flex flex-col gap-5 items-center justify-center min-h-svh">
        <Avatar
          {...getRootProps()}
          className="size-16 rounded-full border-2 border-dashed shadow cursor-pointer"
        >
          <input {...getInputProps()} />
          <AvatarImage src={user.image} />
          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
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
              circularCrop={true}
              aspect={aspect}
              minWidth={10}
              minHeight={10}
            >
              <img
                src={file?.preview}
                alt={file?.name}
                className="size-full max-h-[500px] object-contain"
                onLoad={onImageLoad}
              />
            </ReactCrop>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSave}>Save</Button>
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
