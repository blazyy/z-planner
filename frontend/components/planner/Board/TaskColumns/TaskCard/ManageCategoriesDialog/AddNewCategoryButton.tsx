export const AddNewCategoryButton = () => {
  return (
    <button className='w-full flex justify-center items-center gap-2 text-sm text-gray-500 hover:text-gray-700'>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        fill='none'
        viewBox='0 0 24 24'
        strokeWidth={1.5}
        stroke='currentColor'
        className='h-6 w-6'
      >
        <path strokeLinecap='round' strokeLinejoin='round' d='M12 6v6m0 0v6m0-6h6m-6 0H6' />
      </svg>
      <span>Add New Category</span>
    </button>
  )
}
