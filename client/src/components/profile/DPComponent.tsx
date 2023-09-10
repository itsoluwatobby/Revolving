import { ChangeEvent } from 'react'
import { UserProps } from '../../data'
import { ImageTypeProp, TargetImageType, Theme } from '../../posts'
import { BsCameraFill } from 'react-icons/bs'
import { FaTimes } from 'react-icons/fa'

type Props = {
  theme: Theme
  isLoadingDp: boolean,
  userProfile: UserProps,
  hoverDp: ImageTypeProp,
  image: TargetImageType,
  imageType: ImageTypeProp,
  isLoadingDelete: boolean,
  isLoadingUpdate: boolean,
  clearPhoto: (type: ImageTypeProp) => Promise<void>,
  handleImage: (event: ChangeEvent<HTMLInputElement>) => void,
  setHoverDp: React.Dispatch<React.SetStateAction<ImageTypeProp>> 
}

export default function DPComponent({ userProfile, hoverDp, isLoadingDp, image, isLoadingUpdate, isLoadingDelete, imageType, theme, setHoverDp, handleImage, clearPhoto }: Props) {

  return (
    <>
      <input 
        type="file" name="photo" hidden id={`profile_pic:${userProfile?._id}`} 
        accept='image/*.{png,jpeg,jpg}' onChange={handleImage} 
      />

      <figure 
            role="Display picture" 
            onMouseEnter={() => setHoverDp('DP')}
            onMouseLeave={() => setHoverDp('NIL')}
            className={`absolute rounded-full z-30 ${(imageType === 'DP' && (isLoadingDelete || isLoadingUpdate || isLoadingDp)) ? 'animate-pulse' : ''} border-2 shadow-inner shadow-slate-600 border-gray-300 w-28 lg:w-36 lg:h-36 h-28 translate-x-1/2 top-[70px] ${theme === 'light' ? 'bg-slate-400' : 'bg-slate-700'} right-1/2`}>
            
            {
              userProfile?.displayPicture?.photo ?
                <img 
                  src={userProfile?.displayPicture?.photo}
                  alt={`${userProfile?.firstName}:DP`}
                  className={`w-full h-full ${(imageType === 'DP' && (isLoadingDelete || isLoadingUpdate || isLoadingDp)) ? 'animate-pulse' : ''} object-cover`}
                /> 
                : null
            }
          
            <label htmlFor={`profile_pic:${userProfile?._id}`}>
              <BsCameraFill
                title={userProfile?.displayPicture?.photo ? 'Change photo' : 'Add photo'}
                className={`absolute text-2xl ${theme === 'light' ? '' : 'text-gray-950'} bottom-3 right-0 cursor-pointer ${hoverDp === 'DP' ? 'scale-[1.02]' : 'scale-0'} hover:text-gray-800 active:text-gray-950 transition-all`} 
              />
            </label>
            <FaTimes
              title='Remove photo' 
              onClick={() => clearPhoto('DP')}
              className={`absolute top-3 right-6 text-lg z-10 cursor-pointer ${image?.data ? 'hover:scale-[1.02] active:scale-1' : 'hidden'} transition-all`} 
            />

          </figure>

    </>
  )
}