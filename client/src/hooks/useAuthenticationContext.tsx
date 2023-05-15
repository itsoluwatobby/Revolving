import { useContext } from "react";
import { AuthenticationProvider } from "../context/AuthenticationContext";


export default function useAuthenticationContext() {
  return useContext(AuthenticationProvider)
}