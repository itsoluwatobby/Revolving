import { useThemeContext } from "../hooks/useThemeContext"
import { ChatOption, ThemeContextType } from "../posts"

type UserCardProps = {
  userId: string,
  cardRef: React.LegacyRef<HTMLElement>,
  revealCard: ChatOption,
  setRevealCard: React.Dispatch<React.SetStateAction<ChatOption>>
  setHovering: React.Dispatch<React.SetStateAction<boolean>>,
  setOnCard: React.Dispatch<React.SetStateAction<boolean>>,
  closeUserCard: () => void
}

export default function UserCard({ userId, closeUserCard, cardRef, revealCard, setRevealCard, setHovering, setOnCard }: UserCardProps) {
  const {theme } = useThemeContext() as ThemeContextType

  return (
    <article 
      ref={cardRef}
      onMouseOver={closeUserCard}
      onMouseLeave={() => {
        setOnCard(false)
        setRevealCard('Hide')
      }}
      className={`absolute ${revealCard == 'Open' ? 'scale-100' : 'scale-0'} transition-all rounded p-2 z-10 top-5 h-40 shadow-2xl md:w-1/4 w-1/2 ${theme == 'light' ? 'bg-white' : ''}`}>

    </article>
  )
}