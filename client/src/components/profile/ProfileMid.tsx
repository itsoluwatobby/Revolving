import { format } from 'timeago.js';
import { Link } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { MdAttachEmail } from 'react-icons/md';
import { ImageTypeProp, Theme } from '../../types/posts';
import FollowUnFollow from '../singlePost/FollowUnFollow';
import { Followers, Follows, UserProps } from '../../types/data';
import { checkCount, reduceLength } from '../../utils/navigator';
import { FaFacebookSquare, FaGithub, FaInstagramSquare, FaLinkedin, FaTwitterSquare } from 'react-icons/fa';

type Props = {
  theme: Theme,
  userId: string,
  userProfile: UserProps,
  setRevealEditModal: React.Dispatch<React.SetStateAction<ImageTypeProp>>
}

export default function ProfileMid({ userId, userProfile, setRevealEditModal, theme }: Props) {
  const [showAll, setShowAll] = useState<boolean>(false)
  const currentUserId = localStorage.getItem('revolving_userId') as string
  const ICONS = useCallback((classNames?: string): {[index: string]: JSX.Element} => {
    return (
      {
        "x": <FaTwitterSquare className={classNames}/>, 
        "github": <FaGithub className={classNames}/>, 
        "email": <MdAttachEmail className={classNames}/>,
        "linkedin": <FaLinkedin className={classNames}/>,
        "facebook": <FaFacebookSquare className={classNames}/>,
        "instagram": <FaInstagramSquare className={classNames}/>,
        "twitter": <FaTwitterSquare className={classNames}/>, 
      }
    )
  }, [])

  return (
    <div 
      role="user information" 
      onClick={() => setRevealEditModal('NIL')}
      className="relative flex py-2 pt-3 md:mt-0 mt-16 flex-col w-full">
      {
        <>
     
          <article className="flex justify-between w-full md:flex-wrap lg:flex-nowrap">
           
            <div className="flex-auto flex flex-col gap-1 w-full">
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
                    <p className='opacity-90 hover:underline underline-offset-2'>followers: &nbsp;<span className='opacity-100 font-medium'>{checkCount(userProfile?.followers as Followers[])}</span></p>
                  </Link>
                  <Link to={`/follows/${userId}`}>
                    <p className='opacity-90 hover:underline underline-offset-2'>followings: &nbsp;<span className='opacity-100 font-medium'>{checkCount(userProfile?.followings as Follows[])}</span></p>
                  </Link>

                </div>

                <div className='flex items-center gap-4'>
                  <p className='flex items-center text-[13px] gap-1 opacity-90'>
                    <span className='italic'>Joined</span>
                    <span className='opacity-100 font-medium'>{format(userProfile?.registrationDate)}</span>
                  </p>
                  {
                    userProfile?.status === 'online' ?
                    <p className='flex gap-1 items-baseline'>
                      <span className='rounded-full w-2 h-2 bg-green-500' />
                      Online
                    </p>
                    :
                    <p className='flex items-center gap-1 text-[12px]'>
                      <span className='opacity-95 italic'>Last seen</span>
                      <span className='font-medium'>{format(userProfile?.lastSeen)}</span>
                    </p>
                  }
                </div>

              </div>

              <div className={`${userProfile?.socialMediaAccounts?.length ? 'flex' : 'hidden'} flex-col w-fit gap-1`}>
                {
                  userProfile?.socialMediaAccounts?.map(socialMedia => (
                    <a 
                      href={socialMedia?.name === 'email' ? "mailto:email" : `${socialMedia?.link}`} target='_blank'
                      key={socialMedia?.name}
                      className={`flex items-center gap-1.5 text-blue-600 hover:underline w-fit`}
                    >
                      {ICONS(`${theme === 'light' ? 'text-gray-800' : 'text-gray-400'} text-lg`)[socialMedia?.name?.toLowerCase()]}
                      {socialMedia?.link}
                    </a>
                  ))
                }
              </div>
            </div>

    
            <div className={`lg:mt-0 md:mt-4 flex flex-col md:items-start lg:items-center items-center gap-3 p-0.5`}>
              <Link to={`/subscriptions/${userProfile?._id}`} 
                className={`${userId === currentUserId ? 'block' : 'hidden'}`}>
                <button 
                  className={`p-1 px-1.5 mobile:line-clamp-6 rounded-sm shadow-md border-none hover:opacity-95 active:opacity-100 focus:outline-none ${theme === 'light' ? 'bg-slate-500 text-white' : 'bg-slate-600'} transition-all`}
                >
                  subcriptions
                </button>
              </Link>

              <div className={`${userProfile?._id ? 'flex' : 'hidden'} flex-col justify-between gap-4 h-full`}>

                <FollowUnFollow userId={userProfile?._id} position={['profile']} />

                <div className={`${userProfile?.stack?.length ? 'flex' : 'hidden'} flex-col`}>
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
            </div>
         
          </article>
          
          <div className={`${userProfile?.hobbies?.length ? 'flex' : 'hidden'} py-2 flex-col`}>
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