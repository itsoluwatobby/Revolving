import { useContext } from "react";
import { WindowContext } from "../context/WindowContext";


export default function useWindowContext() {
  return useContext(WindowContext)
}