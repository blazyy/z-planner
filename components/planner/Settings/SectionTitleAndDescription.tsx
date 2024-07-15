export const SectionTitleAndDescription = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className='flex flex-col'>
      <span className='font-bold text-lg'>{title}</span>
      <span className='text-neutral-500 text-sm'>{description}</span>
    </div>
  )
}
