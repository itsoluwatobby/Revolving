import { ErrorResponse } from "../data"

type ErrorProp = {
  message: string,
  contentLength: number,
  errorMsg: ErrorResponse
  position?: 'CHAT' | 'MESSAGE'
}

export const ErrorContent = ({ message, contentLength, errorMsg, position }: ErrorProp) => {
  
  return (
    errorMsg?.status ?
      <p className={`transition-all text-center py-6 font-serif ${position === 'CHAT' ? 'text-[11px]' : position === 'MESSAGE' ? 'mt-8 text-gray-200' : 'text-sm'}`}>
        {
          (contentLength === 0 || errorMsg?.status == 404 || errorMsg?.status == 400) ? 
            <span className={`${position === 'MESSAGE' ? 'italic' : ''}`}>{message}</span>
            : 
            <span>Network Error, Please check your connection</span>
        }
      </p>
    :
      <p className={`transition-all text-center italic py-6 font-serif ${position === 'CHAT' ? 'text-[11px]' : position === 'MESSAGE' ? 'mt-8 text-gray-200' : 'text-sm'}`}>
        <span>Select a friend to start a conversation</span>
      </p>
  )
}