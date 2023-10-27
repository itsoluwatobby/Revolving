import { toast } from "react-hot-toast";
import { useParams } from 'react-router-dom';
import { ErrorStyle } from "../utils/navigator";
import { LeftSection } from "../components/LeftSection";
import { ChangeEvent, useEffect, useState } from 'react';
import ProfileMid from "../components/profile/ProfileMid";
import ProfileTop from "../components/profile/ProfileTop";
import { useThemeContext } from "../hooks/useThemeContext";
import ProfileBase from "../components/profile/ProfileBase";
import { deleteSingleImage, imageUpload } from "../utils/helperFunc";
import SkeletonProfile from "../components/skeletons/SkeletonProfile";
import { useGetStoriesWithUserIdQuery } from "../app/api/storyApiSlice";
import { ErrorResponse, ImageReturnType, UserProps } from "../types/data";
import { useGetUserByIdQuery, useUpdateInfoMutation } from "../app/api/usersApiSlice";
import { ImageTypeProp, NameType, PostType, TargetImageType, ThemeContextType } from "../types/posts";

const initialState = {name: null, data: null}

export default function ProfilePage() {
  const { userId } = useParams()
  const MAX_SIZE = 1_000_000 as const // 1mb
  const [userProfile, setUserProfile] = useState<UserProps>()
  const [imageType, setImageType] = useState<ImageTypeProp>('NIL')
  const [image, setImage] = useState<TargetImageType>(initialState)
  const [loadingImage, setLoadingImage] = useState<boolean>(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState<boolean>(false);
  const [userStories, setUserStories] = useState<Partial<PostType[]>>()
  const [upDateUserInfo, { isLoading: isLoadingUpdate }] = useUpdateInfoMutation()
  const { theme, setOpenChat, setLoginPrompt, setRevealEditModal } = useThemeContext() as ThemeContextType
  const { data: userData, isLoading: isLoadingUserInfo } = useGetUserByIdQuery(userId as string)
  const { data, isLoading: isStoryLoading, isError: isStoryError, error: storyError } =  useGetStoriesWithUserIdQuery(userId as string)

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name as NameType
    const imageFile = (event.target as HTMLInputElement).files as FileList
    setImage({name, data: imageFile[0]})
  }

  useEffect(() => {
    let isMounted = true
    if(isMounted && userData){
      setUserProfile(userData)
    }
    return () => {
      isMounted = false
    }
  }, [userData])
  
  useEffect(() => {
    let isMounted = true
    if(isMounted && data){
      const allUserStories = [...data]
      setUserStories(allUserStories as PostType[])
    }
    return () => {
      isMounted = false
    }
  },  [data])

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
              toast.error(errors?.message as string, ErrorStyle)
            })
          }
          else if(image?.name === 'coverPhoto'){
            setImageType('COVER')
            if(userProfile?.displayPicture?.coverPhoto) await deleteSingleImage(userProfile?.displayPicture?.coverPhoto, 'profile')
            const user: UserProps = { ...userProfile, displayPicture: { ...userProfile?.displayPicture, coverPhoto: data?.url } }
            await upDateUserInfo(user)
            .then(() => {
              setImage(initialState)
              setImageType('NIL')
              return
            })
            .catch(error => {
              const errors = error as ErrorResponse
              toast.error(errors?.message as string, ErrorStyle)
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

  const closeSetups = () => {
    setOpenChat('Hide')
    setLoginPrompt({opened: 'Hide'})
  }

  return (
    <main
      role="User profile"
      onClick={closeSetups}
      className={`w-full flex`}>
      
      <LeftSection />

      <div className={`hidebars single_page flex-auto md:pt-8 text-sm p-2 pt-0 flex-col gap-2 w-full overflow-y-scroll`}>
        <section className={`relative flex-auto text-sm flex md:flex-row flex-col gap-2 w-full`}>
          {
            isLoadingUserInfo ?
              <SkeletonProfile theme={theme} page="EDIT" />
            :
            <>
              <ProfileTop 
                isLoading={loadingImage} isLoadingUpdate={isLoadingUpdate}
                clearPhoto={clearPhoto} isLoadingDelete={isLoadingDelete} 
                handleImage={handleImage} imageType={imageType} userId={userId as string}
                userProfile={userProfile as UserProps} setLoginPrompt={setLoginPrompt}
              />
              <ProfileMid 
                userProfile={userProfile as UserProps} theme={theme} 
                setRevealEditModal={setRevealEditModal} userId={userId as string}
              />
            </>
          }
        </section>

        <ProfileBase 
          userStories={userStories as PostType[]} theme={theme} 
          isStoryLoading={isStoryLoading} isStoryError={isStoryError} 
          storyError={storyError} setRevealEditModal={setRevealEditModal}
        />
      </div>

    </main>
  )
}
