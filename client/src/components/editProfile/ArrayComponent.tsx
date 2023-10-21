import { ChangeEvent } from "react";
import { Theme } from "../../types/posts";
import { InputField } from "./InputField";
import { FaTimes, FaTimesCircle } from "react-icons/fa";
import { Entries, InitEntriesType, InitPrevEntriesType, SocialMediaAccoutProp, UserProps, ValueType } from "../../types/data";

type ArrayFieldType = {
  max: number,
  theme: Theme,
  name: Entries,
  value: Entries,
  maxLetter: number,
  name1?: ValueType,
  value1?: ValueType,
  userDetails: Partial<UserProps>,
  arrayEntry: InitEntriesType,
  placeholder1?: 'Social media name',
  addToArray: (type: Entries) => void,
  inputRef?:  React.RefObject<HTMLInputElement>,
  inputRef1?:  React.RefObject<HTMLInputElement>,
  scrollRef: React.LegacyRef<HTMLParagraphElement>,
  attributeName: string[] | SocialMediaAccoutProp[],
  removeFromArray: (name: string, type: Entries) => void,
  placeholder: 'Social media handle' | 'Hobbies' | 'Skills',
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void,
  setArrayEntry: React.Dispatch<React.SetStateAction<InitEntriesType>>,
  setPrevEntries: React.Dispatch<React.SetStateAction<InitPrevEntriesType>>
}

export const ArrayComponent = ({ scrollRef, name, name1, max, maxLetter, placeholder, placeholder1, value, value1, userDetails, theme, inputRef, inputRef1, arrayEntry, handleChange, addToArray, removeFromArray, attributeName, setArrayEntry, setPrevEntries }: ArrayFieldType) => {

  const { hobbiesEntry, socialMediaName, stackEntry } = arrayEntry

  const editEntry = (type: Entries, name: string) => {
    if(type === 'hobbiesEntry') {
      setPrevEntries(prev => ({...prev, prevHobby: name}))
      setArrayEntry(prev => ({...prev, hobbiesEntry: userDetails?.hobbies?.find(hob => hob.toLowerCase() === name?.toLowerCase()) as string}))
    }
    else if(type === 'stackEntry') {
      setPrevEntries(prev => ({...prev, prevStack: name}))
      setArrayEntry(prev => ({...prev, stackEntry: userDetails?.stack?.find(skill => skill.toLowerCase() === name?.toLowerCase()) as string}))
    }
    else if(type === 'socialMediaEntry') {
      setPrevEntries(prev => ({...prev, prevSocialName: name}))
      const media = userDetails?.socialMediaAccounts?.find(med => med?.name?.toLowerCase() === name?.toLowerCase())
      setArrayEntry(prev => ({...prev, socialMediaName: media?.name as string, socialMediaEntry: media?.link as string }))
    }
  }

  return (
    <div 
      title='Press enter to enter more' 
      onKeyUpCapture={event => event.key === 'Enter' ? addToArray(name) : null}
      className='relative flex flex-col mobile:w-full w-7/12 md:w-4/6 p-2 gap-y-2 rounded-sm'> 
      <h3 className='text-base font-medium capitalize'>{placeholder} <span className='text-sm lowercase text-gray-500'>*max {max}</span></h3> 

      <div className={`hidebars flex items-center rounded-md ${attributeName?.length ? 'scale-1' : 'scale-0 hidden'} transition-all gap-1 w-fit max-w-full shadow-inner p-1 shadow-slate-600 overflow-x-scroll`}>
        {
          name !== 'socialMediaEntry' ?
          (attributeName as string[])?.map(attribute => (
            <div 
              key={attribute}
              ref={scrollRef as React.LegacyRef<HTMLParagraphElement>}
              className={`whitespace-nowrap rounded-md ${name === 'stackEntry' ? (attribute === stackEntry ? 'opacity-70' : '') : (attribute === hobbiesEntry ? 'opacity-70' : '')} shadow-md p-0.5 border flex items-center gap-1 ${theme === 'light' ? 'bg-gray-400' : ''}`}>
              <span 
                title="Edit" 
                onClick={() => editEntry(name, attribute)}
                className="cursor-default">{attribute}</span>
              <FaTimesCircle 
                onClick={() => removeFromArray(attribute, name)}
                className='cursor-pointer hover:opacity-90 active:opacity-100 transition-all' />
            </div>
          ))
          :
          (attributeName as SocialMediaAccoutProp[])?.map(attribute => (
            <div 
              key={attribute?.name}
              ref={scrollRef as React.LegacyRef<HTMLParagraphElement>}
              className={`hidebars relative whitespace-nowrap ${attribute?.name === socialMediaName ? 'opacity-70' : ''} rounded-md max-w-[8rem] overflow-x-scroll shadow-md px-1 border flex items-center gap-1 ${theme === 'light' ? 'bg-gray-300' : ''}`}
            >
              <p className="flex flex-col">
                <span 
                  title="Edit"
                  onClick={() => editEntry(name, attribute?.name)}
                  className="font-medium capitalize text-center cursor-default">{attribute?.name}</span>
                <a href={attribute?.link} target="_blank" 
                  title="Confirm link"
                  className="text-xs underline underline-offset-1 cursor-pointer hover:opacity-90 transition-all">{attribute?.link}</a>
              </p>
              <button 
                onClick={() => removeFromArray(attribute?.name, name)}
                className="absolute right-0 rounded-sm bg-black w-4 h-3.5 grid place-content-center"
              >
                <FaTimes 
                  className='cursor-pointer text-xs text-white hover:opacity-90 active:opacity-100 transition-all' />
              </button>
            </div>
          ))
        }
      </div>

      {
        name === 'socialMediaEntry' ?
        <InputField title=''
          name={name1 as string} placeholder={placeholder1 as string} inputType='text' theme={theme} 
          value={value1 || ''} handleChange={handleChange} refVal={inputRef1} maxLetter={maxLetter}
          />
        :null
      }
      <InputField title=''
        name={name} placeholder={placeholder} inputType='text' theme={theme} 
        value={value || ''} handleChange={handleChange} refVal={inputRef} maxLetter={maxLetter}
      />

      <button 
        onClick={() => addToArray(name)}
        className={`absolute p-1 px-3 rounded-tr-sm rounded-br-sm font-medium h-10 w-12 right-2 bottom-2 rounded-sm shadow-md hover:opacity-95 active:opacity-100 focus:outline-none border-none ${(name === 'socialMediaEntry' || name1 === 'socialMediaName') ? ((value?.length && value1?.length) ? 'bg-green-600 hover:bg-green-500 duration-150' : 'bg-gray-500') : (value?.length ? 'bg-green-600 hover:bg-green-500 duration-150' : 'bg-gray-500')} z-20 transition-all`}
      >
        Add
      </button>

    </div>
  )
}