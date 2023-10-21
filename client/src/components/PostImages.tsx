import { PageType } from "../types/data";
import { PostType } from "../types/posts";

type ImageProp={
  story: PostType
  position: 'main' | 'single' | 'mini'
  page?: PageType
}
//h-52
export default function PostImage({ story, position, page }: ImageProp) {
  const picturesLength = story?.picture?.length

  return (
    <>
      {
        story?.picture?.length ?  (
          <div className={`flex items-center ${page === 'PROFILE' ? 'h-32 flex-row maxmobile:h-32' : ''} ${position === 'single' ? 'px-4 h-72' : 'h-64'} ${page === 'PROFILE' ? '' : 'maxmobile:flex-col'} gap-1 w-full`}>
            {
              story?.picture?.map(pic => (
                <figure 
                  key={pic}
                  className={`rounded-lg bg-gray-200 ${page === 'PROFILE' ? 'h-full' : ''} ${position === 'single' ? 'w-[85%] h-64' : position === 'mini' ? 'w-[11.5%] h-[6rem]' : 'maxmobile:h-[130px] h-full'} ${picturesLength == 1 ? 'w-full maxmobile:h-full' : 'w-1/2 maxmobile:w-full'}`}>
                  <img src={pic} loading="lazy" alt='images'
                    className='rounded-lg h-full w-full object-cover'
                  />
                </figure>
              ))
            }
          </div>
        )
        : null
      }
    </>
  )
}
//grid grid-cols-3
// // <figure className='rounded-lg h-48'>
// <img src="https://plus.unsplash.com/premium_photo-1669748157807-30514e416843?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGVyc29ufGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60" alt="" 
// className='rounded-lg h-full w-full object-cover'
// />
// </figure>