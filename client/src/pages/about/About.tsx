import './about.css'
import { useCallback } from "react";
import { MdAttachEmail } from "react-icons/md";
import { ThemeContextType } from "../../types/posts";
// import { SocialMediaAccoutProp } from "../../types/data";
import { useThemeContext } from "../../hooks/useThemeContext"
import ProfilePicture from '../../assets/revolving/profile_picture.jpg'
import { FaFacebookSquare, FaGithub, FaInstagramSquare, FaLinkedin, FaTwitterSquare } from "react-icons/fa";

export default function About() {
  const { theme } = useThemeContext() as ThemeContextType
  // const [skills, setSkills] = useState<string[]>([
  const skills = [
    'reactjs', 'nodejs', 'bash scripting', 'python'
  ];
  // const [features, setFeatures] = useState<string[]>([
  const features = [
    'User authentication',
    'Account verification by either a Link or OTP',
    'Post creation, editing, deleting and updating',
    'Code editor',
    'Printing of post in PDF format',
    'Follow and Unfollowing users',
    'Subscribe and Unsubscribe to users post',
    'Notifications', 'Task manager', 'A chat section'
  ];
  // const [socialMediaAccounts, setSocialMediaAccounts] = useState<SocialMediaAccoutProp[]>([
  const socialMediaAccounts = [
    {
      name: 'email', link: 'itsoluwatobby@gmail.com'
    },
    {
      name: 'twitter', link: 'https://twitter.com/itsoluwatobby'
    },
    {
      name: 'linkedin', link: 'https://linkedin.com/in/itsoluwatobby'
    }
  ];

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
    <main className="p-3 md:w-[70%] m-auto flex flex-col gap-2.5">
      
      <h1 className="first-letter:text-5xl text-2xl">
        Hello World!!
      </h1>

      <div className='w-full midscreen:block hidden'>
        <p className='scroll_effect text-center overflow-hidden capitalize first-letter:text-3xl text-2xl tracking-widest font-[900]'>Built with Typescript</p>
      </div>

      <div className="flex gap-1">
        
        <figure className="flex-none animate-border rounded-full shadow-lg border-4 border-slate-400 w-28 h-48">
          <img src={ProfilePicture} alt="Profile picture" 
            className="w-full h-full rounded-full object-cover"
          />
        </figure>

        <div className={`flex-auto flex flex-col gap-2 ${theme === 'light' ? 'bg-slate-100' : 'bg-slate-950'} transition-all p-1.5 rounded-md`}>
          
          <p className="first-letter:text-2xl indent-3 text-base whitespace-pre-wrap break-before-all">
            I'm Oluwatobi Akinola samuel, A MERN stack developer who loves turning complex problems into simple solutions
          </p>
          
          <div className='flex items-center gap-2 flex-wrap'>
            {
              skills?.map(skill => (
                <p className={`capitalize ${theme === 'light' ? 'bg-slate-300' : 'bg-slate-900'} rounded-sm transition-colors p-1 shadow-sm`}>{skill}</p>
              ))
            }
          </div>
          
          <div className={`flex flex-col w-fit gap-1 text-sm`}>
            {
              socialMediaAccounts?.map(socialMedia => (
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
          <a href="https://github.com/itsoluwatobby/revolving" target='_blank'>
            <button className={`rounded-md shadow-lg bg-blue-700 p-1.5 hover:bg-blue-500 transition-all active:bg-blue-600 text-white ${theme === 'light' ? 'shadow-slate-400' : 'shadow-slate-800'}`}>
              View source code
            </button>
          </a>
        </div>

      </div>

      <div className='flex flex-col'>
        <p className="first-letter:text-2xl indent-3 p-1">
          Welcome, Are you interested in web development content or you also wish to share your knowledge with others? Then, you presently in the right place.
        </p>
        <p className="first-letter:text-xl indent-2 p-1">
          You also get a top notch Task manager which comes with a recycle bin and also have the chance to chat with fellow developers in order to share knowledge and network with one another
        </p>
      </div>
      
      <div className='flex flex-col'>
        <p className='text-xl font-bold tracking-wider underline underline-offset-4'>FEATURES</p>
        <ul className=''>
          {
            features?.map(feature => (
              <li className="p-0.5 before:content-[' '] before:bg-slate-600 flex items-center gap-1.5 before:rounded-sm before:left-0 before:w-2 before:h-2">{feature}</li>
            ))
          }
        </ul>
      </div>
    </main>
  )
}