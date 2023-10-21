
type Props = {
  page?: 'PROFILE' | 'EDIT_PROFILE' | 'CHAT' | 'POSTS',
  customSize?: 'NORMAL' | 'LARGE'
}

export const IsLoadingSpinner = ({ page, customSize='NORMAL' }: Props) => {
  return (
    <div className={`${page === 'POSTS' ? 'm-auto' : 'absolute'} ${page === 'PROFILE' ? 'left-60 top-5' : page === 'EDIT_PROFILE' ? 'top-2.5 left-4' : page === 'CHAT' ? 'left-24 top-10' : '-right-2'} rounded-full animate-spin ${customSize === 'NORMAL' ? 'w-5 h-5 border-2' : (customSize === 'LARGE' && 'w-10 h-10 border-4')} border-r-gray-600 border-l-gray-600`} />
  )
}