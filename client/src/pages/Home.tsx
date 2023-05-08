import { Footer } from "../components/Footer";
import { } from 'react-icons/io';
import { Posts } from "../components/Posts"
import { TopHome } from "../components/TopHome"
import { Toaster } from 'react-hot-toast';



export const Home = () => {
  return (
    <main className="relative h-full">
      <div className="md:max-w-full flex pr-3 pl-3 h-full">
        <div className="flex-grow flex flex-col h-fit gap-3 md:w-fit min-w-[80%]">
          <TopHome />
          <Posts />
        </div>
        <aside className="flex-none hidden md:flex w-1/4 h-full border border-l-slate-300">
        </aside>
      </div>
      <Toaster />
    </main>
  )
}
