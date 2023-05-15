// import useAxiosPrivate from "../hooks/useAxiosPrivate"

// const axiosPrivate = useAxiosPrivate()

// export const createPost = async(newPost: PostType): Promise<PostType[]> => {
//   const res = await axiosPrivate.post(`${posts_endPoint}`, newPost)
//   return res?.data
// }

// export const updatePost = async(updatedPost: PostType): Promise<PostType[]> => {
//   const res = await axiosPrivate.put(`${posts_endPoint}/${updatedPost?.id}`, {...updatePost})
//   return res?.data
// }

// export const deletePost = async(id: string): Promise<PostType[]> => {
//   const res = await axiosPrivate.delete(`${posts_endPoint}/${id}`)
//   return res?.data
//}