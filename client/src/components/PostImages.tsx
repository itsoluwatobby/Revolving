import { PageType } from "../types/data";
import { useState } from "react";
import { MdCancelPresentation, MdOutlinePreview } from "react-icons/md";
import { ChatOption, PostType } from "../types/posts";

type ImageProp={
  story: PostType
  position: 'main' | 'single' | 'mini'
  page?: PageType
}

const initImagePrev = { image: '', view: 'Hide' as ChatOption }

export default function PostImage({ story, position, page }: ImageProp) {
  const picturesLength = story?.picture?.length
  const [preview, setPreview] = useState<typeof initImagePrev>(initImagePrev)

  return (
    <>
      {
        story?.picture?.length ?  (
          <div className={`mt-4 ${preview?.view === 'Hide' ? 'scale-100' : 'scale-0 hidden'} transition-all p-0.5 flex items-center ${page === 'PROFILE' ? 'h-32 flex-row maxmobile:h-32' : ''} ${position === 'single' ? 'px-2 mobile:flex-co mobile:h-96' : 'h-64'} gap-1 w-full`}>
            {
              story?.picture?.map(pic => (
                <figure
                  key={pic}
                  className={`relative rounded-md bg-gray-200 ${page === 'PROFILE' ? 'h-full' : ''} ${position === 'single' ? 'w-[85%] h-80' : position === 'mini' ? 'w-[11.5%] h-[6rem]' : 'h-full'} ${picturesLength == 1 ? 'w-full maxmobile:h-full' : 'w-1/2 maxmobile:w-full'}`}>
                  <img src={pic} loading="lazy" alt='images'
                    className='rounded-md h-full w-full object-cover'
                  />

                  <div className={`absolute right-1 top-1 ${position === 'single' ? 'block' : 'hidden'} text-2xl cursor-pointer bg-slate-900`}>
                    <MdOutlinePreview 
                      onClick={() => setPreview({image: pic, view: 'Open'})}  
                      title='preview' className='text-white opacity-70 hover:opacity-90 transition-all' 
                    />
                  </div>
                </figure>
              ))
            }
          </div>
        )
        : null
      }
      
      <figure
        className={`relative mt-5 ${preview?.view === 'Open' ? 'scale-100' : 'hidden'} transition-all rounded-md h-auto bg-gray-300 w-[90%]}`}>
        <img src={preview.image} loading="lazy" alt='images'
          className='rounded-md h-full w-full object-cover object-center'
        />

        <div className="absolute right-1 top-1 text-2xl cursor-pointer bg-slate-900">
          <MdCancelPresentation 
            onClick={() => setPreview({image: '', view: 'Hide'})}  
            title='preview' className='text-white opacity-70 hover:opacity-90 transition-all' 
          />
        </div>
      </figure>
      
    </>
  )
}
