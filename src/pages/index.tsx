import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

export function App() {
  return (
    <div className="relative font-sans antialiased">
      <div className="flex flex-col items-center justify-center min-h-svh">
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
