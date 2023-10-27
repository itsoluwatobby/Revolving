import { toast } from 'react-hot-toast';
import { BsCheck } from 'react-icons/bs';
import { FaTimes } from 'react-icons/fa';
import { ThemeContextType } from '../types/posts';
import { SuccessStyle } from '../utils/navigator';
import { IsLoadingSpinner } from './IsLoadingSpinner';
import { useThemeContext } from '../hooks/useThemeContext';
import { useGenerateOTPMutation } from '../app/api/authApiSlice';
import { DataType, ErrorResponse, OTPPURPOSE } from '../types/data';
import React, { useEffect, useRef, useState, ChangeEvent } from 'react';

const initialState = { 
  entry1: '', entry2: '', entry3: '', entry4: '', entry5: '', entry6: ''
}

type OTPProps = {
  subject: string,
  otp: Partial<typeof initialState>,
  setOtp: React.Dispatch<React.SetStateAction<Partial<typeof initialState>>>,
  accountAuthenticationPage?: boolean
  isLoading: boolean,
  isSuccess: boolean,
  isUninitialized: boolean,
  email: string,
  purpose: Exclude<OTPPURPOSE, 'OTHERS'>
}
type ModeType = 'EMAIL' | 'DIRECT'

export default function OTPComp({ subject, otp, setOtp, accountAuthenticationPage, isLoading, isSuccess, isUninitialized, email, purpose }: OTPProps) {
  const { theme } = useThemeContext() as ThemeContextType
  const [mailMode, setMailMode] = useState<ModeType>('EMAIL')
  const [result, setResult] = useState<DataType | undefined>(undefined)
  const [ref1, ref2, ref3, ref4, ref5, ref6] = [useRef<HTMLInputElement>(), useRef<HTMLInputElement>(), useRef<HTMLInputElement>(), useRef<HTMLInputElement>(), useRef<HTMLInputElement>(), useRef<HTMLInputElement>()]
  const [generateOTP, {isLoading: isGenerateLoading, isError: isGenerateError}] = useGenerateOTPMutation()
  const {entry1, entry2, entry3, entry4, entry5, entry6} = otp

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name
    const value = event.target.value
    setOtp(prev => ({...prev, [name]: value}))
  }

  useEffect(() => {
    if(ref1?.current && entry1?.length == 0) ref1?.current.focus()
    else if(ref2?.current && entry2?.length == 0) ref2?.current.focus()
    else if(ref3?.current && entry3?.length == 0) ref3?.current.focus()
    else if(ref4?.current && entry4?.length == 0) ref4?.current.focus()
    else if(accountAuthenticationPage){
      if(ref5?.current && entry5?.length == 0) ref5?.current.focus()
      else if(ref6?.current && entry6?.length == 0) ref6?.current.focus()
    }
  }, [ref1, ref2, ref3, ref4, ref5, ref6, entry1, entry2, entry3, entry4, entry5, entry6, accountAuthenticationPage])

  useEffect(() =>  {
    let isMounted = true
    if(isMounted && result?.otp){
      const { otp } = result
      setOtp({ entry1: otp[0], entry2: otp[1], entry3: otp[2], entry4: otp[3], entry5: otp[4], entry6: otp[5] })
    }
    return () => {
      isMounted = false
    }
  }, [result, setOtp])

  const resendLink = async() => {
    try{
      const res = await generateOTP({email, length: 6, option: mailMode, purpose }).unwrap()
      setResult(res?.data)
      if(mailMode === 'EMAIL') ref1?.current?.focus()
      toast.success(res?.meta?.message, SuccessStyle)
    }
    catch(err){
      const errors = err as ErrorResponse
        isGenerateError && toast.error(`${errors?.status == 'FETCH_ERROR' ? 'Please Check Your Network' : errors?.data?.meta?.message}`, {
          duration: 10000, icon: '💀', style: {
            background: errors?.status == 403 ? 'A6BCE2' : '#FF0000',
            color: '#FFFFFF'
          }
        })
    }
  }

  return (
    <article className={`absolute md:w-1/4 w-1/2 maxscreen:w-[60%] mobile:w-[85%]  p-2 border flex flex-col gap-2 shadow-2xl text-white ${theme == 'light' ? 'bg-gradient-to-r  from-indigo-600 via-purple-900 to-pink-500 shadow-zinc-800' : 'dark:bg-gradient-to-r dark:from-slate-800 dark:via-slate-900 dark:to-slate-700 shadow-zinc-700'} translate-y-12 z-10 rounded-md`}>
      <div className=''>
        <p className='text-2xl font-medium first-letter:text-3xl'>Enter OTP</p>
        <p className='capitalize'>{subject}</p>
      </div>

      <div className={`relative self-center flex items-center flex-wrap p-4 gap-1.5 mx-auto`}>
        <OTPInput 
          refs={ref1 as React.MutableRefObject<HTMLInputElement>} 
          name='entry1' otps={entry1 as string} handleChange={handleChange} 
        />
        <OTPInput 
          refs={ref2 as React.MutableRefObject<HTMLInputElement>} 
          name='entry2' otps={entry2 as string} handleChange={handleChange} 
        />
        <OTPInput 
          refs={ref3 as React.MutableRefObject<HTMLInputElement>} 
          name='entry3' otps={entry3 as string} handleChange={handleChange} 
        />
        <OTPInput 
          refs={ref4 as React.MutableRefObject<HTMLInputElement>} 
          name='entry4' otps={entry4 as string} handleChange={handleChange} 
        />
        {accountAuthenticationPage ?
          <>
            <OTPInput 
              refs={ref5 as React.MutableRefObject<HTMLInputElement>} 
              name='entry5' otps={entry5 as string} handleChange={handleChange} 
            />
            <OTPInput 
              refs={ref6 as React.MutableRefObject<HTMLInputElement>} 
              name='entry6' otps={entry6 as string} handleChange={handleChange} 
            />
          </>
          : null
        }
        {isLoading ?
          <IsLoadingSpinner customSize='NORMAL' />
          :
          <div className='absolute -right-2 grid place-content-center'>
            {
              (!isUninitialized && !isLoading) ? (
                isSuccess ?
                  <BsCheck className='text-3xl text-green-400' />
                  :
                  <FaTimes className={`text-xl ${theme === 'light' ? 'text-red-50' : 'text-red-500'}`} 
                  />
                ) : null
            }
          </div>
        }
      </div>
      <div className='relative flex justify-between items-center px-1'>
        <div className={`w-12 h-6 mobile:h-6 mobile:w-16 flex items-center transition-all p-0.5 ${mailMode === 'EMAIL' ? '' : 'bg-slate-900'} shadow-inner shadow-slate-950 rounded-full`}>
          <button 
            title={mailMode === 'EMAIL' ? 'Send to Email' : 'Insert Automatically'}
            onClick={() => setMailMode(prev => prev === 'EMAIL' ? prev = 'DIRECT' : prev = 'EMAIL')}
            className={`focus:outline-none border-none shadow-lg ${mailMode === 'EMAIL' ? 'bg-slate-200 translate-x-0' : 'bg-green-500 translate-x-6 mobile:translate-x-8'} duration-300 rounded-full h-full w-1/2 hover:opacity-90 transition-all`} 
          />
        </div>
        
        <span className={`absolute ${mailMode === 'DIRECT' ? 'scale-100' : 'scale-0'} italic font-medium font-mono transition-all left-[4rem] mobile:left-[5rem] text-[13px] underline underline-offset-2`}>insert</span>
        
        <button 
          disabled={isGenerateLoading}
          onClick={resendLink}
          className={`relative ${isGenerateLoading ? 'opacity-50' : ''} text-sm underline hover:opacity-90 active:opacity-100`}>
          request new otp
          <div className={`absolute top-1 right-10 ${isGenerateLoading ? 'block' : 'hidden'}`}>
            <IsLoadingSpinner customSize='NORMAL' />
          </div>
        </button>
      </div>
    </article>
  )
}

type OTPInputType = {
  refs: React.MutableRefObject<HTMLInputElement>,
  otps: string,
  name: string,
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void
}
const OTPInput = ({ refs, name, otps, handleChange }: OTPInputType) => {

  return (
    <input 
      type="numeric"
      ref={refs}
      name={name}
      maxLength={1}
      placeholder='0'
      autoComplete='off'
      value={otps} 
      onChange={handleChange}
      className='text-black placeholder:text-gray-300 font-bold text-center text-xl focus:outline-none border-none shadow-lg max-w-[32px] max-h-10 rounded-sm p-1'
    />
  )
}
