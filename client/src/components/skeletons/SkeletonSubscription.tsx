

export default function SkeletonSubscription() {
  return (
    <article className='hidebars flex flex-col h-full gap-2 w-full shadow-md'>
      {
        [...Array(15).keys()].map(i => (
          <div 
            key={i}
            className='p-1.5 bg-gray-200 rounded-md w-full flex gap-2'
          >
            <div className="flex-none border-2 w-10 h-10 rounded-full bg-slate-400" />
            
            <div className="flex-auto flex flex-col gap-2">
              
              <p className="animate-pulse bg-gray-300 w-1/2 rounded-sm h-4" />
              <p className="animate-pulse bg-gray-300 w-[75%] rounded-sm h-3" />
              
              <div className="w-full flex items-center gap-2">
                <p className="animate-pulse bg-gray-400 w-1/4 rounded-sm h-3.5" />
                <p className="animate-pulse bg-gray-400 w-1/4 rounded-sm h-3.5" />
              </div>
            </div>

            <p className="flex-none animate-pulse bg-gray-300 w-[8%] rounded-sm h-4" />

          </div>
        ))
      }
    </article>
  )
}