import Head from 'next/head'

interface Props {
  title: string
  children: React.ReactNode
}

export default function AuthLayout({ children, title }: Props) {
  return (
    <>
      <Head>
        <title>{`CRM | ${title}`}</title>

        <link
          rel='icon'
          type='image/svg+xml'
          href='/favicon.svg'
        /> 
      </Head>

      {children}
    </>
  )
}
