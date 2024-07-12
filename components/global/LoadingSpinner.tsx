export const LoadingSpinner = () => {
  return (
    <div
      className='inline-block border-4 border-current border-e-transparent border-solid rounded-full w-8 h-8 text-surface dark:text-white animate-spin motion-reduce:animate-[spin_1.5s_linear_infinite] align-[-0.125em]'
      role='status'
    >
      <span className='!absolute !border-0 !-m-px !p-0 !w-px !h-px !whitespace-nowrap !overflow-hidden ![clip:rect(0,0,0,0)]'>
        Loading...
      </span>
    </div>
  )
}
