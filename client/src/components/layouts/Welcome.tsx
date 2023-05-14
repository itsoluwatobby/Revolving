import { Outlet } from "react-router-dom";
import Wave from "../Wave";

export default function Welcome() {
  
  return (
    <>
      <Outlet />
      <Wave />
    </>
  )
}


