import { Link, useParams } from "react-router-dom"

export default function Followers() {
  const { userId } = useParams()

  return (
    <div>Followers</div>
  )
}