import { axiosPrivate, userAxios, user_endPoint } from "../api/axiosPost"
import { UserProps } from "../data"

export default function useGetUsers() {
  const userId = localStorage.getItem('revolving_userId')
  
  const fetchUsers = async() => {
    const res = await userAxios.get(user_endPoint)
    return res?.data?.data
  }

  const getUser = async() => {
    if(userId != null){
      const res = await userAxios.get(`${user_endPoint}/single/${userId}`)
      return res?.data?.data
    }
    return
  }

  const updateUser = async(updatedInfo: UserProps) => {
    const { _id } = updatedInfo
    const res = await axiosPrivate.put(`${user_endPoint}/updateInfo/${_id}`, {...updatedInfo})
    return res?.data?.data
  }
  
  const followUnfollowUser = async(followingId: string) => {
    const res = await axiosPrivate.put(`${user_endPoint}/follow_unfollow/${userId}/${followingId}`)
    return res?.data?.message
  }

  const deleteUserAccount = async() => {
    const res = await axiosPrivate.delete(`${user_endPoint}/delete/${userId}`)
    return res?.data?.message
  }
  
  return {fetchUsers, getUser, updateUser, followUnfollowUser, deleteUserAccount}
}