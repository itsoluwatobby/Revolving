
export const errorResponse = (status: number, message: string): string => {
  let responseMessage: string;
  status === 201 ? responseMessage = message : status === 400 
  ? responseMessage = message : status === 401 
  ? responseMessage = message : status === 404 
  ? responseMessage = message : status === 403 
  ? responseMessage = message : status === 429 
  ? responseMessage = message : status === 500
  ? responseMessage = message : responseMessage = 'No network'
  return responseMessage;
}

// errors?.response?.status === 201 ? errorMessage = 'Please check your mail to verify your account' 
//         : errors?.response?.status === 400 ? errorMessage = 'Bad request' 
//           : errors?.response?.status === 401 ? errorMessage = 'Bad credentials' 
//             : errors?.response?.status === 404 ? errorMessage = 'You don\'t have an account, Please register' 
//               : errors?.response?.status === 403 ? errorMessage = 'Your account is locked' 
//                 : errors?.response?.status === 500 ? errorMessage = 'Internal server error' : errorMessage = 'No network'