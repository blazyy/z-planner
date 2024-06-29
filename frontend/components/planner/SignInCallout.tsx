import { Button } from '@/components/ui/button'
import { SignInButton } from '@clerk/nextjs'

export const SignInCallout = () => {
  return (
    <div className='flex flex-1 justify-center items-center w-full'>
      <div className='flex justify-center items-center'>
        <div className='gap-6 grid mx-auto w-[350px]'>
          <div className='gap-2 grid text-center'>
            <h1 className='font-bold text-3xl'>Welcome.</h1>
            <p className='text-balance text-muted-foreground'>You need to login to access the planner.</p>
          </div>
          <div className='gap-4 grid'>
            <SignInButton>
              <Button type='submit' className='w-full'>
                Sign In
              </Button>
            </SignInButton>
          </div>
        </div>
      </div>
    </div>
  )
}
