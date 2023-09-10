import { useState } from 'react'
import { Theme } from '../../posts'
import { UserProps } from '../../data'
import { MdAttachEmail } from 'react-icons/md'
import { reduceLength } from '../../utils/navigator'
import { FaGithub, FaTwitterSquare } from 'react-icons/fa'

type Props = {
  userProfile: UserProps,
  theme: Theme
}

export default function ProfileMid({ userProfile, theme }: Props) {
  const [showAll, setShowAll] = useState<boolean>(false)

  const about = 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Accusamus animi sequi quis aut deserunt recusandae! Molestias assumenda incidunt vel amet magnam repudiandae atque dignissimos, ipsam mollitia quidem sint. Delectus, hic? Quibusdam velit facere odit quidem praesentium quo, quis laboriosam quod numquam tenetur quaerat, sapiente sit. Iste architecto voluptatem minima natus eaque libero recusandae aliquam, inventore, molestias explicabo consequuntur atque delectus!'

  return (
    <div role="user information" className="relative flex py-2 pt-3 md:mt-0 mt-16 flex-col w-full">
      {
        <>
          <article className="flex items-center justify-between w-full md:flex-wrap lg:flex-nowrap">

            <div className="flex flex-col gap-1 w-full flex-auto">

              <div className={`${userProfile?.firstName ? 'flex' : 'flex'} items-center gap-1.5 mb-2`}>
                <p className={`${theme === 'light' ? 'text-gray-900' : 'text-gray-300'}`}>Name:</p>
                <p className="font-medium capitalize cursor-pointer whitespace-pre-wrap tracking-wide">
                  {reduceLength(userProfile?.firstName as string, 20, 'letter')}
                  {reduceLength(userProfile?.lastName as string, 20, 'letter')}
                </p>
              </div>
              
              <a 
                href="mailto:email" target='_blank'
                className={`flex items-center gap-1.5 text-blue-600 hover:underline`}
              >
                <MdAttachEmail className={`${theme === 'light' ? 'text-gray-800' : 'text-gray-400'} text-lg`} />
                itsoluwatobby@gmail.com
              </a>
              <a 
                href="https://github.com/itsoluwatobby" target='_blank'
                className={`absolute flex items-center gap-1.5 right-1 md:left-0 lg:right-1 top-24 text-blue-600 hover:underline`}
              >
                <FaGithub className={`${theme === 'light' ? 'text-gray-800' : 'text-gray-400'} text-lg`} />
                github.com/itsoluwatobby
              </a>
              <a 
                href="https://twitter.com/itsoluwatobby" target='_blank'
                className={`flex items-center gap-1.5 text-blue-500 hover:underline`}
              >
                <FaTwitterSquare className={`${theme === 'light' ? 'text-gray-800' : 'text-gray-400'} text-lg`} />
                twitter.com/itsoluwatobby
              </a>

            </div>

            <div className={`flex-none w-[20%] md:translate-x-5 lg:translate-x-0 md:mt-8 lg:mt-0 ${userProfile?.stack?.length ? 'flex' : 'flex'}  items-center flex-col h-20`}>
              <p className={`uppercase text-center ${theme === 'light' ? 'text-gray-800' : 'text-gray-300'} font-semibold font-mono`}>Skills</p>
              <div className={`stackflow overflow-y-scroll h-12 p-1 pt-1.5 px-2 w-fit text-sm overflow-x-scroll max-w-[120px] last:border-b-0 text-white whitespace-nowrap font-serif font-light bg-slate-900 rounded-md`}>
                {
                  // userStories?.skills?.map(skill => {
                  [...Array(8).keys()]?.map(i => (
                    <p 
                      key={i}
                      className="rounded-md hover:opacity-80 tracking-wide capitalize transition-all cursor-grab">
                        Javascript
                    </p>
                  ))
                }
              </div>
            </div>

          </article>

          <div className="flex flex-col mt-2 lg:mt-8 w-full">
            <p className={`${theme === 'light' ? 'text-gray-900' : 'text-gray-300'} underline underline-offset-2`}>
              About: 
            </p>
            <p 
              onDoubleClick={() => setShowAll(prev => !prev)}
              className="text-justify cursor-pointer w-full whitespace-pre-wrap tracking-wide first-letter:text-lg transition-all">
              {showAll ? about : reduceLength(about, 50, 'word')}
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