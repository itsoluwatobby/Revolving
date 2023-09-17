

export default function SkeletonSubscription() {
  return (
    <article className='hidebars flex flex-col h-full gap-2 w-full shadow-md'>
      {
        [...Array(5).keys()].map(i => (
          <div 
            key={i}
            className='p-2 h-16 bg-gray-200 rounded-md w-full flex flex-col gap-2.5'
          >
            <div className="flex items-center justify-between">
              <p className="animate-pulse bg-gray-300 w-48 rounded-sm h-5" />
              <p className="animate-pulse bg-gray-300 w-6 rounded-sm h-5" />
            </div>
            <div className="w-full flex items-center gap-2">
              <p className="animate-pulse bg-gray-400 w-28 rounded-sm h-5" />
              <p className="animate-pulse bg-gray-400 w-28 rounded-sm h-5" />
            </div>
          </div>
        ))
      }
    </article>
  )
}