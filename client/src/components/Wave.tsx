import { ThemeContextType } from "../types/posts";
import { useThemeContext } from "../hooks/useThemeContext"

export default function Wave() {
  const { setOpenChat } = useThemeContext() as ThemeContextType

  return (
    <div 
      onClick={() => setOpenChat('Hide')}
      className="ocean"
    >
      <div className="wave" />
      <div className="wave" />
    </div>
  )
}


