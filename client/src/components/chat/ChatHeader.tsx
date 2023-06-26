import { Theme } from '../../posts'

type ChatHeaderProp={
  theme: Theme
}

export default function ChatHeader({ theme }: ChatHeaderProp) {
  return (
    <header className={`flex-none h-10 shadow-lg p-2 w-full flex items-center sticky top-0`}>
      <figure className={`rounded-full border border-white bg-slate-700 w-8 h-8 shadow-lg`}>

      </figure>
    </header>
  )
}