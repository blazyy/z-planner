import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Github, Info } from 'lucide-react'

export const MoreInfoDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='ghost' className='justify-start w-full'>
          <div className='flex items-center gap-2'>
            <Info className='w-5 h-5' />
            More Info
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>App info</DialogTitle>
          <DialogDescription>
            <div className='flex justify-between items-center gap-2'>
              <span>This is an open source project. Report any issues or feature requests on the repository.</span>
              <Button>
                <a href='https://github.com/blazyy/planner' target='_blank' rel='noopener noreferrer'>
                  <div className='flex items-center gap-2'>
                    <Github className='mr-2 w-4 h-4' /> GitHub
                  </div>
                </a>
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
