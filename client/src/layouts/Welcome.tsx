import { Outlet } from "react-router-dom";
import Wave from "../components/Wave";

export default function Welcome() {
  
  return (
    <>
      <Outlet />
      <Wave />
    </>
  )
}


