import styles from './LoadingSpinner.module.css'

export const LoadingSpinner = () => {
  return (
    <main id='planner' className='flex justify-center items-center w-full min-h-screen'>
      <div className={styles.loadingSpinner} />
    </main>
  )
}
