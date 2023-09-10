import { toast } from "react-hot-toast";
import { ChangeEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ErrorStyle } from "../utils/navigator";
import { ErrorResponse, UserProps } from "../data";
import { ImageTypeProp, NameType, PostType, TargetImageType, ThemeContextType } from "../posts";
import ProfileMid from "../components/profile/ProfileMid";
import ProfileTop from "../components/profile/ProfileTop";
import { useThemeContext } from "../hooks/useThemeContext";
import ProfileBase from "../components/profile/ProfileBase";
import { useGetCurrentUserMutation, useUpdateInfoMutation } from "../app/api/usersApiSlice";
import { useCoverImageuploadMutation, useDeleteImageMutation, useGetStoriesWithUserIdQuery, usePersonalImageuploadMutation } from "../app/api/storyApiSlice";

const initialState = {name: null, data: null}

export default function ProfilePage() {
  const { userId } = useParams()
  const MAX_SIZE = 1_530_000 as const // 1.53mb
  const [getCurrentUser] = useGetCurrentUserMutation()
  const [userProfile, setUserProfile] = useState<UserProps>()
  const [imageType, setImageType] = useState<ImageTypeProp>('NIL')
  const [image, setImage] = useState<TargetImageType>(initialState)
  const [userStories, setUserStories] = useState<Partial<PostType[]>>()
  const [uploadDPToServer, { isLoading: isLoadingDp }] = usePersonalImageuploadMutation()
  const [deleteImage, { isLoading: isLoadingDelete }] = useDeleteImageMutation()
  const [upDateUserInfo, { isLoading: isLoadingUpdate }] = useUpdateInfoMutation()
  const [uploadCoverToServer, { isLoading: isLoadingCover }] = useCoverImageuploadMutation()
  const { theme, setOpenChat, setLoginPrompt, setOpenEditPage } = useThemeContext() as ThemeContextType
  const { data, isLoading: isStoryLoading, isError: isStoryError, error: storyError } =  useGetStoriesWithUserIdQuery(userId as string)

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name as NameType
    const imageFile = (event.target as HTMLInputElement).files as FileList
    setImage({name, data: imageFile[0]})
  }

  useEffect(() => {
    let isMounted = true
    const getUserProfile = async() => {
      try{
        const user = await getCurrentUser(userId as string).unwrap()
        setUserProfile(user)
      }
      catch(err){
        const errors = (err as ErrorResponse) ?? (err as ErrorResponse)
        errors?.originalStatus == 401 && setLoginPrompt('Open')
        err && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, ErrorStyle)
        // state !== '/signIn' ? navigate(state) :  navigate('/')
      }
    }
    if(isMounted && userId && !userProfile) getUserProfile()
    return () => {
      isMounted = false
    }
  }, [userId, setLoginPrompt, getCurrentUser, userProfile])
  
  useEffect(() => {
    let isMounted = true
    if(isMounted && userProfile && !userStories?.length){
      const allUserStories = data?.length ? [...data] : []
      setUserStories(allUserStories as PostType[])
    }

    return () => {
      isMounted = false
    }
  },  [userProfile, data, userStories])
  console.log(data)

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
        return alert('MAX ALLOWED FILE SIZE IS 1.53MB')
      }
      else{
        if(!userProfile) return
        const imageData = new FormData()
        imageData.append('name', image?.name as string)
        imageData.append('image', image?.data)
        if(image?.name === 'photo'){
          await uploadDPToServer(imageData).unwrap()
          .then(async(data) => {
            throw new Error("Testing Ongoing")
            const res = data as unknown as { url: string }
              setImageType('DP')
              const user: UserProps = { ...userProfile, displayPicture: { ...userProfile?.displayPicture, photo: res?.url } }
              await upDateUserInfo(user)
              .then(() => {return})
              .catch(error => {
                const errors = error as ErrorResponse
                toast.error(errors?.message as string, ErrorStyle)
              })
              setImage(initialState)
              setImageType('NIL')
            }).catch((error: unknown) => {
            const errors = error as ErrorResponse
            setImageType('NIL')
            errors?.originalStatus == 401 && setLoginPrompt('Open')
          })
        }
        else if(image?.name === 'coverPhoto'){
          await uploadCoverToServer(imageData).unwrap()
          .then(async(data) => {
            //throw new Error("Testing Ongoing")
            const res = data as unknown as { url: string }
            setImageType('COVER')
            const user: UserProps = { ...userProfile, displayPicture: { ...userProfile?.displayPicture, coverPhoto: res?.url } }
            await upDateUserInfo(user)
            .then(() => {return})
            .catch(error => {
              const errors = error as ErrorResponse
              toast.error(errors?.message as string, ErrorStyle)
            })
            setImage(initialState)
            setImageType('NIL')
          }).catch((error: unknown) => {
            const errors = error as ErrorResponse
            setImageType('NIL')
            errors?.originalStatus == 401 && setLoginPrompt('Open')
          })
        }
        else{
          setImage(initialState)
          setImageType('NIL')
          return
        }
      }
    }
    (isMounted && image?.data) ? checkSizeAndUpload() : null

    return () => {
      isMounted = false
    }
  }, [image?.data, image?.name, setLoginPrompt, uploadDPToServer, uploadCoverToServer, upDateUserInfo, userProfile])


  const clearPhoto = async(type: ImageTypeProp) => {
    if(!userProfile) return
    let user: UserProps;
    let imageName: string;
    setImageType(type)
    if(type === 'DP'){
      user = { ...userProfile, displayPicture: { ...userProfile?.displayPicture, photo: '' } }
      imageName = userProfile?.displayPicture?.photo.substring(userProfile?.displayPicture?.photo?.lastIndexOf('/')+1)
    }
    else if(type === 'COVER'){
      user = { ...userProfile, displayPicture: { ...userProfile?.displayPicture, coverPhoto: '' } }
      imageName = userProfile?.displayPicture?.coverPhoto.substring(userProfile?.displayPicture?.coverPhoto?.lastIndexOf('/')+1)
    }
    else return
    await upDateUserInfo(user)
    await deleteImage(imageName)
    .then(() => {
      setImage(initialState)
      setImageType('NIL')
    })
    .catch(() => {
      setImage(initialState)
      setImageType('NIL')
      toast.error('Error deleting images', ErrorStyle)
    })
  }

console.log(userProfile)
  return (
    <main
      role="User profile"
      onClick={() => {
        setOpenChat('Hide')
        setLoginPrompt('Hide')
        }
      }
      className={`hidebars single_page md:pt-8 text-sm p-2 flex flex-col gap-2 w-full overflow-y-scroll`}>

      <section className={`relative flex-auto text-sm flex md:flex-row flex-col gap-2 w-full`}>
        <ProfileTop 
          userProfile={userProfile as UserProps} 
          isLoadingDp={isLoadingDp} image={image} imageType={imageType}
          isLoadingUpdate={isLoadingUpdate} clearPhoto={clearPhoto}
          isLoadingDelete={isLoadingDelete} handleImage={handleImage}
          theme={theme} setOpenEditPage={setOpenEditPage} isLoadingCover={isLoadingCover}
        />
        <ProfileMid userProfile={userProfile as UserProps} theme={theme} />
      </section>

      <ProfileBase 
        userProfile={userProfile as UserProps} theme={theme} 
        userStories={userStories as PostType[]} 
        isStoryLoading={isStoryLoading} isStoryError={isStoryError} 
        storyError={storyError}
      />

    </main>
  )
}
