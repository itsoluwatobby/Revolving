import EditModal from './EditModal';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import DPComponent from './DPComponent';
import { ChangeEvent, useState, useEffect } from 'react';
import { ErrorResponse, UserProps } from '../../data';
import { IsLoadingSpinner } from '../IsLoadingSpinner';
import { MdNotificationsActive } from 'react-icons/md';
import { useThemeContext } from '../../hooks/useThemeContext';
import { useSubscribeMutation } from '../../app/api/usersApiSlice';
import DefaultCover from '../../assets/revolving/default_cover.webp';
import { ChatOption, ImageTypeProp, ThemeContextType } from '../../posts';
import { ErrorStyle, SuccessStyle, reduceLength } from '../../utils/navigator';

type Props = {
  userId: string,
  isLoading: boolean,
  userProfile: UserProps,
  imageType: ImageTypeProp,
  isLoadingDelete: boolean,
  isLoadingUpdate: boolean,
  clearPhoto: (type: ImageTypeProp) => Promise<void>,
  handleImage: (event: ChangeEvent<HTMLInputElement>) => void,
  setLoginPrompt: React.Dispatch<React.SetStateAction<ChatOption>>,
}

export default function ProfileTop({ userId, userProfile, imageType, handleImage, clearPhoto, isLoadingDelete, isLoading, isLoadingUpdate, setLoginPrompt }: Props) {
  const [hoverDp, setHoverDp] = useState<ImageTypeProp>('NIL')
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const [subscribe, { isLoading: isLoadingSubscribe }] = useSubscribeMutation()
  const { theme, revealEditModal, setRevealEditModal } = useThemeContext() as ThemeContextType
  const [hasUserId, setHasUserId] = useState<boolean>(false)

  useEffect(() => {
    let isMounted = true
    if(isMounted && currentUserId !== userProfile?._id){
      setHasUserId(() => userProfile?.notificationSubscribers?.find(sub => sub?.subscriberId === currentUserId) ? true : false)
    }
    return () => {
      isMounted = false
    }
  }, [userProfile?._id, userProfile?.notificationSubscribers, currentUserId])

  const subscribeToNotification = async() => {
    if(isLoadingSubscribe) return
    try{
      const res = await subscribe({subscribeId: userId as string, subscriberId: currentUserId}).unwrap()
      toast.success(res?.meta?.message, SuccessStyle)
    }
    catch(error){
      const errors = error as ErrorResponse
      errors?.originalStatus == 401 && setLoginPrompt('Open')
      toast.error(errors?.message as string, ErrorStyle)
    }
  }

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

      <div className={`absolute right-2 top-32 md:top-40 lg:right-0 lg:top-36 flex flex-row gap-8 md:z-10`}>
        {
          userId === currentUserId ?
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
              onClick={subscribeToNotification}
              className={`text-2xl ${userProfile ? 'block' : 'hidden'} z-10 ${isLoadingSubscribe ? 'animate-bounce' : 'animate-none'} cursor-pointer ${hasUserId ? 'text-green-500' : 'text-gray-400'} hover:scale-[1.02] active:scale-[1] transition-all`}
            />
        }
      </div>

      <p role="Code name" className="absolute top-44 md:-top-[1.5rem] flex items-center gap-2">
        <span className={`${theme === 'light' ? 'text-gray-900' : 'text-gray-300'}`}>Username:</span>
        <span className="font-medium cursor-pointer">{reduceLength(userProfile?.username as string, 15, 'letter')}</span>  
      </p>
      <p role="Country" className={`absolute right-0 md:-top-[1.5rem] top-44 ${userProfile?.country ? 'flex' : 'hidden'} items-center gap-2`}>
        <span className={`${theme === 'light' ? 'text-gray-900' : 'text-gray-300'}`}>Country:</span>
        <span className="font-medium capitalize cursor-pointer">{userProfile?.country || 'NA'}</span>  
      </p>

      <hr className={`absolute top-[195px] md:top-0 w-full border ${theme == 'light' ? 'border-gray-200' : 'border-gray-400 md:border-gray-700'}`}/>
    </>
  )
}