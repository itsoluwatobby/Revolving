import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import OTPComp from '../components/OTPComp';
import { SuccessStyle } from '../utils/navigator';
import { ThemeContextType } from '../types/posts';
import { ErrorResponse, OTPPURPOSE } from '../types/data';
import { useThemeContext } from '../hooks/useThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useConfirmOTPMutation } from '../app/api/authApiSlice';

const initialState = { 
  entry1: '', entry2: '', entry3: '', entry4: '', entry5: '', entry6: ''
}
export const OTPEntry = () => {
  const {search} = useLocation()
  const result = search?.split('&')
  const [email, purpose] = [result[0].split('=')[1], result[1].split('=')[1]]
  const { theme } = useThemeContext() as ThemeContextType
  const [otp, setOtp] = useState<Partial<typeof initialState>>(initialState)
  const [confirmOTP, { isLoading, isSuccess, isUninitialized }] = useConfirmOTPMutation()
  const navigate = useNavigate()
  const option = ['ACCOUNT', 'PASSWORD']
  const canMakeRequest = [...Object.values(otp)].every(Boolean)

console.log({canMakeRequest})
console.log({otp})

  // useEffect(() => {
  //   let isMounted = true
  //   const option = ['ACCOUNT', 'PASSWORD']
  //   const validateOTP = async() => {
  //     if(!option.includes(purpose)) return navigate('/signIn')
  //     if(isLoading || !canMakeRequest) return
  //     try{
  //       const verificationCode = [...Object.values(otp)].join('')
  //       const res = await confirmOTP({
  //         email, otp: verificationCode, purpose: purpose as Exclude<OTPPURPOSE, 'OTHERS'>
  //       }).unwrap()
  //       toast.success(res?.meta?.message, SuccessStyle)
  //       setTimeout(() => {
  //         setOtp(initialState)
  //         purpose === 'ACCOUNT' ? navigate('/signIn') : null
  //       }, 5000)
  //     }
  //     catch(err){
  //       setOtp(initialState)
  //       const errors = err as ErrorResponse
  //       toast.error(`${errors?.status == 'FETCH_ERROR' ? 'SERVER ERROR' : errors?.data?.meta?.message}`, {
  //         duration: 10000, icon: '💀', style: {
  //           background: errors?.status == 403 ? '#FF6600' : '#FF0000',
  //           color: '#FFFFFF'
  //         }
  //       })
  //     }
  //   }
  //   if(isMounted && canMakeRequest) validateOTP()
  //   return () => {
  //     isMounted = false
  //   }
  // }, [canMakeRequest, otp, isLoading, purpose, navigate, confirmOTP, email])

  const validateOTP = async() => {
    if(!option.includes(purpose)) return navigate('/signIn')
    if(isLoading || !canMakeRequest) return
    try{
      const verificationCode = [...Object.values(otp)].join('')
      const res = await confirmOTP({
        email, otp: verificationCode, purpose: purpose as Exclude<OTPPURPOSE, 'OTHERS'>
      }).unwrap()
      toast.success(res?.meta?.message, SuccessStyle)
      setTimeout(() => {
        setOtp(initialState)
        return purpose === 'ACCOUNT' ? navigate('/signIn') : navigate(`/new_password?email=${email}`)
      }, 5000)
    }
    catch(err){
      setOtp(initialState)
      const errors = err as ErrorResponse
      toast.error(`${errors?.status == 'FETCH_ERROR' ? 'SERVER ERROR' : errors?.data?.meta?.message}`, {
        duration: 10000, icon: '💀', style: {
          background: errors?.status == 403 ? '#FF6600' : '#FF0000',
          color: '#FFFFFF'
        }
      })
    }
  }

  useEffect(() => {
    let isMounted = true
    if(isMounted && canMakeRequest) validateOTP()
    return () => {
      isMounted = false
    }
  }, [canMakeRequest])

  return (
    <section className={`welcome w-full flex justify-center ${theme == 'light' ? 'bg-slate-200' : ''}`}>
      <OTPComp accountAuthenticationPage 
        subject='to verify your account' purpose={purpose as Exclude<OTPPURPOSE, 'OTHERS'>}
        otp={otp} setOtp={setOtp} isLoading={isLoading} email={email}
        isSuccess={isSuccess} isUninitialized={isUninitialized}
      />
    </section>
  )
}
