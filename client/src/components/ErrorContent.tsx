import { ErrorResponse } from "../data"

type ErrorProp = {
  message: string,
  contentLength: number,
  errorMsg: ErrorResponse
}

export const ErrorContent = ({ message, contentLength, errorMsg }: ErrorProp) => {
    
  return (
    <p className='text-center text-base py-6 font-serif'>
      {
        (contentLength === 0 || errorMsg?.status == 404) ? 
          <span>{message}</span>
          : 
          <span>Network Error, Please check your connection</span>
      }
    </p>
  )
}