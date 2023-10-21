import { Theme } from "../../types/posts";

type SkeletonProfileType = {
  page: 'EDIT'
  theme: Theme,
}

export default function SkeletonProfile({ theme, page }: SkeletonProfileType) {
  return (
    <>
      <div className={`relative animate-pulse md:flex-none md:mt-2 h-[7.5rem] shadow-inner shadow-slate-800 rounded-md border ${theme === 'light' ? 'bg-slate-400' : 'bg-slate-500'} md:h-64 md:w-1/2 md:sticky md:top-0`}>
        <div className={`absolute animate-pulse ${page === 'EDIT' ? 'w-36 h-36' : 'absolute '} rounded-full z-20 border-2 shadow-inner shadow-slate-600 border-gray-300 w-[7.5rem] lg:w-36 lg:h-36 h-[7.5rem] right-[40%] top-[45px] ${theme === 'light' ? 'bg-slate-400' : 'bg-slate-500'}`} />
      </div>

      <p className="absolute top-44 md:-top-[1.5rem] flex items-center gap-2">
        <span className={`${theme === 'light' ? 'text-gray-900' : 'text-gray-300'}`}>Username:</span>
        <span className="animate-pulse bg-gray-300 w-28 rounded-sm h-5" />
      </p>

      <p className={`absolute right-0 md:-top-[1.5rem] top-44 flex items-center gap-2`}>
        <span className={`${theme === 'light' ? 'text-gray-900' : 'text-gray-300'}`}>Country:</span>
        <span className="animate-pulse bg-gray-300 w-28 rounded-sm h-5" />
      </p>

      <div className={`relative flex py-2 pt-3 md:mt-0 mt-16 flex-col gap-2 w-full`}>
        <p className={`flex items-center gap-2`}>
          <span className={`${theme === 'light' ? 'text-gray-900' : 'text-gray-300'}`}>Name:</span>
          <span className="animate-pulse bg-gray-300 w-44 rounded-sm h-4" />
        </p>

        <p className="flex items-center gap-4 py-1">
          <span className="animate-pulse bg-gray-300 w-32 rounded-sm h-4" />
          <span className="animate-pulse bg-gray-300 w-32 rounded-sm h-4" />
        </p>

        <span className="animate-pulse bg-gray-300 w-[40%] rounded-sm h-4" />
        <span className="animate-pulse bg-gray-300 w-[40%] rounded-sm h-4" />

        <div className="flex flex-col">
          <p>Hobbies:</p>
          <div className="flex items-center gap-2">
            <span className="animate-pulse bg-gray-300 w-16 rounded-sm h-4" />
            <span className="animate-pulse bg-gray-300 w-16 rounded-sm h-4" />
            <span className="animate-pulse bg-gray-300 w-16 rounded-sm h-4" />
          </div>
        </div>

        <p className="flex flex-col py-1 gap-2">
          <span>About:</span>
          <span className="animate-pulse bg-gray-300 w-[70%] rounded-sm h-4" />
          <span className="animate-pulse bg-gray-300 w-[85%] rounded-sm h-4" />
        </p>
      </div>

      <hr className={`absolute top-[195px] md:top-0 w-full border ${theme == 'light' ? 'border-gray-200' : 'border-gray-400 md:border-gray-700'}`}/>
    </>
  )
}