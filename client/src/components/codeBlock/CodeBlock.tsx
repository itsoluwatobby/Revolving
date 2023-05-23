import { ChangeEvent, useEffect, useState } from "react"
import { useThemeContext } from "../../hooks/useThemeContext";
import { ThemeContextType } from "../../posts";
import { BiCodeAlt } from 'react-icons/bi'
import { sensitiveWords } from "../../fonts";

export default function CodeBlock() {
  const { theme } = useThemeContext() as ThemeContextType;
  const [codeEntry, setCodeEntry] = useState<string>('');

  return (
    <section className="w-full grid place-content-center">
      {/* <CodeEditor
        value={codeEntry}
        language="js"
        placeholder="Please enter JS code."
        onChange={(evn) => setCodeEntry(evn.target.value)}
        padding={15}
        style={{
          fontSize: 12,
          backgroundColor: "#f5f5f5",
          fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
        }}
      /> */}
      Hello
    </section>
  )
}