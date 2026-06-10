import "../src/styles/globals.css";
import type { AppProps } from "next/app";

export default function ResonantApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
