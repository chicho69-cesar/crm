import { GetServerSideProps } from 'next'

import { MainLayout } from '@/components/layouts'
import useAuthActions from '@/hooks/use-auth-actions'
import { type User } from '@/interfaces'
import { getUser } from '@/graphql/services/users.queries'
import { validateToken } from '@/utils'
import { LinkButton } from '@/components/ui'
import { TableOfClients } from '@/components/clients'

interface Props {
  user: User
  token: string
}

export default function HomePage({ user, token }: Props) {
  const { login } = useAuthActions()
  login(user, token)

  return (
    <MainLayout title='Clients' pageDescription='CRM clients for company administration'>
      <h1 className='text-3xl mt-4 mb-2 text-slate-900 first-letter:text-4xl'>
        Clientes
      </h1>

      <LinkButton size='lg' to='/new-client'>
        Nuevo Cliente
      </LinkButton>

      <TableOfClients />
    </MainLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const { cookies: { token = '' } } = req
  let isValidToken = await validateToken(token)

  if (!isValidToken) {
    return {
      redirect: {
        destination: '/auth/login',
        permanent: true
      }
    }
  }

  const user = await getUser(token)

  return {
    props: {
      user,
      token
    }
  }
}
