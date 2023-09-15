/**
* @description checks if user login time is valid in order to 
* get a new accessToken in cases of a refresh
* @returns VALID onsuccess else INVALID onerror
*/

export default function useNotPersistedLogin(): ('VALID' | 'INVALID') {
  const DEFAULT_LOGIN_DURATION = 5_400_000 as const // 1hr 30mins
  const loginTimeStamp = localStorage.getItem('revolving_login_time') as string
  const timestamp_datetime = new Date(loginTimeStamp).getTime()
  const currentTime = new Date().getTime()
  const elaspedTime = currentTime - timestamp_datetime
  if(!loginTimeStamp) return 'INVALID'
  return elaspedTime < DEFAULT_LOGIN_DURATION ? 'VALID' : 'INVALID'
}