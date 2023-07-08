import { TextRules } from "../../fonts"

type Props = {
  codeBody: string
}

export default function CodeBody({codeBody}: Props) {
  const watchWords = TextRules.keywords as string[]

  const body = codeBody?.split('\n')?.map((code, index) => {
    let finalBody: string;
    if(code.startsWith('\n') || code.includes('\n')){
      finalBody = code.replaceAll('\n', '&nbsp;')
      console.log(finalBody)
    }
    else finalBody = code
    return(
       <span key={index} className={`${watchWords.includes(finalBody) ? 'bg-gray-600 rounded-sm text-yellow-500' : (finalBody.includes('(') || finalBody.endsWith(').')) || finalBody[finalBody.length - 1] == ')' ? 'text-red-600' : ''}`}>{finalBody}{' '}</span>
    )
  })
  return (
    <>
      {body}
    </>
  )
}