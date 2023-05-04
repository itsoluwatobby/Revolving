import SkeletonLoading from './SkeletonLoading'

export const SkeletonBlog = () => {
  const currentMode = localStorage.getItem('theme');
  return (
    <div className={`font_style p-2 pl-3 border ${currentMode == 'light' ? 'border-gray-300' : 'border-gray-700'} rounded-lg sm:w-full w-3/4 font-sans shadow-xl`}>
      <SkeletonLoading classes='title width-50' />
      <SkeletonLoading classes='text width-100' />
      <SkeletonLoading classes='text width-100' />
      <SkeletonLoading classes='text width-100' />
    </div>
  )
}