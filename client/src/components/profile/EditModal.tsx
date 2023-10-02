import { UserProps } from '../../data';
import React, { useState } from 'react';
import { RiEdit2Line } from 'react-icons/ri';
import { useParams } from 'react-router-dom';
import { ImageTypeProp, Theme } from '../../posts';

type EditModalProps = {
  theme: Theme,
  cover: 'COVER' | 'DP',
  userProfile: UserProps,
  hoverDp: ImageTypeProp,
  revealEditModal: ImageTypeProp,
  clearPhoto: (type: ImageTypeProp) => void,
  setRevealEditModal: React.Dispatch<React.SetStateAction<ImageTypeProp>>
}

export default function EditModal({ theme, cover, revealEditModal, hoverDp, userProfile, setRevealEditModal, clearPhoto }: EditModalProps) {
  const { userId } = useParams()
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const [toggler, setToggler] = useState<ImageTypeProp>('DP')
// "COVER" | "DP"
  const toggleModal = () => {
    setToggler(prev => (revealEditModal === 'COVER' ? prev = 'COVER' : revealEditModal === 'DP' ? prev = 'DP' : prev = 'NIL'))
    if(toggler === 'NIL') {
      setRevealEditModal('NIL')
      setToggler('DP')
    }
    else{
      setRevealEditModal(prev => (cover === 'COVER' ? prev = 'COVER' : cover === 'DP' ? prev = 'DP' : prev = 'NIL'))
    }
  }

  return (
    <>
      <div 
        onClick={toggleModal}
        className={`absolute ${theme === 'light' ? 'bg-gray-600' : 'bg-gray-900'} ${cover === 'COVER' ? 'w-14 h-6 bottom-1 left-1' : 'w-14 h-6 bottom-3 -right-4'} rounded-md rounded-tl-none rounded-br-none px-0.5 text-white ${ userId === currentUserId ? 'flex' : 'hidden'} gap-2 items-center cursor-pointer ${hoverDp === cover || revealEditModal === cover ? 'scale-[1.02]' : 'scale-0'} hover:bg-gray-800 active:bg-gray-950 transition-all`} >
        <RiEdit2Line className='text-lg' />
        <p className='text-base'>Edit</p>
      </div>
      
      {/* edit modal */}
      <div className={`absolute z-30 ${theme === 'light' ? 'bg-gray-500' : 'bg-gray-950'} w-fit rounded-md rounded-tl-none rounded-br-none text-white ${(cover === 'COVER' ? userProfile?.displayPicture?.coverPhoto :userProfile?.displayPicture?.photo) ? '-bottom-14' : '-bottom-8'} ${cover === 'COVER' ? 'left-1' : '-right-12'} ${revealEditModal === cover ? 'scale-[1.02]' : 'hidden scale-0'} transition-all`} >
        <div className={`relative p-[1px] rounded-md rounded-tl-none rounded-br-none z-30 flex flex-col w-full h-full ${theme === 'light' ? 'bg-gray-500' : 'bg-gray-900'}`}>
          <label htmlFor={`${cover === 'COVER' ? 'cover_photo' : 'profile_pic'}:${userProfile?._id}`} className='border border-gray-500 p-0.5 rounded-sm shadow-sm shadow-slate-600 hover:opacity-90 active:opacity-100 transition-all cursor-pointer text-sm'>{(cover === 'COVER' ? userProfile?.displayPicture?.coverPhoto :userProfile?.displayPicture?.photo) ? `Change ${cover === 'COVER' ? 'cover' : ''} photo` : `Add ${cover === 'COVER' ? 'cover' : ''} photo`}</label>
          <button 
            title='Remove photo' 
            onClick={() => clearPhoto(cover === 'COVER' ? 'COVER' : 'DP')}
            className={`border ${(cover === 'COVER' ? userProfile?.displayPicture?.coverPhoto :userProfile?.displayPicture?.photo) ? 'block' : 'hidden'} border-gray-500 p-0.5 rounded-sm shadow-sm shadow-slate-600 hover:opacity-80 active:opacity-100 transition-all`}>{`Delete ${cover === 'COVER' ? 'cover' : ''} photo`}</button>
        </div>
          <span className={`absolute -top-1 ${cover === 'COVER' ? 'left-5' : 'right-10'} h-3 w-3 rotate-45 ${theme === 'light' ? 'bg-gray-600' : 'bg-gray-950'}`}/>
      </div>
    </>
  )
}