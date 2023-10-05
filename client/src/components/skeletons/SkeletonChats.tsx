

export default function SkeletonChats() {
  return (
    <article className='hidebars flex flex-col h-full gap-2 w-full shadow-md'>
      {
        [...Array(5).keys()].map(i => (
          <div 
            key={i}
            className='p-0.5 flex items-center bg-gray-200 rounded-md w-full flex gap-2'
          >
            <div className="flex-none border-2 w-9 h-9 rounded-full bg-slate-400" />
            
            <div className="flex-auto flex flex-col gap-1">
              
              <p className="animate-pulse bg-gray-300 w-[75%] rounded-sm h-3.5" />
              <p className="animate-pulse bg-gray-300 w-1/2 rounded-sm h-3" />
              
            </div>

          </div>
        ))
      }
    </article>
  )
}