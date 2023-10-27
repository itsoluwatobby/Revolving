import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import { ErrorStyle } from '../utils/navigator';
import { Link, useParams } from 'react-router-dom';
import { useThemeContext } from '../hooks/useThemeContext';
import { useDeleteImageMutation } from '../app/api/storyApiSlice';
import { deleteSingleImage, imageUpload } from '../utils/helperFunc';
import EditUserInputs from '../components/editProfile/EditUserInputs';
import { ErrorResponse, ImageReturnType, UserProps } from '../types/data';
import { ImageTypeProp, TargetImageType, ThemeContextType } from '../types/posts';
import { useGetUserByIdQuery, useUpdateInfoMutation } from '../app/api/usersApiSlice';

const initialState = {name: null, data: null}
export default function EditProfilePage() {
  const { userId } = useParams()
  const MAX_SIZE = 1_000_000 as const // 1mb
  const { data: userData } = useGetUserByIdQuery(userId as string)

  const [userProfile, setUserProfile] = useState<UserProps>()
  const [imageType, setImageType] = useState<ImageTypeProp>('NIL')
  const [image, setImage] = useState<TargetImageType>(initialState)
  const [loadingImage, setLoadingImage] = useState<boolean>(false);

  const [isLoadingDelete, setIsLoadingDelete] = useState<boolean>(false);
  const [upDateUserInfo, { isLoading: isLoadingUpdate }] = useUpdateInfoMutation()
  const { theme, setRevealEditModal, setLoginPrompt } = useThemeContext() as ThemeContextType
 
  useEffect(() => {
    let isMounted = true
    const checkSizeAndUpload = async() => {
      if(!image?.data) return
      if(image?.data?.size > MAX_SIZE){
        setImage(initialState)
        return alert('MAX ALLOWED FILE SIZE IS 1MB')
      }
      else{
        if(!userProfile) return
        setLoadingImage(true)
        imageUpload(image?.data, 'profile')
        .then(async(data: ImageReturnType) => {
          if(image?.name === 'photo'){
            setImageType('DP')
            if(userProfile?.displayPicture?.photo) await deleteSingleImage(userProfile?.displayPicture?.photo, 'profile')
            const user: UserProps = { ...userProfile, displayPicture: { ...userProfile?.displayPicture, photo: data?.url } }
            await upDateUserInfo(user)
            .then(() => {
              setImage(initialState)
              setRevealEditModal('NIL')
              setImageType('NIL')
              return
            })
            .catch(error => {
              const errors = error as ErrorResponse
              toast.error(errors?.status === 'FETCH_ERROR' ?
              'SERVER ERROR' : errors?.message as string, ErrorStyle)
            })
          }
        })
        .catch((error: unknown) => {
          const errors = error as ErrorResponse
          setImageType('NIL')
          errors?.originalStatus == 401 && setLoginPrompt({opened: 'Open'})
          toast.error(errors?.status === 'FETCH_ERROR' ?
          'SERVER ERROR' : errors?.message as string, ErrorStyle)
        })
        .finally(() => setLoadingImage(false))
      }
    }
    (isMounted && image?.data) ? checkSizeAndUpload() : null

    return () => {
      isMounted = false
    }
  }, [image?.data, image?.name, setLoginPrompt, setRevealEditModal, upDateUserInfo, userProfile])

  useEffect(() => {
    let isMounted = true
    if(isMounted && userData){
      setUserProfile(userData)
    }
    return () => {
      isMounted = false
    }
  }, [userData])

  const clearPhoto = async(type: ImageTypeProp) => {
    if(!userProfile) return
    let user: UserProps;
    let imageName: string;
    setIsLoadingDelete(true)
    setImageType(type)
    if(type === 'DP'){
      imageName = userProfile?.displayPicture?.photo
      user = { ...userProfile, displayPicture: { ...userProfile?.displayPicture, photo: '' } }
    }
    else if(type === 'COVER'){
      imageName = userProfile?.displayPicture?.coverPhoto
      user = { ...userProfile, displayPicture: { ...userProfile?.displayPicture, coverPhoto: '' } }
    }
    else return
    await upDateUserInfo(user)
    await deleteSingleImage(imageName, 'profile')
    .then(() => {
      setImage(initialState)
      setRevealEditModal('NIL')
      setImageType('NIL')
    })
    .catch(() => {
      setImage(initialState)
      setRevealEditModal('NIL')
      setImageType('NIL')
      toast.error('Error deleting image', ErrorStyle)
    })
    .finally(() => setIsLoadingDelete(false))
  }

  
  return (
    <section className={`hidebars single_page ${theme === 'light' ? '' : ''} text-sm p-2 pt-0 flex flex-col w-full overflow-y-scroll`}>
      
      <div className={`sticky w-full flex flex-col pt-3 top-0 z-30 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>

        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-medium'>Public profile</h2>
          <Link to={`/profile/${userProfile?._id}`} >
            <button 
              className={`p-1 px-3 rounded-sm shadow-md hover:opacity-95 active:opacity-100 focus:outline-none border-none ${theme === 'light' ? 'bg-slate-400 text-white' : 'bg-slate-600'} z-20 transition-all`}
            >
              Close
            </button>
          </Link>
        </div>

        <hr className={`w-full border ${theme == 'light' ? 'border-gray-200' : 'border-gray-400'}`}/>

      </div>

      <EditUserInputs 
        isLoading={loadingImage} setLoginPrompt={setLoginPrompt}
        imageType={imageType} theme={theme} setImage={setImage} 
        clearPhoto={clearPhoto} userProfile={userProfile as UserProps}
        isLoadingDelete={isLoadingDelete} isLoadingUpdate={isLoadingUpdate}
      />

    </section>
  )
}