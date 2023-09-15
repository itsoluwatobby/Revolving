import { Theme } from "../../posts";
import { ChangeEvent } from 'react';

type InputFieldName = {
  theme: Theme,
  name: string,
  value: string,
  title: string,
  inputType: string,
  maxLetter?: number,
  placeholder: string,
  refVal?:  React.RefObject<HTMLInputElement>
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void,
}

export const InputField = ({ title, refVal, name, maxLetter, value, theme, handleChange, inputType, placeholder }: InputFieldName) => {

  return (
    <div className='flex flex-col gap-1 w-full'>
      <h3 className='text-sm font-medium opacity-95 w-fit'>{title}</h3>
      <div className={`rounded-sm border ${theme === 'light' ? 'border-gray-300' : 'border-gray-100'} w-full h-10`}>
        <input 
          type={inputType} name={name} 
          ref={refVal}
          maxLength={maxLetter}
          value={value} placeholder={placeholder} 
          onChange={handleChange}
          autoComplete="off"
          className={`w-full px-2 ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-100'} text-black py-1 h-full border-none focus:outline-none placeholder:text-gray-600 rounded-sm`}
        />
      </div>
    </div>
  )
}