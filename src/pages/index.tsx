import type { FileRejection, FileWithPath } from 'react-dropzone'
import { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/theme-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

type FileWithPreview = FileWithPath & {
  preview: string
}

export function App() {
  const [file, setFile] = useState<FileWithPreview | null>(null)
  const user = { name: 'test', image: '' }
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
    }, []),
    onError: (errors: Error) => {
      console.error(errors)
    },
  })

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => {
      if (file) {
        URL.revokeObjectURL(file.preview)
      }
    }
  }, [file])

  return (
    <div className="relative font-sans antialiased">
      <div className="flex flex-col gap-5 items-center justify-center min-h-svh">
        <Avatar
          {...getRootProps()}
          className="size-16 rounded-full border-2 border-dashed shadow cursor-pointer"
        >
          <input {...getInputProps()} />
          <AvatarImage
            src={file?.preview || user.image}
            onLoad={() => {
              if (file) {
                URL.revokeObjectURL(file.preview)
              }
            }}
          />
          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <code className="text-xs whitespace-pre-wrap">
          {file ? JSON.stringify(file, null, 2) : 'No file selected'}
        </code>

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
