import DPComponent from '../components/profile/DPComponent';
import { toast } from 'react-hot-toast';
import { ErrorStyle } from '../utils/navigator';
import { Link, useParams } from 'react-router-dom';
import { ErrorResponse, UserProps } from '../data';
import { ChangeEvent, useState, useEffect } from 'react';
import { useThemeContext } from '../hooks/useThemeContext';
import { ImageTypeProp, NameType, TargetImageType, Theme, ThemeContextType } from '../posts';
import { useGetUserByIdQuery, useUpdateInfoMutation } from '../app/api/usersApiSlice';
import { useDeleteImageMutation, useUploadImageMutation } from '../app/api/storyApiSlice';
import PasswordInput from '../components/modals/components/PasswordInput';

const initialState = {name: null, data: null}
type SocialMediaAccoutProp = {
  name: string,
  link: string
}

const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!£%*?&])[A-Za-z\d@£$!%*?&]{9,}$/;

export default function EditProfilePage() {
  const { userId } = useParams()
  const MAX_SIZE = 1_000_000 as const // 1mb
  const [hoverDp, setHoverDp] = useState<ImageTypeProp>('NIL')
  const { data: userData } = useGetUserByIdQuery(userId as string)

  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [validPassword, setValidPassword] = useState<boolean>(false)
  const [revealPassword, setRevealPassword] = useState<boolean>(false)
  const [match, setMatch] = useState<boolean>(false);

  const [userProfile, setUserProfile] = useState<UserProps>()
  const [imageType, setImageType] = useState<ImageTypeProp>('NIL')
  const [image, setImage] = useState<TargetImageType>(initialState)
  const [uploadToServer, { isLoading }] = useUploadImageMutation()

  const [deleteImage, { isLoading: isLoadingDelete }] = useDeleteImageMutation()
  const [upDateUserInfo, { isLoading: isLoadingUpdate }] = useUpdateInfoMutation()
  const { theme, setRevealEditModal, setLoginPrompt } = useThemeContext() as ThemeContextType
  const [checked, setChecked] = useState<boolean>(false)
  const [hobbiesEntry, setHobbiesEntry] = useState<string[]>([])

  const stringVals = ['username', 'description', 'password', 'country']
  const arrayVals = ['hobbies', 'gender', 'stack']

  const handlePassword = (event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)
  const handleConfirmPassword = (event: ChangeEvent<HTMLInputElement>) => setConfirmPassword(event.target.value)

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name as NameType
    const imageFile = (event.target as HTMLInputElement).files as FileList
    setImage({name, data: imageFile[0]})
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name
    const value = event.target.value
    if(stringVals.includes(name)){
      
    }
  }

  const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const name = event.target.name
    const value = event.target.value
    if(stringVals.includes(name)){
      
    }
  }

  useEffect(() => {
    setValidPassword(
      passwordRegex.test(password)
    )
  }, [password])
  
  useEffect(() => {
    setMatch(
      password == confirmPassword
    )
  }, [password, confirmPassword])

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

      <div className='flex flex-col gap-y-2 w-full h-full py-2 '>
        
        <div className='flex flex-col gap-1'>
          <h3 className='pl-3 text-base font-medium'>Profile picture</h3>
          <DPComponent page='EDIT'
            clearPhoto={clearPhoto} isLoadingUpdate={isLoadingUpdate} 
            handleImage={handleImage} isLoadingDelete={isLoadingDelete}
            setHoverDp={setHoverDp} userProfile={userProfile as UserProps}
            imageType={imageType} isLoading={isLoading} hoverDp={hoverDp}
          />
        </div>

        <div className='flex flex-col md:flex-row mobile:w-full w-7/12 md:w-4/6 p-2 gap-y-2 gap-x-2'>   
          <div className='flex flex-col gap-1 w-full'>
            <h3 className='text-base font-medium'>Email</h3>
            <div className={`rounded-sm border ${theme === 'light' ? 'border-gray-300' : 'border-gray-100'} w-full h-10`}>
              <input  
                value={userProfile?.email}
                disabled={true}
                className={`w-full px-2 py-1 h-full border-none focus:outline-none placeholder:text-gray-600 rounded-sm`}
              />
            </div>
          </div>
        </div>

        <div className='flex flex-col md:flex-row w-7/12 mobile:w-full md:w-4/6 p-2 gap-y-2 gap-x-2'>
          <InputField title='First Name'
            name='firstName' placeholder='First name' inputType='name' theme={theme} 
            value={userProfile?.firstName as string} handleChange={handleChange}
          />
          <InputField title='Last Name'
            name='lastName' placeholder='Last name' inputType='name' theme={theme} 
            value={userProfile?.lastName as string} handleChange={handleChange}
          />
        </div>

        <div className='flex flex-col md:flex-row mobile:w-full w-7/12 md:w-4/6 p-2 gap-y-2 gap-x-2'> 
          <InputField title='Username'
            name='username' placeholder='username' inputType='name' theme={theme} 
            value={userProfile?.username as string} handleChange={handleChange}
          />
          <InputField title='Country'
            name='country' placeholder='country' inputType='text' theme={theme} 
            value={userProfile?.country as string} handleChange={handleChange}
          />
        </div>

        <div className='flex flex-col gap-1 p-2 mobile:w-full w-7/12 md:w-4/6'>
          <h3 className='text-base font-medium'>Description</h3>
          <div className={`rounded-sm border ${theme === 'light' ? 'border-gray-300' : 'border-gray-100'} w-full h-20`}>
            <textarea 
              name='description'
              value={userProfile?.description} 
              placeholder='About me' 
              rows={14}
              onChange={handleDescriptionChange}
              className={`w-full px-2 py-1 h-full border-none focus:outline-none placeholder:text-gray-600 rounded-sm`}
            />
          </div>
        </div>

        <div className='flex flex-col mobile:w-full w-7/12 md:w-4/6 p-2 gap-y-2 gap-x-2'>
          <div className='flex items-center gap-4 w-fit'>
            <h3 className='text-base font-medium'>Change password</h3>
            <input 
              type="checkbox" 
              checked={checked}
              onChange={e => setChecked(e.target.checked)}
              className={`focus:outline-none rounded-sm shadow-sm w-4 h-4 cursor-pointer`}
            />
          </div>
          <InputField title='Old password'
            name='oldPassword' placeholder='**************' inputType='password' theme={theme} 
            value={''} handleChange={handleChange}
          />
          <div className={`${checked ? 'flex scale-1' : 'scale-0 hidden'} transition-all flex-col md:flex-row w-full gap-y-2 gap-x-2`}>
            <PasswordInput page='EDIT'
              password={password} match={match} handlePassword={handlePassword} 
              revealPassword={revealPassword} setRevealPassword={setRevealPassword} 
              handleConfirmPassword={handleConfirmPassword} confirmPassword={confirmPassword}
            />
          </div>
        </div>

        <div className='flex flex-col mobile:w-full w-7/12 md:w-4/6 p-2 gap-y-2'> 
          <h3 className='text-base font-medium capitalize'>Social medial links</h3>
          <div className='flex flex-col md:flex-row gap-y-2 gap-x-2'> 
            <InputField title='Name'
              name='name' placeholder='media name' inputType='text' theme={theme} 
              value={userProfile?.username as string} handleChange={handleChange}
            />
            <InputField title='Link'
              name='link' placeholder='media link' inputType='text' theme={theme} 
              value={userProfile?.country as string} handleChange={handleChange}
            />
          </div>
        </div>
        
        <div className='flex flex-col mobile:w-full w-7/12 md:w-4/6 p-2 gap-y-2'> 
          <h3 className='text-base font-medium capitalize'>Hobbies <span className='text-sm lowercase text-gray-500'>*max 3</span></h3> 
          <InputField title=''
            name='name' placeholder='media name' inputType='text' theme={theme} 
            value={userProfile?.username as string} handleChange={handleChange}
          />
            
          <div className='flex items-center gap-1'>
            {
              hobbiesEntry?.map(hobby => (
                <p className='rounded-sm p-1 shadow-md border '>{hobby}</p>
              ))
            }
          </div>

        </div>

      </div>

    </section>
  )
}

type InputFieldName = {
  name: string,
  value: string,
  title: string,
  theme: Theme,
  inputType: string,
  placeholder: string,
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void,
}

const InputField = ({ title, name, value, theme, handleChange, inputType, placeholder }: InputFieldName) => {

  return (
    <div className='flex flex-col gap-1 w-full'>
      <h3 className='text-base font-medium'>{title}</h3>
      <div className={`rounded-sm border ${theme === 'light' ? 'border-gray-300' : 'border-gray-100'} w-full h-10`}>
        <input 
          type={inputType} name={name} 
          value={value} placeholder={placeholder} 
          onChange={handleChange}
          className={`w-full px-2 ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-100'} text-black py-1 h-full border-none focus:outline-none placeholder:text-gray-600 rounded-sm`}
        />
      </div>
    </div>
  )
}