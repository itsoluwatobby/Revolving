import EditModal from './EditModal';
import { UserProps } from '../../data';
import { Link } from 'react-router-dom';
import DPComponent from './DPComponent';
import { ChangeEvent, useState } from 'react';
import { reduceLength } from '../../utils/navigator';
import { IsLoadingSpinner } from '../IsLoadingSpinner';
import { MdNotificationsActive } from 'react-icons/md';
import { ImageTypeProp, ThemeContextType } from '../../posts';
import { useThemeContext } from '../../hooks/useThemeContext';
import DefaultCover from '../../assets/revolving/default_cover.webp';

type Props = {
  isLoading: boolean,
  userProfile: UserProps,
  imageType: ImageTypeProp,
  isLoadingDelete: boolean,
  isLoadingUpdate: boolean,
  clearPhoto: (type: ImageTypeProp) => Promise<void>,
  handleImage: (event: ChangeEvent<HTMLInputElement>) => void
}

export default function ProfileTop({ userProfile, imageType, handleImage, clearPhoto, isLoadingDelete, isLoading, isLoadingUpdate }: Props) {
  const [hoverDp, setHoverDp] = useState<ImageTypeProp>('NIL')
  const { theme, revealEditModal, setRevealEditModal } = useThemeContext() as ThemeContextType
  const currentUserId = localStorage.getItem('revolving_userId') as string

  return (
    <>
      <input 
        type="file" name="coverPhoto" hidden id={`cover_photo:${userProfile?._id}`} 
        accept='image/*.{png,jpeg,jpg}' onChange={handleImage} 
      />
      <div className="md:flex-none md:mt-2 h-[7.5rem] shadow-inner shadow-slate-800 rounded-md border md:h-64 md:w-1/2 md:sticky md:top-0">
        <figure 
          role="Cover photo" 
          onMouseEnter={() => setHoverDp('COVER')}
          onMouseLeave={() => setHoverDp('NIL')}
          className={`relative ${theme === 'light' ? 'bg-slate-300' : 'bg-slate-600'} h-full w-full rounded-md shadow-transparent shadow-2xl border-1 box-border`}>
          
          {
            userProfile?.displayPicture?.coverPhoto ?
              <img 
                src={userProfile?.displayPicture?.coverPhoto}
                alt={`${userProfile?.firstName}:CoverPhoto`}
                className={`w-full h-full object-cover rounded-md`}
              /> 
              : 
              <img src={DefaultCover} alt="" 
                className='w-full h-full object-cover rounded-md'
              />
          }

            <DPComponent 
              handleImage={handleImage}
              clearPhoto={clearPhoto}
              isLoadingUpdate={isLoadingUpdate} setHoverDp={setHoverDp} 
              isLoadingDelete={isLoadingDelete} 
              userProfile={userProfile}
              imageType={imageType} isLoading={isLoading} hoverDp={hoverDp}
            />
          
             <EditModal cover='COVER'
                setRevealEditModal={setRevealEditModal}
                hoverDp={hoverDp} userProfile={userProfile} 
                theme={theme} clearPhoto={clearPhoto} revealEditModal={revealEditModal} 
              />
             
              {(imageType === 'COVER' && (isLoadingDelete || isLoadingUpdate || isLoading)) ?
                <IsLoadingSpinner page='PROFILE' customSize='LARGE' /> : null
              }

        </figure>

      </div>

      <div className={`absolute right-2 top-32 lg:top-28 flex flex-row-reverse gap-8`}>
        {
          userProfile?._id === currentUserId ?
            <Link to={`/edit_profile/${userProfile?._id}`} >
              <button 
                className={`p-1 px-3 rounded-sm shadow-md hover:opacity-95 active:opacity-100 focus:outline-none border-none ${theme === 'light' ? 'bg-slate-500 text-white' : 'bg-slate-600'} transition-all`}
              >
                Edit profile
              </button>
            </Link>
          :
            <MdNotificationsActive
              title='Notification'
              className={`text-2xl {'animate-bounce'} cursor-pointer ${!userProfile?.notificationSubscribers?.includes(userProfile?._id) ? 'text-green-700' : 'text-gray-500'} hover:scale-[1.02] active:scale-[1] transition-all`}
            />
        }
      </div>

      <p role="Code name" className="absolute top-44 md:-top-[1.5rem] flex items-center gap-2">
        <span className={`${theme === 'light' ? 'text-gray-900' : 'text-gray-300'}`}>Username:</span>
        <span className="font-medium cursor-pointer">{reduceLength(userProfile?.username as string, 15, 'letter')}</span>  
      </p>
      <p role="Country" className={`absolute right-0 md:-top-[1.5rem] top-44 ${userProfile?.country ? 'flex' : 'flex'} items-center gap-2`}>
        <span className={`${theme === 'light' ? 'text-gray-900' : 'text-gray-300'}`}>Country:</span>
        <span className="font-medium capitalize cursor-pointer">{userProfile?.country || 'NA'}</span>  
      </p>

      <hr className={`absolute top-[195px] md:top-0 w-full border ${theme == 'light' ? 'border-gray-200' : 'border-gray-400 md:border-gray-700'}`}/>
    </>
  )
}