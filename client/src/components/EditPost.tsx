import { useState } from 'react'
import { PostType } from '../posts'

export const EditPost = ({ post }: PostType) => {
  const [editTitle, setEditTitle] = useState<string>('')
  const [editBody, setEditBody] = useState<string | undefined>('')
  return (
    <div>EditPost</div>
  )
}
