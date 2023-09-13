import { toast } from "react-hot-toast";
import { useParams } from 'react-router-dom';
import { ErrorStyle } from "../utils/navigator";
import { ErrorResponse, UserProps } from "../data";
import { ChangeEvent, useEffect, useState } from 'react';
import ProfileMid from "../components/profile/ProfileMid";
import ProfileTop from "../components/profile/ProfileTop";
import { useThemeContext } from "../hooks/useThemeContext";
import ProfileBase from "../components/profile/ProfileBase";
import { useGetUserByIdQuery, useUpdateInfoMutation } from "../app/api/usersApiSlice";
import { ImageTypeProp, NameType, PostType, TargetImageType, ThemeContextType } from "../posts";
import { useDeleteImageMutation, useGetStoriesWithUserIdQuery, useUploadImageMutation } from "../app/api/storyApiSlice";

const initialState = {name: null, data: null}

export default function ProfilePage() {
  const { userId } = useParams()
  const MAX_SIZE = 1_000_000 as const // 1mb
  const { data: userData } = useGetUserByIdQuery(userId as string)
  const [userProfile, setUserProfile] = useState<UserProps>()
  const [imageType, setImageType] = useState<ImageTypeProp>('NIL')
  const [image, setImage] = useState<TargetImageType>(initialState)
  const [userStories, setUserStories] = useState<Partial<PostType[]>>()
  const [uploadToServer, { isLoading }] = useUploadImageMutation()
  const [deleteImage, { isLoading: isLoadingDelete }] = useDeleteImageMutation()
  const [upDateUserInfo, { isLoading: isLoadingUpdate }] = useUpdateInfoMutation()
  const { theme, setOpenChat, setLoginPrompt, setRevealEditModal } = useThemeContext() as ThemeContextType
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

  // const truncate = about.length > 250 ? about.substring(0, 250)+'...' : about

  // useEffect(() => {
  //   const userLink = async() => {
  //     const info = await axios.get('https://twitter.com/itsoluwatobby',
  //       {
  //         headers: { 'Content-Type': 'application/json'}
  //       }
  //     )
  //     console.log(info.data)
  //   }
  //   userLink()

  // }, [])

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
        const imageData = new FormData()
        imageData.append('image', image?.data)
        await uploadToServer(imageData).unwrap()
        .then(async(data) => {
          const res = data as unknown as { url: string }
          // throw new Error("Testing Ongoing")
          if(image?.name === 'photo'){
            setImageType('DP')
            const user: UserProps = { ...userProfile, displayPicture: { ...userProfile?.displayPicture, photo: res?.url } }
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
            const user: UserProps = { ...userProfile, displayPicture: { ...userProfile?.displayPicture, coverPhoto: res?.url } }
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
          errors?.originalStatus == 401 && setLoginPrompt('Open')
        })
      }
    }
    (isMounted && image?.data) ? checkSizeAndUpload() : null

    return () => {
      isMounted = false
    }
  }, [image?.data, image?.name, setLoginPrompt, setRevealEditModal, uploadToServer, upDateUserInfo, userProfile])

  const clearPhoto = async(type: ImageTypeProp) => {
    if(!userProfile) return
    let user: UserProps;
    let imageName: string;
    setImageType(type)
    if(type === 'DP'){
      imageName = userProfile?.displayPicture?.photo.substring(userProfile?.displayPicture?.photo?.lastIndexOf('/')+1)
      user = { ...userProfile, displayPicture: { ...userProfile?.displayPicture, photo: '' } }
    }
    else if(type === 'COVER'){
      imageName = userProfile?.displayPicture?.coverPhoto.substring(userProfile?.displayPicture?.coverPhoto?.lastIndexOf('/')+1)
      user = { ...userProfile, displayPicture: { ...userProfile?.displayPicture, coverPhoto: '' } }
    }
    else return
    await upDateUserInfo(user)
    await deleteImage(imageName)
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
  }

  const closeSetups = () => {
    setOpenChat('Hide')
    setLoginPrompt('Hide')
  }
  console.log(userProfile)

  return (
    <main
      role="User profile"
      onClick={closeSetups}
      className={`hidebars single_page md:pt-8 text-sm p-2 flex-col gap-2 w-full overflow-y-scroll`}>

      <section className={`relative flex-auto text-sm flex md:flex-row flex-col gap-2 w-full`}>
        <ProfileTop 
          userProfile={userProfile as UserProps} 
          handleImage={handleImage} imageType={imageType}
          isLoading={isLoading} isLoadingUpdate={isLoadingUpdate}
          clearPhoto={clearPhoto} isLoadingDelete={isLoadingDelete} 
        />
        <ProfileMid 
          setRevealEditModal={setRevealEditModal} 
          userProfile={userProfile as UserProps} theme={theme} 
        />
      </section>

      <ProfileBase 
        userStories={userStories as PostType[]} 
        userProfile={userProfile as UserProps} theme={theme} 
        isStoryLoading={isStoryLoading} isStoryError={isStoryError} 
        storyError={storyError} setRevealEditModal={setRevealEditModal}
      />

    </main>
  )
}
