import { useThemeContext } from '../../hooks/useThemeContext'
import { ThemeContextType } from '../../types/posts'
import SkeletonLoading from './SkeletonLoading'

export const SkeletonTask = () => {
  const {theme} = useThemeContext() as  ThemeContextType
  return (
    <div className={`p-2 pl-3 border ${theme == 'light' ? 'border-gray-300' : 'border-gray-700'} rounded-lg sm:w-full min-w-3/4 shadow-xl flex items-center gap-1`}>
      <SkeletonLoading classes='text width-10' />
      <>
        <SkeletonLoading classes='title width-100' />
        <SkeletonLoading classes='text width-100' />
      </>
    </div>
  )
}