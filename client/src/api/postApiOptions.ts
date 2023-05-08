import { PostType } from "../posts";

export const addPostOptions = (newPost: PostType): object => {
  return {
    optimisticData: (posts: PostType[]): PostType[] => {
      return [...posts, newPost].sort((a,b) => b?.date.localeCompare(a?.date));
    },
    rollBackOnError: true,
    populateCache: (posts: PostType[]): PostType[] => {
      return [...posts, newPost].sort((a,b) => b?.date.localeCompare(a?.date));
    },
    revalidate: false
  }
}

export const updatePostOptions = (updatedPost: PostType): object => {
  return {
    optimisticData: (posts: PostType[]): PostType[] => {
      const {postId} = updatedPost
      const otherPost = posts.filter(post => post?.postId != postId) as PostType[]
      return [...otherPost, updatedPost].sort((a,b) => b?.date.localeCompare(a?.date));
    },
    rollBackOnError: true,
    populateCache: (posts: PostType[]): PostType[] => {
      const {postId} = updatedPost
      const otherPost = posts.filter(post => post?.postId != postId) as PostType[]
      return [...otherPost, updatedPost].sort((a,b) => b?.date.localeCompare(a?.date));
    },
    revalidate: false
  }
}

export const deletePostOptions = ( id: string ) : object => {
  return {
    optimisticData: (posts: PostType[]): PostType[] => {
      const otherPost = posts.filter(post => post?.id != id) as PostType[]
      return [...otherPost]
    },
    rollBackOnError: true,
    populateCache: (emptyResponseObj: object, posts: PostType[]): PostType[] => {
      const otherPost = posts.filter(post => post?.id != id) as PostType[]
      return [...otherPost]
    },
    revalidate: true
  }
}

