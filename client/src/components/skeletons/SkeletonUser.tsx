import { useThemeContext } from '../../hooks/useThemeContext';
import { ThemeContextType } from '../../posts';
import SkeletonLoading from './SkeletonLoading'

export const SkeletonUser = () => {
  const {theme} = useThemeContext() as  ThemeContextType

  return (
    <div className={`pr-1.5 pl-1.5 border ${theme == 'light' ? 'border-gray-300' : 'border-gray-700'} rounded-lg sm:w-full min-w-3/4 shadow-xl`}>
      <SkeletonLoading classes='profile-circle' />
      <SkeletonLoading classes='text width-100' />
      <SkeletonLoading classes='text width-100' />
      <SkeletonLoading classes='text width-50' />
    </div>
  )
}