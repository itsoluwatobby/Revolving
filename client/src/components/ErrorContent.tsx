import { ErrorResponse } from "../types/data"

type ErrorProp = {
  message: string,
  contentLength: number,
  errorMsg: ErrorResponse
  position?: 'CHAT' | 'MESSAGE' | 'NOTIFICATION'
}

export const ErrorContent = ({ message, contentLength, errorMsg, position }: ErrorProp) => {
  
  return (
    errorMsg?.status ?
      <p className={`${(position === 'MESSAGE' || position === 'NOTIFICATION') ? 'm-auto' : 'text-red-500 uppercase absolute bg-gray-50 font-extrabold top-2'} tracking-wide bg-opacity-80 w-56 rounded-sm font-mono transition-all text-center py-6 ${position === 'CHAT' ? 'text-[11px]' : position === 'MESSAGE' ? 'mt-8 text-gray-200' : 'text-sm'}`}>
        {
          errorMsg.status === 'FETCH_ERROR' ? 
            <span className={`${position === 'MESSAGE' ? 'italic' : ''}`}>SERVER ERROR</span>
            : 
          (contentLength === 0 || errorMsg.status == 404 || errorMsg.status == 400) ? 
            <span className={`${position === 'MESSAGE' ? 'italic' : ''}`}>{message}</span>
            :
            <span>{(position === 'NOTIFICATION' && errorMsg?.originalStatus === 401) ? 'Please sign in' : 'Network Error, Please check your connection'}</span>
        }
      </p>
    :
      <p className={`transition-all text-center italic py-6 font-serif ${position === 'CHAT' ? 'text-[11px]' : position === 'MESSAGE' ? 'mt-8 text-gray-200' : 'text-sm'}`}>
        <span>Select a friend to start a conversation</span>
      </p>
  )
}