import { Link, useParams } from "react-router-dom"

export default function Followers() {
  const { userId } = useParams()

  return (
    <section className={`hidebars single_page md:pt-8 text-sm p-2 pt-0 flex-col gap-2 w-full overflow-y-scroll`}>
      Followers
    </section>
  )
}