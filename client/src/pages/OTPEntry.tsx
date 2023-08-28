
import { toast } from 'react-hot-toast'
import OTPComp from '../components/OTPComp'
import { ErrorResponse } from '../data'
import { useThemeContext } from '../hooks/useThemeContext'
import { ThemeContextType } from '../posts'
import { useEffect, useState } from 'react'
import { useConfirmOTPMutation } from '../app/api/authApiSlice'
import { useNavigate, useLocation } from 'react-router-dom'
import { SuccessStyle } from '../utils/navigator'

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
        console.log(err)
        const errors = err as ErrorResponse
        isError && toast.error(`${errors?.status == 'FETCH_ERROR' ? 'Please Check Your Network' : errors?.data?.meta?.message}`, {
          duration: 10000, icon: '💀', style: {
            background: errors?.status == 403 ? 'A6BCE2' : '#FF0000',
            color: '#FFFFFF'
          }
        })
      }
    }
    (isMounted && canMakeRequest) ? activateAccount() : null
    return () => {
      isMounted = false
    }
  }, [canMakeRequest, otp, isError, navigate, confirmOTP, email])

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
