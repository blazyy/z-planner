'use client'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { calsans } from './home/layout'

export default function Home() {
  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: 'easeInOut',
        }}
        className='relative flex flex-col justify-center items-center gap-4 px-4'
      >
        <div className={cn('font-bold text-3xl text-center md:text-7xl dark:text-white', calsans.className)}>
          zenith planner.
        </div>
        <div className='py-4 font-extralight text-base md:text-4xl dark:text-neutral-200'>
          Leave the task management to us.
        </div>
        <Link href='/home'>
          <button
            className='bg-black dark:bg-white px-4 py-2 rounded-full w-fit text-white dark:text-black'
            onClick={() => alert}
          >
            Use now
          </button>
        </Link>
      </motion.div>
    </AuroraBackground>
  )
}
