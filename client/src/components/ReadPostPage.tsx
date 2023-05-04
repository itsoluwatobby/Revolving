import React from 'react'
import { PostType } from '../posts'

type Props = {
  post: PostType
}

export const ReadPostPage = ({ post: { title, body, date, likes, fontFamily } }: Props) => {

  return (
    <article className={`flex font-${fontFamily}`}>
      <p>{title}</p>
      <p>{body}</p>
      <div className='flex'>
        <p>{date}</p>
        <p>{likes}</p>
      </div>
    </article>
  )
}