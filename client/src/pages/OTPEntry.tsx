import { ErrorResponse } from '../data';
import { toast } from 'react-hot-toast';
import { ThemeContextType } from '../posts';
import { useEffect, useState } from 'react';
import OTPComp from '../components/OTPComp';
import { SuccessStyle } from '../utils/navigator';
import { useThemeContext } from '../hooks/useThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useConfirmOTPMutation } from '../app/api/authApiSlice';

const initialState = { 
  entry1: '', entry2: '', entry3: '', entry4: '', entry5: '', entry6: ''
}
export const OTPEntry = () => {
  const {search} = useLocation()
  const email = search?.split('=')[1]
  const { theme } = useThemeContext() as ThemeContextType
  const [otp, setOtp] = useState<Partial<typeof initialState>>(initialState)
  const [confirmOTP, { isLoading, isError, isSuccess, isUninitialized }] = useConfirmOTPMutation()
  const navigate = useNavigate()
  const canMakeRequest = [...Object.values(otp)].every(Boolean)

  useEffect(() => {
    let isMounted = true
    const activateAccount = async() => {
      if(isLoading) return
      try{
        const activationCode = [...Object.values(otp)].join('')
        const res = await confirmOTP({email, otp: activationCode, purpose: 'ACCOUNT'}).unwrap()
        toast.success(res?.meta?.message, SuccessStyle)
        setTimeout(() => {
          setOtp(initialState)
          navigate('/signIn')
        }, 5000)
      }
      catch(err){
        const errors = err as ErrorResponse
        setOtp(initialState)
        isError && toast.error(`${errors?.status == 'FETCH_ERROR' ? 'SERVER BUSY' : errors?.data?.meta?.message}`, {
          duration: 10000, icon: '💀', style: {
            background: errors?.status == 403 ? '#FF6600' : '#FF0000',
            color: '#FFFFFF'
          }
        })
      }
    }
    (isMounted && canMakeRequest && !isSuccess) ? activateAccount() : null
    return () => {
      isMounted = false
    }
  }, [canMakeRequest, otp, isLoading, isError, isSuccess, navigate, confirmOTP, email])

  return (
    <section className={`welcome w-full flex justify-center ${theme == 'light' ? 'bg-slate-200' : ''}`}>
      <OTPComp accountAuthenticationPage 
        subject='to verify your account' 
        otp={otp} setOtp={setOtp} isLoading={isLoading} email={email}
        isSuccess={isSuccess} isUninitialized={isUninitialized}
      />
    </section>
  )
}
