import { ChangeEvent } from "react";
import { Theme } from "../../posts";
import { InputField } from "./InputField";
import { FaTimesCircle } from "react-icons/fa";

type ArrayFieldType = {
  max: number,
  theme: Theme,
  name: string,
  value: string,
  hobbies: string[],
  maxLetter: number,
  placeholder: string,
  addToArray: (type: string) => void,
  inputRef?:  React.RefObject<HTMLInputElement>,
  scrollRef: React.LegacyRef<HTMLParagraphElement>,
  removeFromArray: (name: string, type: string) => void,
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void,
}

export const ArrayComponent = ({scrollRef, name, max, maxLetter, placeholder, value, theme, inputRef, handleChange, addToArray, removeFromArray, hobbies}: ArrayFieldType) => {

  return (
    <div 
      title='Press enter to enter more' 
      onKeyUpCapture={event => event.key === 'Enter' ? addToArray(name) : null}
      className='relative flex flex-col mobile:w-full w-7/12 md:w-4/6 p-2 gap-y-2 rounded-sm'> 
      <h3 className='text-base font-medium capitalize'>{placeholder} <span className='text-sm lowercase text-gray-500'>*max {max}</span></h3> 

      <div className={`hidebars flex items-center rounded-md ${hobbies?.length ? 'scale-1' : 'scale-0 hidden'} transition-all gap-1 w-fit max-w-full shadow-inner p-1 shadow-slate-600 overflow-x-scroll`}>
        {
          hobbies?.map(hobby => (
            <p 
              key={hobby}
              ref={scrollRef as React.LegacyRef<HTMLParagraphElement>}
              className={`whitespace-nowrap rounded-md shadow-md p-0.5 border flex items-center gap-1 ${theme === 'light' ? 'bg-gray-400' : ''}`}>
              {hobby}
              <FaTimesCircle 
                onClick={() => removeFromArray(hobby, name)}
                className='cursor-pointer hover:opacity-90 active:opacity-100 transition-all' />
            </p>
          ))
        }
      </div>

      <InputField title=''
        name={name} placeholder={placeholder} inputType='text' theme={theme} 
        value={value || ''} handleChange={handleChange} refVal={inputRef} maxLetter={maxLetter}
      />

      <button 
        onClick={() => addToArray(name)}
        className={`absolute p-1 px-3 rounded-tr-sm rounded-br-sm font-medium h-10 w-12 right-2 bottom-2 rounded-sm shadow-md hover:opacity-95 active:opacity-100 focus:outline-none border-none ${value?.length ? 'bg-green-600 hover:bg-green-500 duration-150' : 'bg-gray-500'} z-20 transition-all`}
      >
        Add
      </button>

    </div>
  )
}