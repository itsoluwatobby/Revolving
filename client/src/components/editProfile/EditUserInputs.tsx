import toast from 'react-hot-toast';
import { InputField } from './InputField';
import DPComponent from '../profile/DPComponent';
import { ArrayComponent } from './ArrayComponent';
import { IsLoadingSpinner } from '../IsLoadingSpinner';
import PasswordInput from '../modals/components/PasswordInput';
import { ErrorStyle, SuccessStyle } from '../../utils/navigator';
import { useUpdateInfoMutation } from '../../app/api/usersApiSlice';
import { useConfirmPasswordMutation } from '../../app/api/authApiSlice';
import { ChangeEvent, useState, useEffect, useRef, useCallback } from 'react';
import { TimeoutId } from '@reduxjs/toolkit/dist/query/core/buildMiddleware/types';
import { ChatOption, ImageTypeProp, LoginPromptType, NameType, TargetImageType, Theme } from '../../types/posts';
import { Entries, ErrorResponse, Gender, InitEntriesType, InitPrevEntriesType, SocialMediaAccoutProp, UserProps, ValueType } from '../../types/data';

type UserInputsProps = {
  theme: Theme,
  isLoading: boolean,
  userProfile: UserProps,
  isLoadingDelete: boolean,
  isLoadingUpdate: boolean,
  imageType: ImageTypeProp,
  clearPhoto: (type: ImageTypeProp) => Promise<void>,
  setImage: React.Dispatch<React.SetStateAction<TargetImageType>>
  setLoginPrompt: React.Dispatch<React.SetStateAction<LoginPromptType>>
}

const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!£%*?&])[A-Za-z\d@£$!%*?&]{9,}$/;

const initPrevEntries = { prevHobby: '', prevStack: '', prevSocialName: '' }

const initUserState = { username: '', firstName: '', lastName: '', country: '', description: '', hobbies: [] as string[], gender: 'Undecided' as Gender, stack: [] as string[], socialMediaAccounts: [] as SocialMediaAccoutProp[]}

