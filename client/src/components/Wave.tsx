import { useThemeContext } from "../hooks/useThemeContext"
import { ThemeContextType } from "../posts"

export default function Wave() {
  const { setOpenChat } = useThemeContext() as ThemeContextType

  return (
    <div 
      onClick={() => setOpenChat('Hide')}
      className="ocean">
      <div className="wave"></div>
      <div className="wave"></div>
    </div>
  )
}


