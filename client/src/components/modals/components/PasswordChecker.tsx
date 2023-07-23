
type PasswordCheckerProps = {
  password: string
}

export default function PasswordChecker({
  password
}: PasswordCheckerProps) {
  
  return (
    <ul className={`flex items-center justify-evenly bg-slate-900 rounded-md text-xs w-[95%] self-center -mt-0.5 overflow-x-auto`}>
      <li className='flex flex-col'>
        <span className={`before:content-['*'] flex items-center gap-1 ${!password ? 'text-white' : /[a-z]/.test(password) ? 'text-green-500' : 'text-red-500'}`}>lowercase</span>
        <span className={`before:content-['*'] flex items-center gap-1 ${!password ? 'text-white' : /[A-Z]/.test(password) ? 'text-green-500' : 'text-red-500'}`}>uppercase</span>
      </li>
      <li className='flex flex-col'>
        <span className={`before:content-['*'] flex items-center gap-1 ${!password ? 'text-white' : /[@£$!%*?&]/.test(password) ? 'text-green-500' : 'text-red-500'}`}>a symbol</span>
        <span className={`before:content-['*'] flex items-center gap-1 ${!password ? 'text-white' : /[\d]/.test(password) ? 'text-green-500' : 'text-red-500'}`}>number</span>
      </li>
      <li className='flex flex-col'>
        <span className={`text-xs line-through ${!password ? 'text-white' : /^(?!.*[\^(),"_+-].*$)/.test(password) ? 'text-green-500' : 'text-red-500'}`}>
        ^()"_+-/
        </span>
        <span className={`before:content-['*'] flex items-center gap-1 ${!password ? 'text-white' : password.length >= 9 ? 'text-green-500' : 'text-red-500'}`}>
          minimum 9
        </span>
      </li>
    </ul>
  )
}