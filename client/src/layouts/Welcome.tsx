import Wave from "../components/Wave";
import { Outlet } from "react-router-dom";

export default function Welcome() {
 
  return (
    <>
      <Outlet />
      <Wave />
    </>
  )
}


