import { FaGithub, FaTwitter, FaHandshake } from 'react-icons/fa'
import { AiOutlineLinkedin, AiOutlineMail } from 'react-icons/ai'

const footer_list = "cursor-pointer text-2xl flex flex-col items-center"
const icon_style = "hover:text-gray-500 active:scale-[1.2] transition-all duration-200 ease-in-out"
const top_border = "border w-1/3 pt-2.5 bg-slate-100 rounded-t-3xl border-slate-400 border-l-0 border-r-0 border-b-0"

export const Footer = () => {
  return (
    <footer className='absolute bottom-0 w-full flex flex-col'>
      <div className='flex justify-evenly w-full flex-wrap'>
        <p className={top_border}>
          <a href='https://github.com/itsoluwatobby' target='_blank' className={footer_list}>
            <FaGithub className={icon_style} />
            <span className='text-sm'>Github</span>
          </a>
        </p>
        <p className={top_border}>
          <a href='https://twiiter.com/itsoluwatobby' target='_blank' className={footer_list}>
            <FaTwitter className={icon_style} />
            <span className='text-sm'>Twitter</span>
          </a>
        </p>
        <p className={top_border}>
          <a href='https://linkedin.com/in/itsoluwatobby' target='_blank' className={footer_list}>
            <AiOutlineLinkedin className={icon_style} />
            <span className='text-sm'>LinkedIn</span>
          </a>
        </p>
      </div>
      <div className='flex flex-col items-center relative w-full place-content-center'>
        
        <span className='font-mono text-center md:text-center text-sm pt-2 bg-slate-200 w-full'>
          Thanks visiting. Follow me on any of the social media accounts above
        </span>
      </div>
    </footer>
  )
}

{/* <p className='flex gap-1 items-center self-start cursor-pointer pl-3 hover:text-gray-800'>
          <AiOutlineMail className='text-xl' />
          <a href="mailto:itsoluwatobby@gmail.com">itsoluwatobby@gmail.com</a>
        </p> */}
