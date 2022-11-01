import { AppProps } from "next/app";
import Navbar from "../components/navigation/Navbar";
import "../styles/globals.css";


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
