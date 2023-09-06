import { useThemeContext } from '../../hooks/useThemeContext'
import { ThemeContextType } from '../../posts'
import SkeletonLoading from './SkeletonLoading'

export const SkeletonBlog = () => {
  const {theme} = useThemeContext() as  ThemeContextType
  return (
    <div className={`p-2 border ${theme == 'light' ? 'border-gray-300' : 'border-gray-700'} px-6 rounded-lg sm:w-full min-w-3/4 shadow-xl`}>
      <SkeletonLoading classes='title width-50' />
      <SkeletonLoading classes='text width-100' />
      <SkeletonLoading classes='text width-100' />
      <SkeletonLoading classes='text width-100' />
    </div>
  )
}