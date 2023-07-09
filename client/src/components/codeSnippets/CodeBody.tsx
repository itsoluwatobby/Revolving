import { TextRules } from "../../fonts"

type Props = {
  codeBody: string
}

export default function CodeBody({codeBody}: Props) {
  const rules = TextRules;
  const bold = rules.boldText as string;
  const italic = rules.italics as string;
  const functions = rules.functions as string;
  const highlight = rules.highlight as string;
  const keywords = rules.keywords as string[];
  const codeBlock = rules.codeBlock;

  const blockQuotes = codeBlock.backStrokes as string;
  const quotes = codeBlock.quotes as string;
  const comments = codeBlock.comments as string[]; // work more on this (code.startsWith(comment[0]) || code.startsWith(comment[1]) || code.startsWith(comment[2]))
  const operators = codeBlock.operators as string[];

  const postBody = codeBody?.split(' ').map((code, index) => {
    return (
        <span key={index} className={`${code[0] == bold && code[-1] == bold ? 'font-bold' : code[0] == italic && code[-1] == italic ? 'italic' : code[0] == functions[0] && code[-1] == functions[1] ? 'text-yellow-500' : code[0] == highlight[0] && code[-1] == highlight[1] ? 'bg-gray-600 text-white' : keywords.includes(code) ? 'text-red-500' : code[0] == blockQuotes && code[-1] == blockQuotes ? 'text-blue-500' : code[0] == quotes && code[-1] == quotes ? 'text-blue-600 font-serif' : comments.includes(code) ? 'text-gray-700' : operators.includes(code) ? 'text-red-600' : 'text-white'}`}>
          {code}{' '}
        </span>
    )
  })

  return (
    <pre>
      {postBody}
    </pre>
  )
}