import { useCallback } from "react"
import { Theme } from "../types/posts"
import { UserProps } from "../types/data"
import { MdAttachEmail } from "react-icons/md"
import { FaFacebookSquare, FaGithub, FaInstagramSquare, FaLinkedin, FaTwitterSquare } from "react-icons/fa"


type SocialMediaAccountProps={
  theme: Theme,
  userProfile: UserProps
  page: 'PROFILE' | 'HOME',
}

export const SocialMediaAccounts = ({ theme, userProfile, page }: SocialMediaAccountProps) => {

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
  )
}