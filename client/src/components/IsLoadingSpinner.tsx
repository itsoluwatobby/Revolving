
type Props = {
  customSize?: 'NORMAL' | 'LARGE'
}

export const IsLoadingSpinner = ({ customSize='NORMAL' }: Props) => {
  return (
    <div className={`absolute -right-2 rounded-full animate-spin ${customSize === 'NORMAL' ? 'w-5 h-5 border-2' : 'w-10 h-10 border-3'} border-r-gray-600 border-l-gray-600`} />
  )
}