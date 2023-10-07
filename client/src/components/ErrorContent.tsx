import { ErrorResponse } from "../data"

type ErrorProp = {
  message: string,
  contentLength: number,
  errorMsg: ErrorResponse
  position?: 'CHAT' | 'MESSAGE'
}

export const ErrorContent = ({ message, contentLength, errorMsg, position }: ErrorProp) => {
    
  return (
    <p className={`text-center py-6 font-serif ${position === 'CHAT' ? 'text-[11px]' : position === 'MESSAGE' ? 'mt-8 text-gray-200' : 'text-sm'}`}>
      {
        (contentLength === 0 || errorMsg?.status == 404) ? 
          <span className={`${position === 'MESSAGE' ? 'italic' : ''}`}>{message}</span>
          : 
          <span>Network Error, Please check your connection</span>
      }
    </p>
  )
}