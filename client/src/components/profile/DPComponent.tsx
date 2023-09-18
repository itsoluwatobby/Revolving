import EditModal from './EditModal';
import { ChangeEvent } from 'react';
import { UserProps } from '../../data';
import { BsFillPersonFill } from 'react-icons/bs';
import { IsLoadingSpinner } from '../IsLoadingSpinner';
import { ImageTypeProp, ThemeContextType } from '../../posts';
import { useThemeContext } from '../../hooks/useThemeContext';

type Props = {
  page?: 'EDIT',
  isLoading: boolean,
  userProfile: UserProps,
  hoverDp: ImageTypeProp,
  isLoadingDelete: boolean,
  isLoadingUpdate: boolean,
  imageType: ImageTypeProp,
  clearPhoto: (type: ImageTypeProp) => Promise<void>,
  handleImage: (event: ChangeEvent<HTMLInputElement>) => void,
  setHoverDp: React.Dispatch<React.SetStateAction<ImageTypeProp>>,
}

export default function DPComponent({ userProfile, hoverDp, page, isLoading, clearPhoto, isLoadingDelete, isLoadingUpdate, imageType, setHoverDp, handleImage }: Props) {
  const { theme, revealEditModal, setRevealEditModal } = useThemeContext() as ThemeContextType

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
        className={`${page === 'EDIT' ? 'w-36 h-36' : 'absolute '} rounded-full z-20 border-2 shadow-inner shadow-slate-600 border-gray-300 w-28 lg:w-36 lg:h-36 h-28 translate-x-1/2 top-[70px] ${theme === 'light' ? 'bg-slate-400' : 'bg-slate-700'} right-1/2`}>
        
        {
          userProfile?.displayPicture?.photo ?
            <img 
              src={userProfile?.displayPicture?.photo}
              alt={`${userProfile?.firstName}:DP`}
              className={`w-full h-full rounded-full border-2 border-gray-500 object-cover`}
            /> 
            : <BsFillPersonFill className='absolute right-6 top-4 text-6xl text-gray-600' />
        }

        <EditModal cover='DP'
          setRevealEditModal={setRevealEditModal}
          hoverDp={hoverDp} userProfile={userProfile} 
          theme={theme} clearPhoto={clearPhoto} revealEditModal={revealEditModal} 
        />
        <div className={`absolute right-12 top-10 ${(imageType === 'DP' && (isLoadingDelete || isLoadingUpdate || isLoading)) ? 'block' : 'hidden'}`}>
          <IsLoadingSpinner />
        </div>
      </figure>
    </>
  )
}