const initEntries = { hobbiesEntry: '', stackEntry: '', socialMediaEntry: '', socialMediaName: '' }
const initPasswordConfig = { match: false, validPassword: false, password: '', confirmPassword: '' }
export default function EditUserInputs({ theme, userProfile, imageType, setImage, clearPhoto, isLoading, isLoadingDelete, isLoadingUpdate, setLoginPrompt }: UserInputsProps) {
  const MAX_DESCRIPTION_LENGTH = 250 as const
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [checked, setChecked] = useState<boolean>(false)
  const [reveal, setReveal] = useState<ChatOption>('Hide')
  const [hoverDp, setHoverDp] = useState<ImageTypeProp>('NIL')

  const RequiredGenders = ['Male', 'Female', 'Others', 'Undecided']
  const [currentPassword, setCurrentPassword] = useState<string>('')
  const [revealPassword, setRevealPassword] = useState<boolean>(false)
  const [arrayEntry, setArrayEntry] = useState<InitEntriesType>(initEntries)

  const [userDetails, setUserDetails] = useState<Partial<UserProps>>(initUserState)
  const [inputRef0, inputRef01, inputRef1, inputRef2] = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]
  const [passwordConfig, setPasswordConfig] = useState<typeof initPasswordConfig>(initPasswordConfig)

  const [upDateUserInfo, { isLoading: isLoadingUserInfo, isError: isErrorUserInfo }] = useUpdateInfoMutation()
  const [confirmCurrentPassword, { isLoading: isLoadingConfirmation, isError, isSuccess }] = useConfirmPasswordMutation()
  const [prevEntries, setPrevEntries] = useState<InitPrevEntriesType>(initPrevEntries)
  const NameValues = ['socialMediaName', 'socialMediaEntry', 'hobbiesEntry', 'stackEntry'] as const
  const scrollRef0 = useCallback((node: Element) => {
    node ? node?.scrollIntoView({ behavior: 'smooth'}) : null
  }, [])
  const scrollRef1 = useCallback((node: Element) => {
    node ? node?.scrollIntoView({ behavior: 'smooth'}) : null
  }, [])
  const scrollRef2 = useCallback((node: Element) => {
    node ? node?.scrollIntoView({ behavior: 'smooth'}) : null
  }, [])

  const stringVals = ['username', 'firstName', 'lastName', 'country']

  const { stackEntry, hobbiesEntry, socialMediaEntry, socialMediaName } = arrayEntry

  const { match, validPassword, password, confirmPassword } = passwordConfig
  const { username, firstName, lastName, country, description, hobbies, gender, stack, socialMediaAccounts } = userDetails

  const handleCurrent = (event: ChangeEvent<HTMLInputElement>) => setCurrentPassword(event.target.value)
  const handlePassword = (event: ChangeEvent<HTMLInputElement>) => setPasswordConfig(prev => ({...prev, [event.target.name]: event.target.value }))
  
  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name as NameType
    const imageFile = (event.target as HTMLInputElement).files as FileList
    setImage({name, data: imageFile[0]})
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name
    const value = event.target.value
    if(NameValues?.includes(name as (Entries | ValueType))){
      setArrayEntry(prev => ({...prev, [name]: value}))
    }
    else if(stringVals.includes(name)){
      setUserDetails(prev => ({...prev, [name]: value}))
    }
  }

  const addToArray = (type: Entries) => {
    if(type === 'hobbiesEntry'){
      if(!hobbiesEntry || (hobbies as string[])?.length >= 5) return
      const filteredHobbies = hobbies?.filter(hobby => hobby?.toLowerCase() !== hobbiesEntry.trim()?.toLowerCase())?.filter(hobby => hobby?.toLowerCase() !== prevEntries?.prevHobby?.toLowerCase()) as string[]
      setUserDetails(prev => ({...prev, hobbies: [...filteredHobbies, hobbiesEntry.trim()]}))
      setArrayEntry(prev => ({...prev, [type]: ''}))
      if(inputRef1?.current) inputRef1.current.focus()
    }
    else if(type === 'stackEntry'){
      if(!stackEntry || (stack as string[])?.length >= 10) return
      const filteredStacks = stack?.filter(stk => stk?.toLowerCase() !== stackEntry.trim()?.toLowerCase())?.filter(stack => stack?.toLowerCase() !== prevEntries?.prevStack?.toLowerCase()) as string[]
      setUserDetails(prev => ({...prev, stack: [...filteredStacks, stackEntry.trim()]}))
      setArrayEntry(prev => ({...prev, [type]: ''}))
      if(inputRef2?.current) inputRef2.current.focus()
    }
    else if(type === 'socialMediaEntry'){
      if((socialMediaAccounts as SocialMediaAccoutProp[])?.length >= 3) return
      if(!socialMediaName) inputRef01.current ? inputRef01.current.focus() : null
      else if(!socialMediaEntry) inputRef0.current ? inputRef0.current.focus() : null
      else{
        const newMedia: SocialMediaAccoutProp = { name: socialMediaName.trim(), link: socialMediaEntry.trim() }
        const filteredAccounts = socialMediaAccounts?.filter(media => media?.name?.toLowerCase() !== socialMediaName.toLowerCase() || media?.link?.toLowerCase() !== socialMediaEntry.toLowerCase())?.filter(media => media?.name?.toLowerCase() !== prevEntries?.prevSocialName?.toLowerCase()) as SocialMediaAccoutProp[]
        setUserDetails(prev => ({...prev, socialMediaAccounts: [...filteredAccounts, newMedia]}))
        setArrayEntry(prev => ({...prev, socialMediaEntry: '', socialMediaName: ''}))
        if(inputRef0?.current) inputRef0.current.focus()
      }
    }
  }

  const removeFromArray = (name: string, type: Entries) => {
    if(type === 'hobbiesEntry'){
      const filteredHobbies = hobbies?.filter(hobby => hobby?.toLowerCase() !== name.toLowerCase()) as string[]
      setUserDetails(prev => ({...prev, hobbies: [...filteredHobbies]}))
      if(inputRef1?.current) inputRef1.current.focus()
    }
    else if(type === 'stackEntry'){
      const filteredStacks = stack?.filter(stk => stk?.toLowerCase() !== name.toLowerCase()) as string[]
      setUserDetails(prev => ({...prev, stack: [...filteredStacks]}))
      if(inputRef2?.current) inputRef2.current.focus()
    }
    else if(type === 'socialMediaEntry'){
      const filteredAccounts = (socialMediaAccounts as SocialMediaAccoutProp[])?.filter(media => media?.name?.toLowerCase() !== name.toLowerCase())
      setUserDetails(prev => ({...prev, socialMediaAccounts: [...filteredAccounts]}))
      if(inputRef0?.current) inputRef0.current.focus()
    }
  }

  useEffect(() => {
    let isMounted = true
    isMounted && setUserDetails({...userProfile})
    return () => {
      isMounted = false
    }
  }, [userProfile])

  useEffect(() => {
    let isMounted = true
    let timerId: TimeoutId
    if(isMounted && errorMsg){
      timerId = setTimeout(() => {
        setErrorMsg('')
      }, 10000);
    }
    return () => {
      isMounted = false
      clearTimeout(timerId)
    }
  }, [errorMsg])

  useEffect(() => {
    let isMounted = true
    if(isMounted){
      setPasswordConfig(prev => ({ ...prev, validPassword: passwordRegex.test(password) }))
    }
    return () => {
      isMounted = false
    }
  }, [password])
  
  useEffect(() => {
    let isMounted = true
    if(isMounted){
      setPasswordConfig(prev => ({ ...prev, match: password === confirmPassword }))
    }
    return () => {
      isMounted = false
    }
  }, [password, confirmPassword])

  const getConfirmation = async() => {
    try{
      await confirmCurrentPassword({email: userProfile?.email, password: currentPassword.trim()}).unwrap()
    }
    catch(error){
      const errors = error as ErrorResponse;
      (!errors || errors?.originalStatus == 401) ? setLoginPrompt({opened: 'Open'}) : null;
      setErrorMsg(errors?.data?.meta?.message)
      isError && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, ErrorStyle)
    }
  }

  const updateInfo = async() => {
    try{
      if(password) await upDateUserInfo({...userDetails, password: password.trim()} as UserProps).unwrap()
      else {
        const details = { 
          ...userDetails, firstName: firstName?.trim(), lastName: lastName?.trim(),
          username: username?.trim(), description: description?.trim(), country: country?.trim()
        }
        await upDateUserInfo(details as UserProps).unwrap()
      }
      toast.success('Successfully updated', SuccessStyle)
      setPasswordConfig(initPasswordConfig)
      setChecked(false)
    }
    catch(error){
      const errors = error as ErrorResponse;
      (!errors || errors?.originalStatus == 401) ? setLoginPrompt({opened: 'Open'}) : null;
      isErrorUserInfo && toast.error(`${errors?.originalStatus == 401 ? 'Please sign in' : errors?.data?.meta?.message}`, ErrorStyle)
    }
  }

  return (
     <div className='flex flex-col gap-y-2 w-full h-full py-2'>
        
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
                value={userProfile?.email || ''}
                disabled={true}
                className={`w-full px-2 py-1 h-full border-none focus:outline-none placeholder:text-gray-600 rounded-sm`}
              />
            </div>
          </div>
        </div>

        <div className='flex flex-col md:flex-row w-7/12 mobile:w-full md:w-4/6 p-2 gap-y-2 gap-x-2'>
          <InputField title='First Name'
            name='firstName' placeholder='First name' inputType='name' theme={theme} 
            value={firstName as string || ''} handleChange={handleChange}
          />
          <InputField title='Last Name'
            name='lastName' placeholder='Last name' inputType='name' theme={theme} 
            value={lastName as string || ''} handleChange={handleChange}
          />
        </div>

        <div className='flex flex-col mobile:w-full w-7/12 md:w-4/6 gap-y-2 rounded-sm'>
        <h3 className='text-sm font-medium pl-3 opacity-90'>Gender</h3>
          <div className={`flex items-center px-3 gap-4 transition-all`}>
            {
              RequiredGenders?.map(gend => (
                <p 
                  key={gend}
                  className={`cursor-pointer rounded-md ${gender === (gend as Gender) ? 'bg-slate-700 text-white' : ''} font-medium ${theme === 'light' ? 'bg-slate-300' : 'bg-slate-500'} p-1 hover:opacity-90 active:opacity-100 transition-all`}
                  onClick={() => setUserDetails(prev => ({ ...prev, gender: gend  as Gender }))}
                >{gend}</p>
              ))
            }
          </div>
        </div>

        <div className='flex flex-col md:flex-row mobile:w-full w-7/12 md:w-4/6 p-2 gap-y-2 gap-x-2'> 
          <InputField title='Username'
            name='username' placeholder='username' inputType='name' theme={theme} 
            value={username as string || ''} handleChange={handleChange}
          />
          <InputField title='Country'
            name='country' placeholder='country' inputType='text' theme={theme} 
            value={country as string || ''} handleChange={handleChange}
          />
        </div>

        <div className='flex flex-col gap-1 p-2 mobile:w-full w-7/12 md:w-4/6'>
          <h3 className='text-base font-medium'>Description</h3>
          <div className={`rounded-sm border ${theme === 'light' ? 'border-gray-300' : 'border-gray-100'} w-full h-20`}>
            <textarea 
              name='description'
              value={description || ''}
              placeholder='About me'
              maxLength={MAX_DESCRIPTION_LENGTH}
              rows={14}
              onChange={event => setUserDetails(prev => ({...prev, description: event?.target.value}))}
              className={`w-full text-black px-2 py-1 h-full border-none focus:outline-none placeholder:text-gray-600 rounded-sm`}
            />
          </div>
          <span className='self-end font-medium'>{MAX_DESCRIPTION_LENGTH - (description as string)?.length || 0}</span>
        </div>

        <div className='flex flex-col mobile:w-full w-7/12 md:w-4/6 px-2 gap-y-2 gap-x-2'>
          <div className='flex items-center gap-4 w-fit'>
            <h3 className='text-base font-medium'>Change password</h3>
            <input 
              type="checkbox" 
              checked={checked}
              onChange={e => setChecked(e.target.checked)}
              className={`focus:outline-none rounded-sm shadow-sm w-4 h-3.5 cursor-pointer`}
            />
          </div>

          <div 
            onKeyUpCapture={event => event.key === 'Enter' ? getConfirmation() : null}
            className={`relative ${(checked && !isSuccess) ? 'flex scale-1' : 'scale-0 hidden'} transition-all flex items-center gap-0.5`}>
            <InputField title='Current password'
              name='oldPassword' placeholder='current password' 
              value={currentPassword || ''} handleChange={handleCurrent}
              inputType={reveal === 'Hide' ? 'password' : 'text'} theme={theme} 
            />
            <button 
              disabled={!currentPassword && !isLoadingConfirmation}
              onClick={getConfirmation}
              className={`relative p-1 px-3 mt-6 h-10 w-16 rounded-sm shadow-md hover:opacity-95 active:opacity-100 focus:outline-none border-none ${isLoadingConfirmation ? 'cursor-not-allowed' : 'cursor-pointer'} ${(currentPassword && !isLoadingConfirmation) ? 'bg-green-600 hover:bg-green-500 transition-all' : 'bg-gray-400'} z-20 transition-all`}
            >
              {isLoadingConfirmation ? <IsLoadingSpinner page='EDIT_PROFILE' /> : 'Send'}
            </button>
            <span 
              onClick={() => setReveal(prev => prev === 'Hide' ? prev = 'Open' : 'Hide')}
              className='absolute top-9 right-16 text-black font-medium underline cursor-pointer hover:opacity-90 transition-all active:opacity-100 text-xs z-20'>{reveal === 'Hide' ? 'show' : 'Hide'}</span>
            <p className={`absolute ${(errorMsg  || isSuccess) ? 'scale-1' : 'scale-0 hidden'} transition-all bottom-[-22px] text-xs font-medium w-[81%] rounded-sm capitalize ${isSuccess ? 'text-green-500 bg-gray-100' : 'text-red-500 bg-gray-300'} py-0.5 p-1 text-center`}>{isSuccess ? 'Successfully Verified' : errorMsg}</p>
          </div>

          <div className={`${(isSuccess && checked) ? 'flex scale-1' : 'scale-0 hidden'} transition-all flex-col md:flex-row w-full gap-y-2 gap-x-2`}>
            <PasswordInput page='EDIT'
              password={password} match={match} handlePassword={handlePassword} 
              revealPassword={revealPassword} setRevealPassword={setRevealPassword} 
              handleConfirmPassword={handlePassword} confirmPassword={confirmPassword}
            />

            <button 
              role='submit update information'
              onClick={updateInfo}
              disabled={!validPassword && !match}
              className={`w-fit self-start text-sm ${isLoadingUserInfo ? 'cursor-not-allowed' : 'cursor-pointer'} rounded-sm p-1 py-2 font-medium focus:outline-none transition-all border-none ${(validPassword && match && !isLoadingUserInfo) ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-400'}`}
            >
              {!isLoadingUserInfo ? 'Update' : 'In progress...'}
            </button>

          </div>

        </div>
        
        <ArrayComponent 
          setPrevEntries={setPrevEntries}
          name='socialMediaEntry' name1='socialMediaName' placeholder1='Social media name' 
          addToArray={addToArray} inputRef={inputRef0} inputRef1={inputRef01} maxLetter={100}
          setArrayEntry={setArrayEntry}  userDetails={userDetails} arrayEntry={arrayEntry} max={3}
          removeFromArray={removeFromArray} scrollRef={scrollRef0 as React.LegacyRef<HTMLParagraphElement>}
          theme={theme} handleChange={handleChange} attributeName={socialMediaAccounts as SocialMediaAccoutProp[]}
          value={socialMediaEntry as Entries} value1={socialMediaName as ValueType} placeholder='Social media handle' 
        />

        <ArrayComponent 
          setPrevEntries={setPrevEntries}
          handleChange={handleChange} attributeName={hobbies as string[]} userDetails={userDetails}
          removeFromArray={removeFromArray} scrollRef={scrollRef1 as React.LegacyRef<HTMLParagraphElement>}
          name='hobbiesEntry' placeholder='Hobbies' value={hobbiesEntry as Entries} setArrayEntry={setArrayEntry}
          addToArray={addToArray} inputRef={inputRef1} maxLetter={20} max={5} theme={theme} arrayEntry={arrayEntry}
        />
        
        <ArrayComponent 
          setPrevEntries={setPrevEntries}
          addToArray={addToArray} inputRef={inputRef2} maxLetter={20} theme={theme} name='stackEntry' 
          handleChange={handleChange} attributeName={stack as string[]} setArrayEntry={setArrayEntry}
          removeFromArray={removeFromArray} scrollRef={scrollRef2 as React.LegacyRef<HTMLParagraphElement>}
          placeholder='Skills' value={stackEntry as Entries} max={10} userDetails={userDetails} arrayEntry={arrayEntry}
        />
        
        <div className='pt-2 pb-4 self-center w-full flex justify-center'>
          <button 
            role='submit update information'
            onClick={updateInfo}
            disabled={isLoadingUserInfo}
            className={`w-[95%] md:w-1/2 self-center ${isLoadingUserInfo ? 'cursor-not-allowed' : 'cursor-pointer'} rounded-sm p-2 py-3 font-medium focus:outline-none border-none ${!isLoadingUserInfo ? 'bg-green-600 hover:bg-green-500 duration-150' : 'bg-gray-400'}`}
          >
            {!isLoadingUserInfo ? 'Update' : 'Updating...'}
          </button>
        </div>

      </div>
  )
}