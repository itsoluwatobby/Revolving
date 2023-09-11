
type Props = {
  page?: 'PROFILE',
  customSize?: 'NORMAL' | 'LARGE'
}

export const IsLoadingSpinner = ({ page, customSize='NORMAL' }: Props) => {
  return (
    <div className={`absolute ${page === 'PROFILE' ? 'left-60 top-5' : '-right-2'} rounded-full animate-spin ${customSize === 'NORMAL' ? 'w-5 h-5 border-2' : (customSize === 'LARGE' && 'w-10 h-10 border-4')} border-r-gray-600 border-l-gray-600`} />
  )
}