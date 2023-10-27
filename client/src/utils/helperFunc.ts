import { imageStorage } from './firebase'
import { nanoid } from '@reduxjs/toolkit'; 
import { ImageReturnType, UserProps } from "../types/data";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'

type PathType = 'profile' | 'story'

/**
 * @desc imageUpload: function to upload images to firebase
 * @param image image file 
 * @param storePath firebase path to tore image (chatImages | apartmentImages | profileImage)
 * @Return returns an object. onSuccess {status: "success", url: string}
 *                            onError {status: "failed", url: ''}
 * @desc storePath: image storage container. The store container for this project
 * includes: chatImages | apartmentImages | profileImage
 * The format given above is the exact format of the container names in firestore
 */
export const imageUpload = (image: File, storePath: PathType): Promise<ImageReturnType> => {
  return new Promise((resolve, reject) => {
    const photoName = `${image.name}-${nanoid(5)}`
    const storageRef = ref(imageStorage, `images/${storePath}/${photoName}`)
    const uploadTask = uploadBytesResumable(storageRef, image)
    uploadTask.on('state_changed', (snap: any) => {
      void(snap)
    },(error: any) => {
        void(error)
        reject({status: "failed", url: ''})
      }, 
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
        .then((downloadUrl: string) => {
          return resolve({status: 'success', url: downloadUrl})
        })
        .catch((error: any) => {
          void(error)
          return reject({status: 'failed', url: ''})
        })
      }
    )
  })
}

export const deleteSingleImage = (image: string, storePath: PathType) => {
  const imageName = image?.split('?alt=')[0]?.split(`images%2F${storePath}%2F`)[1]
  return new Promise((resolve, reject) => {
    const deleteRef = ref(imageStorage, `images/${storePath}/${imageName}`)
    deleteObject(deleteRef)
    .then(() => resolve('successful'))
    .catch(() => reject('An Error occurred'))
  })
}

export const userOfPost = (users: UserProps[], userId: string): string => {
  const result = users?.find(user => user?._id === userId) as UserProps
  return result ? result?.username : ''
}

export function providesTag<R extends { _id: string | number }, T extends string>(resultWithIds: R[], TagType: T){
  return (
    resultWithIds ? [ 
      { type: TagType, id: 'LIST' }, 
      ...resultWithIds.map(({ _id }) => ({ type: TagType, id: _id }))
    ] 
    : 
    [{ type: TagType, id: 'LIST' }]
  )
}

// thumb event
export function simulateThumbEvent(element: HTMLElement){
  const thumbEvent = new CustomEvent('thumb', {
    bubbles: true, // Alllow the event to bubble up to the DOM
    cancelable: true
  })
  element.dispatchEvent(thumbEvent)
}

export const dateFormat = (dateTime: string) => {
  const constructDate = new Date(dateTime)
  const date = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium'
  }).format(constructDate)
  return date
}
