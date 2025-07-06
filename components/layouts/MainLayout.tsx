import Head from 'next/head'
import { Header, Navbar } from '../ui'

interface Props {
  title: string
  pageDescription: string
  imageFullUrl?: string
  children: React.ReactNode
}

export default function MainLayout({ title, pageDescription, children, imageFullUrl }: Props) {
  return (
    <>
      <Head>
        <title>{`CRM | ${title}`}</title>

        <meta name='description' content={pageDescription} />
        <meta name='og:title' content={title} />
        <meta name='og:description' content={pageDescription} />

        {imageFullUrl && (
          <meta name='og:image' content={imageFullUrl} />
        )}

        <link
          rel='icon'
          type='image/svg+xml'
          href='/favicon.svg'
        /> 
      </Head>

      <div className='flex w-full min-h-screen justify-between items-start gap-4'>
        <Navbar />

        <main className='w-full min-h-screen bg-gray-100 pl-[20%]'>
          <div className='p-4'>
            <Header />
            
            {children}
          </div>
        </main>
      </div>
    </>
  )
}
