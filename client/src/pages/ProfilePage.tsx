import { useThemeContext } from "../hooks/useThemeContext";
import { ThemeContextType } from "../posts";
import { useEffect, useState } from 'react';
import { FaTwitterSquare, FaGithub } from 'react-icons/fa';
import { MdAttachEmail } from 'react-icons/md'
import { reduceLength } from "../utils/navigator";


export default function ProfilePage() {
  const { theme } = useThemeContext() as ThemeContextType
  const [showAll, setShowAll] = useState<boolean>(false)
  const [userlink, setUserlink] = useState<string>('')

  const about = 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Accusamus animi sequi quis aut deserunt recusandae! Molestias assumenda incidunt vel amet magnam repudiandae atque dignissimos, ipsam mollitia quidem sint. Delectus, hic? Quibusdam velit facere odit quidem praesentium quo, quis laboriosam quod numquam tenetur quaerat, sapiente sit. Iste architecto voluptatem minima natus eaque libero recusandae aliquam, inventore, molestias explicabo consequuntur atque delectus!'

  const truncate = about.length > 250 ? about.substring(0, 250)+'...' : about

  // useEffect(() => {
  //   const userLink = async() => {
  //     const info = await axios.get('https://twitter.com/itsoluwatobby',
  //       {
  //         headers: { 'Content-Type': 'application/json'}
  //       }
  //     )
  //     console.log(info.data)
  //   }
  //   userLink()

  // }, [])

  return (
    <main role="User profile" className={`single_page text-sm p-2 flex md:flex-row flex-col gap-2 w-full`}>
      <div className="md:flex-none h-1/5 shadow-inner shadow-slate-800 rounded-md border md:h-2/3 md:w-1/2 md:sticky md:top-0">
        <figure role="Cover photo" className="relative bg-slate-700 h-full rounded-md shadow-transparent shadow-2xl border-1">
          cover photo
        </figure>
        <figure role="Display picture" className="rounded-full border-2 shadow-2xl shadow-slate-900 border-white  w-28 h-28 absolute translate-x-1/2 top-36 bg-slate-600 right-1/2 mobile:top-64">
            dp
        </figure>
      </div>
      <p role="Code name" className="absolute md:right-36 md:top-6 top-72 flex items-center gap-2 mobile:top-[330px]">
          <span className="text-gray-500">CodeName:</span>
          <span>itsoluwatobby</span>  
        </p>
        <p role="Country" className="absolute right-2 top-72 flex items-center gap-2 mobile:top-[330px]">
          <span className="text-gray-500">Country:</span>
          <span>Nigeria</span>  
        </p>
      <div className={`md:hidden w-full translate-y-20 border ${theme == 'light' ? 'border-gray-200' : 'border-gray-400'}`}/>
      <article role="user information" className="relative flex p-2 pt-3 mt-16 mobile:flex-col">
        <div className="flex flex-col gap-1">
          <p className="flex items-center gap-1.5">
            <span className="text-gray-500">Username:</span>
            <span>itsoluwatobby</span>
          </p>
          <a 
            href="mailto:email"
            className="flex items-center gap-1.5 text-blue-400 hover:underline"
          >
            <MdAttachEmail className="text-gray-500 text-lg" />
            itsoluwatobby@gmail.com
          </a>
          <a 
            href="https://github.com/itsoluwatobby"
            className="absolute flex items-center gap-1.5 right-1 mt-[70px] text-blue-400 hover:underline"
          >
            <FaGithub className="text-gray-500 text-lg" />
            github.com/itsoluwatobby
          </a>
          <a 
            href="https://twitter.com/itsoluwatobby"
            className="flex items-center gap-1.5 text-blue-400 hover:underline"
          >
            <FaTwitterSquare className="text-gray-500 text-lg" />
            twitter.com/itsoluwatobby
          </a>
          <p className="flex flex-col">
            <span className="text-gray-500 underline underline-offset-2">About: </span>
            <span 
              onDoubleClick={() => setShowAll(prev => !prev)}
              className="text-justify cursor-pointer whitespace-pre-wrap tracking-wide first-letter:text-lg overflow-hidden">
              {showAll ? about : reduceLength(about, 50, 'word')}
            </span>
          </p>
        </div>
        <p className="absolute uppercase right-14 text-gray-500 font-semibold font-mono">TECH Stack</p>
        <div className="stackflow overflow-y-scroll absolute h-12 right-2 p-1 pt-1.5 pl-1.5 mt-5 w-fit overflow-x-scroll max-w-[120px] last:border-b-0  text-sm whitespace-nowrap font-serif font-light bg-slate-900 rounded-md">
          <p className="rounded-md hover:opacity-60 transition-all cursor-grab">Javascript</p>
          <p className="rounded-md hover:opacity-60 transition-all cursor-grab">Nodejs</p>
          <p className="rounded-md hover:opacity-60 transition-all cursor-grab">VueJs</p>
          <p className="rounded-md hover:opacity-60 transition-all cursor-grab">React</p>
          <p className="rounded-md hover:opacity-60 transition-all cursor-grab">Regex</p>
          <p className="rounded-md hover:opacity-60 transition-all cursor-grab">Java</p>
          <p className="rounded-md hover:opacity-60 transition-all cursor-grab">Dart</p>
          <p className="rounded-md hover:opacity-60 transition-all cursor-grab">Python</p>
          <p className="rounded-md hover:opacity-60 transition-all cursor-grab">C programming</p>
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
      </article>
      <div className={`md:hidden w-full border ${theme == 'light' ? 'border-gray-200' : 'border-gray-600'}`}/>
      {/* USER STORIES */}
    </main>
  )
}