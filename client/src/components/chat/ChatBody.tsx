import { Theme } from '../../posts'

type ChatBodyProp={
  theme: Theme
}

export default function ChatBody({ theme }: ChatBodyProp) {

  const chatContent = (count: number) =>{
    return (
      <article className='flex text-white items-center text-sm gap-2 p-1 shadow-md'>
        <figure className={`rounded-full border border-white bg-slate-800 w-8 h-8 shadow-lg`}>

        </figure>
        <p className='text-justify whitespace-pre-wrap'>Hello there, how may help you? {count}</p>
      </article>
  )
}

  return (
    <section className={`hidebars flex-auto flex flex-col gap-1 w-full box-border ${theme == 'light' ? '' : 'bg-slate-600'} overflow-y-scroll p-1.5 pl-1 pr-1`}>
      {[...Array(10).keys()].map((i) => (chatContent(i)))}
    </section>
  )
}