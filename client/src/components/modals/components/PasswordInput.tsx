import { BsCheck } from 'react-icons/bs';
import { FaTimes } from 'react-icons/fa';
import PasswordChecker from './PasswordChecker';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { TimeoutId } from '@reduxjs/toolkit/dist/query/core/buildMiddleware/types';

type PasswordCompoProps = {
  page?: 'EDIT',
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
  handleConfirmPassword, confirmPassword, match, page
}: PasswordCompoProps) {
  const [correct, setCorrect] = useState(true);

  useEffect(() => {
    let timerId: TimeoutId;
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
      <div className='flex flex-col w-full'>

        <div className={`relative flex flex-col w-full ${page === 'EDIT' ? '' : 'p-2'} pt-0 pb-0 gap-0.5`}>
          <label htmlFor='password' className='flex items-center gap-2 font-medium text-sm'>
            {page === 'EDIT' ? 'New password' : 'Password'}
            {password && (passwordRegex.test(password) ? <BsCheck className='text-green-600 text-2xl'/> : <FaTimes className='ml-1 text-red-500' />)}
          </label>
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
              className={`relative w-full rounded-sm p-1.5 ${page === 'EDIT' ? 'bg-gray-100 border border-gray-300' : 'border-none'} focus:outline-none text-black`}
            />
            {
              revealPassword ? 
                <AiFillEye 
                  title='Hide' 
                  onClick={() => setRevealPassword(false)}
                  className={`absolute cursor-pointer hover:opacity-90 text-slate-700 right-2 duration-100 bottom-2 text-2xl`} /> 
                    : <AiFillEyeInvisible 
                        title='Show' 
                        onClick={() => setRevealPassword(true)}
                        className={`absolute cursor-pointer hover:opacity-90 text-slate-700 right-2 duration-100 bottom-2 text-2xl`} />
            }
        </div>

        {(password && correct) ? <PasswordChecker password={password} /> : null}

      </div>

      <div className={`relative flex flex-col w-full ${page === 'EDIT' ? 'mt-1' : 'p-2'} pt-0 pb-0 gap-0.5`}>
        <label htmlFor='confirm-pwd' className='flex items-center gap-2 font-medium text-sm'>
          Confirm password
          {!confirmPassword ? null : match ? <BsCheck className='text-green-600 text-2xl'/> : <FaTimes className='text-red-600' />}
        </label>
          <input 
            type={revealPassword ? "text" : "password"} 
            value={confirmPassword}
            id='confirm-pwd'
            name='confirmPassword'
            required
            placeholder='*************'
            autoComplete='off'
            onChange={handleConfirmPassword}
            className={`relative w-full rounded-sm p-1.5 focus:outline-none ${page === 'EDIT' ? 'bg-gray-100 border border-gray-300' : 'border-none'} text-black`}
          />
      </div>
    </>
  )
}