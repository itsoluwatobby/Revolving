import { PostType } from "../../../posts"

type ImageProp={
  story: PostType
}

export default function PostImage({ story }: ImageProp) {
 
  return (
    <>
      {
        story.picture?.length ?  (
          <div className='grid grid-cols-3 gap-1 w-full'>
            {
              story?.picture?.map(pic => (
                <figure className='rounded-lg mobile:h-[130px] h-[122px] w-full'>
                  <img src={pic} alt='images' 
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

// // <figure className='rounded-lg h-48'>
// <img src="https://plus.unsplash.com/premium_photo-1669748157807-30514e416843?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cGVyc29ufGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60" alt="" 
// className='rounded-lg h-full w-full object-cover'
// />
// </figure>