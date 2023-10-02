import { useThemeContext } from '../../hooks/useThemeContext';
import { ThemeContextType } from '../../posts';
import SkeletonLoading from './SkeletonLoading'

export const SkeletonComment = () => {
  const {theme} = useThemeContext() as  ThemeContextType

  return (
    <div className={`p-0.5 px-3 ${theme === 'light' ? 'bg-gray-400' : 'bg-gray-700'} rounded-lg sm:w-full min-w-3/4 shadow-xl`}>
      <SkeletonLoading classes='title width-50' />
      <SkeletonLoading classes='text width-100' />
      <SkeletonLoading classes='text width-75' />
      <SkeletonLoading classes='text width-50' />
    </div>
  )
}