import React, { ChangeEvent, useEffect, useState } from 'react'
import PasswordChecker from './PasswordChecker'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { BsCheck } from 'react-icons/bs';
import { FaTimes } from 'react-icons/fa';

type PasswordCompoProps = {
  match: boolean,
  password: string, 
  revealPassword: boolean, 
  confirmPassword: string, 
  setRevealPassword: React.Dispatch<React.SetStateAction<boolean>>, 
  handlePassword: (event: ChangeEvent<HTMLInputElement>) => void,
  handleConfirmPassword: (event: ChangeEvent<HTMLInputElement>) => void, 
}

export default function PasswordInput({
  revealPassword, setRevealPassword, password, handlePassword, 
  handleConfirmPassword, confirmPassword, match
}: PasswordCompoProps) {
  const [correct, setCorrect] = useState(true);

  useEffect(() => {
    let timerId: any = '';
    if(passwordRegex.test(password)){
      timerId = setTimeout(() => {
        setCorrect(false)
      }, 5000)
    }else{
      setCorrect(true)
    }
    return () => clearTimeout(timerId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password])
  
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!£%*?&])[A-Za-z\d@£$!%*?&]{9,}$/;

  return (
    <>
      <label htmlFor="password" className='relative'>
        <span className='flex items-center gap-2 font-medium text-sm'>
          Password
          {password && (passwordRegex.test(password) ? <BsCheck className='text-green-600 text-2xl'/> : <FaTimes className='ml-1 text-red-500' />)}
        </span>
          <input 
            type={revealPassword ? "text" : "password"} 
            value={password}
            id='password'
            name='password'
            required
            min={7}
            placeholder='*************'
            autoComplete='off'
            onChange={handlePassword}
            className='relative w-full rounded-md p-1.5 focus:outline-none border-none text-black'
          />
          {
            revealPassword ? 
              <AiFillEye 
                title='Show' 
                onClick={() => setRevealPassword(false)}
                className={`absolute cursor-pointer hover:opacity-90 text-slate-700 right-2 duration-100 bottom-2 text-2xl`} /> 
                  : <AiFillEyeInvisible 
                      title='Hide' 
                      onClick={() => setRevealPassword(true)}
                      className={`absolute cursor-pointer hover:opacity-90 text-slate-700 right-2 duration-100 bottom-2 text-2xl`} />
          }
      </label>
      {(password && correct) ? <PasswordChecker password={password} /> : null}
      <label htmlFor="confirm-pwd" className='relative'>
        <span className='flex items-center gap-2 font-medium text-sm'>
          Confirm password
          {!confirmPassword ? null : match ? <BsCheck className='text-green-600 text-2xl'/> : <FaTimes className='text-red-600' />}
        </span>
          <input 
            type={revealPassword ? "text" : "password"} 
            value={confirmPassword}
            id='confirm-pwd'
            name='confirm password'
            required
            placeholder='*************'
            autoComplete='off'
            onChange={handleConfirmPassword}
            className='relative w-full rounded-md p-1.5 focus:outline-none border-none text-black'
          />
      </label>
    </>
  )
}