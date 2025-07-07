import { ApolloError } from '@apollo/client'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'

import { MainLayout } from '@/components/layouts'
import { InputWrapper, SubmitError } from '@/components/ui'
import { newProduct } from '@/graphql/services/products.mutations'
import { getUser } from '@/graphql/services/users.queries'
import useAuthActions from '@/hooks/use-auth-actions'
import useForm from '@/hooks/use-form'
import { User } from '@/interfaces'
import { validateToken } from '@/utils'

interface Props {
  user: User
  token: string
}

type FormData = {
  name: string
  price: string
  existence: string
}

export default function NewProductPage({ token, user }: Props) {
  const router = useRouter()
  const { login } = useAuthActions()
  login(user, token)

  const { formData, errors, submitError, setSubmitError, handleChange } = useForm<FormData>({
    initialValues: {
      name: '',
      price: '',
      existence: ''
    }
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (Object.values(errors).some(error => error !== undefined)) {
      setSubmitError('Por favor, complete todos los campos')
      return
    }

    try {
      const { name, price, existence } = formData
      await newProduct(name, Number(existence), Number(price))

      router.replace('/products')
    } catch (error: any) {
      setSubmitError((error as ApolloError).graphQLErrors[0].message)
    }
  }

  return (
    <MainLayout title='New Product' pageDescription='CRM clients for company administration'>
      <h1 className='text-3xl text-center text-slate-900 first-letter:text-4xl'>
        Nuevo producto
      </h1>

      <form className='block w-1/2 mx-auto mt-8 bg-white py-4 px-6 shadow-lg' onSubmit={handleSubmit}>
        <div className='mb-4'>
          {submitError && <SubmitError message={submitError} />}
        </div>

        <InputWrapper inputFor='name' label='Nombre'>
          <input
            type='text'
            id='name'
            name='name'
            placeholder='Nombre del producto...'
            className='w-full border-gray-400 border outline-none rounded-md text-gray-800 py-2 px-4'
            value={formData.name}
            onChange={handleChange}
          />
        </InputWrapper>

        <InputWrapper inputFor='price' label='Precio'>
          <input
            type='text'
            id='price'
            name='price'
            placeholder='Precio del producto...'
            className='w-full border-gray-400 border outline-none rounded-md text-gray-800 py-2 px-4'
            value={formData.price}
            onChange={handleChange}
          />
        </InputWrapper>

        <InputWrapper inputFor='existence' label='Existencias'>
          <input
            type='text'
            id='existence'
            name='existence'
            placeholder='Existencias del producto...'
            className='w-full border-gray-400 border outline-none rounded-md text-gray-800 py-2 px-4'
            value={formData.existence}
            onChange={handleChange}
          />
        </InputWrapper>

        <div className='flex justify-center items-center gap-4'>
          <button
            className='mt-4 w-full bg-slate-300 py-2 px-4 font-bold text-lg text-center text-slate-900 rounded-md shadow-lg transition hover:scale-95'
            type='button'
            onClick={() => router.push('/products')}
          >
            Cancelar
          </button>

          <button
            className='mt-4 w-full bg-slate-900 py-2 px-4 font-bold text-lg text-center text-white rounded-md shadow-lg transition hover:scale-95'
            type='submit'
          >
            Registrar producto
          </button>
        </div>
      </form>
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
