import Document, { Html, Head, Main, NextScript } from "next/document";

export default class ResonantDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <meta name="theme-color" content="#0a0a1a" />
          <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💎</text></svg>" />
        </Head>
        <body style={{ margin: 0, padding: 0, background: "#0a0a1a" }}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
