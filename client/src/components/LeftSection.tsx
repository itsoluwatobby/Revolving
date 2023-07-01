import { useState } from "react"
import { ChatOption, ThemeContextType } from "../posts"
import { useThemeContext } from "../hooks/useThemeContext"
import { Link } from "react-router-dom"

type RouteProps = {
  name: string,
  link: string
}

const routeLinkNames = ({ params, id }:{ params?: string, id?: string }): RouteProps[] =>{ 
  
  return ([
      {
        name: 'Home Page',
        link: `/`
      },
      {
        name: 'Profile Page',
        link: `profile/${id}`
      },
      {
        name: 'Task Manager',
        link: `taskManager/${id}`
      },
      {
        name: `About`,
        link: `about`
      },
    ])
}

export const LeftSection = () => {
  const [nav, setNav] = useState<string>('')
  const { theme, toggleLeft, setToggleLeft  } = useThemeContext() as ThemeContextType

  return (
    <section className={`welcome w-2/5 sm:w-full flex flex-col ${theme == 'light' ? 'bg-slate-200' : 'bg-slate-700'} p-1 pb-2 rounded-md h-[90%] ${toggleLeft == 'Open' ? 'maxscreen:translate-x-0' : 'maxscreen:-translate-x-96 maxscreen:w-0'}  maxscreen:pb-4 transition-full`}>
      <div className="relative w-full h-8 flex items-center">
        <button
          onClick={() => setToggleLeft('Hide')}
          className={`absolute p-2 sm:hidden pt-1 pb-1 text-center rounded-md right-0.5 ${theme == 'light' ? 'bg-slate-400' : 'bg-slate-600'}`}
        >
          close
        </button>
      </div>
      <div className="h-full p-2 flex flex-col gap-1">
        {
          routeLinkNames({params: 'Hello', id: '25Aw45wr'}).map(values => (
            <p 
              key={values.name}
              onClick={() => setNav(values.name)}
              className={`p-2.5 ${values.name == nav ? 'bg-slate-600 shadow-slate-900 shadow-lg' : ''} cursor-pointer hover:bg-slate-600 hover:rounded-md transition-all rounded-md text-center border border-r-0 border-l-0 border-slate-500 border-t-0 border-b-1`}
            >
              <Link to={`${values.link}`}>
                {values.name}
              </Link>
            </p>
          ))
        }
      </div>
      <div className={`flex-none self-end bottom-2 p-2 cursor-pointer bg-slate-600 w-full flex items-center gap-2 rounded-md`}>
        <figure className="rounded-full border shadow-2xl h-10 w-10">
          <img src="" alt="" />
        </figure>
        <p>usernamename</p>
      </div>
    </section>
  )
}
