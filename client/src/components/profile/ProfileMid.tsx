import { useState } from 'react';
import { UserProps } from '../../data';
import { Link } from 'react-router-dom';
import { MdAttachEmail } from 'react-icons/md';
import { ImageTypeProp, Theme } from '../../posts';
import { FaGithub, FaTwitterSquare } from 'react-icons/fa';
import { checkCount, reduceLength } from '../../utils/navigator';

type Props = {
  theme: Theme,
  userId: string,
  userProfile: UserProps,
  setRevealEditModal: React.Dispatch<React.SetStateAction<ImageTypeProp>>
}

export default function ProfileMid({ userId, userProfile, setRevealEditModal, theme }: Props) {
  const [showAll, setShowAll] = useState<boolean>(false)
  const currentUserId = localStorage.getItem('revolving_userId') as string

  return (
    <div 
      role="user information" 
      onClick={() => setRevealEditModal('NIL')}
      className="relative flex py-2 pt-3 md:mt-0 mt-16 flex-col w-full">
      {
        <>
          <article className="flex items-center justify-between w-full md:flex-wrap lg:flex-nowrap">

            <div className="flex flex-col gap-1 w-full flex-auto">

              <div className={`${userProfile?.firstName ? 'flex' : 'flex'} flex-col gap-1.5 mb-2`}>

                <div className='flex items-center gap-2'>
                  <p className={`${theme === 'light' ? 'text-gray-900' : 'text-gray-300'}`}>Name:</p>
                  <p className="font-medium capitalize cursor-pointer whitespace-pre-wrap tracking-wide">
                    {reduceLength(userProfile?.firstName as string, 20, 'letter')}&nbsp;
                    {reduceLength(userProfile?.lastName as string, 20, 'letter')}
                  </p>
                </div>

                <div className='flex items-center gap-5 capitalize'>
                  <Link to={`/follows/${userId}`}>
                    <p className='opacity-90 hover:underline underline-offset-2'>followers: &nbsp;<span className='opacity-100'>{checkCount(userProfile?.followers as string[])}</span></p>
                  </Link>
                  <Link to={`/follows/${userId}`}>
                    <p className='opacity-90 hover:underline underline-offset-2'>followings: &nbsp;<span className='opacity-100'>{checkCount(userProfile?.followings as string[])}</span></p>
                  </Link>
                </div>

              </div>
              
              <a 
                href="mailto:email" target='_blank'
                className={`flex items-center gap-1.5 text-blue-600 hover:underline w-fit`}
              >
                <MdAttachEmail className={`${theme === 'light' ? 'text-gray-800' : 'text-gray-400'} text-lg`} />
                itsoluwatobby@gmail.com
              </a>
              <a 
                href="https://github.com/itsoluwatobby" target='_blank'
                className={`flex items-center gap-1.5 text-blue-600 hover:underline w-fit`}
              >
                <FaGithub className={`${theme === 'light' ? 'text-gray-800' : 'text-gray-400'} text-lg`} />
                github.com/itsoluwatobby
              </a>
              <a 
                href="https://twitter.com/itsoluwatobby" target='_blank'
                className={`flex items-center gap-1.5 text-blue-500 hover:underline w-fit`}
              >
                <FaTwitterSquare className={`${theme === 'light' ? 'text-gray-800' : 'text-gray-400'} text-lg`} />
                twitter.com/itsoluwatobby
              </a>

            </div>

            <div className={`flex-none w-[20%] md:translate-x-7 lg:translate-x-0 md:mt-6 lg:mt-0 ${userProfile?.stack?.length ? 'flex' : 'hidden'} items-center flex-col gap-3 mobile:-translate-x-5`}>

              <Link to={`/subscriptions/${userProfile?._id}`} 
                className={`${userId === currentUserId ? 'block' : 'hidden'}`}>
                <button 
                  className={`p-1 px-1.5 mobile:line-clamp-6 rounded-sm shadow-md border-none hover:opacity-95 active:opacity-100 focus:outline-none ${theme === 'light' ? 'bg-slate-500 text-white' : 'bg-slate-600'} transition-all`}
                >
                  subcriptions
                </button>
              </Link>

              <div className='flex flex-col gap-2 md:pl-2'>
                <p className={`uppercase text-center ${theme === 'light' ? 'text-gray-800' : 'text-gray-300'} font-semibold font-mono`}>Skills</p>
                <div className={`stackflow overflow-y-scroll h-12 p-1 py-1.5 px-2 w-fit text-sm overflow-x-scroll max-w-[120px] last:border-b-0 text-white whitespace-nowrap font-serif font-light ${theme === 'light' ? 'bg-slate-600' : 'bg-slate-900'} rounded-md`}>
                  {
                    userProfile?.stack?.map(skill => (
                      <p 
                        key={skill}
                        className="rounded-md hover:opacity-80 tracking-wide capitalize transition-all cursor-default">
                          {skill}
                      </p>
                    ))
                  }
                </div>
              </div>

            </div>

          </article>

          <div className={`${userProfile?.hobbies?.length ? 'flex' : 'hidden'} py-2 lg:mt-6 flex-col`}>
            <p>Hobbies:</p>
            <div className='flex items-center gap-2 flex-wrap'>
              {
                userProfile?.hobbies?.map(hobby => (
                  <p 
                    key={hobby}
                    className={`hidebars rounded-md hover:opacity-90 tracking-wide capitalize transition-all ${theme === 'light' ? 'bg-slate-300' : 'bg-slate-500'} overflow-x-scroll px-2 cursor-default`}>
                      {hobby}
                  </p>
                ))
              }
            </div>
          </div>

          <div className={`${userProfile?.description ? 'flex' : 'hidden'} flex-col mt-1 lg:mt-2 md:mt-1 w-full`}>
            <p className={`${theme === 'light' ? 'text-gray-900' : 'text-gray-300'} underline underline-offset-2`}>
              About: 
            </p>
            <p 
              onDoubleClick={() => setShowAll(prev => !prev)}
              className="text-justify cursor-pointer w-full whitespace-pre-wrap tracking-wide first-letter:text-lg transition-all">
              {showAll ? userProfile?.description : reduceLength(userProfile?.description, 50, 'word')}
            </p>
          </div>
      {/* 
          <div className="absolute h-full w-68 bg-white bottom-0 rounded-lg">
            <iframe 
              title="output"
              src="https://www.google.com"
              sandbox="allow-scripts"
              allow-origin="*"
              frameBorder={0}
              width='100%'
              height='100%'
              className="rounded-lg"
            />
          </div>  */}
        </>
      }
    </div>
  )
}