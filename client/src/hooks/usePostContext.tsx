import { useContext } from "react"
import { PostContext } from "../context/BlogContext"

export const usePostContext = () => {
  return useContext(PostContext)
}
