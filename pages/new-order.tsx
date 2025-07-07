import { ApolloError, useQuery } from '@apollo/client'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'

import { MainLayout } from '@/components/layouts'
import { SubmitError } from '@/components/ui'
import { GET_CLIENTS_SELLER, GET_PRODUCTS } from '@/graphql/client'
import { newOrder } from '@/graphql/services/orders.mutations'
import { getUser } from '@/graphql/services/users.queries'
import useAuthActions from '@/hooks/use-auth-actions'
import { Client, OrderData, Product, User } from '@/interfaces'
import { validateToken } from '@/utils'
import { priceFormatter } from '@/utils/formatters'

interface Props {
  user: User
  token: string
}

export default function NewOrderPage({ token, user }: Props) {
  const router = useRouter()
  const { login } = useAuthActions()
  login(user, token)

  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<{ product: Product, quantity: number }[]>([])
  const [clientId, setClientId] = useState('default')
  const [productSelected, setProductSelected] = useState('default')
  const [error, setError] = useState('')
  const [total, setTotal] = useState(0)

  const { data: clients } = useQuery(GET_CLIENTS_SELLER, {
    context: {
      headers: {
        Authorization: token
      }
    }
  })

  const { data: products } = useQuery(GET_PRODUCTS)

  useEffect(() => {
    if (products) {
      setAllProducts(products.getProducts as Product[])
      setFilteredProducts(products.getProducts as Product[])
    }
  }, [products])

  useEffect(() => {
    setTotal(selectedProducts.reduce((acc, el) => {
      return acc + (el.product.price * el.quantity)
    }, 0))
  }, [selectedProducts])

  const handleSelectProducts = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target
    const productFound = allProducts.find((p) => p.id === value)

    if (productFound) {
      setFilteredProducts((prev) => prev.filter((p) => p.id !== value))
      setSelectedProducts((prev) => [...prev, { product: productFound, quantity: 1 }])
    }
    
    setProductSelected('default')
  }

  const handleRemoveSelectProduct = (product: Product) => {
    setFilteredProducts((prev) => [...prev, product])
    setSelectedProducts((prev) => prev.filter((p) => p.product.id !== product.id))
  }

  const createHandleChangeProductQuantity = (product: Product) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target

    setSelectedProducts((prev) => prev.map((p) => {
      if (p.product.id === product.id) {
        return {
          product,
          quantity: Number(value) > 1 ? Number(value) : 1
        }
      }

      return p
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (clientId === 'default') {
      setError('Debes seleccionar un cliente')
      return
    }

    if (selectedProducts.length === 0) {
      setError('Debes seleccionar al menos un producto')
      return
    }

    try {
      const orderData: OrderData[] = selectedProducts.map(({ product, quantity }) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity
      }))

      await newOrder(token, clientId, total, 'PENDING', orderData)

      Swal.fire({
        title: 'Venta exitosa!',
        text: 'Pedido registrado con éxito.',
        icon: 'success'
      }).then((result) => {
        if (result.isConfirmed || result.isDismissed) {
          router.replace('/orders')
        }
      })
    } catch (error: any) {
      setError((error as ApolloError).graphQLErrors[0].message)
    }
  }

  return (
    <MainLayout title='New Order' pageDescription='CRM clients for company administration'>
      <h1 className='text-3xl text-slate-900 first-letter:text-4xl text-center'>
        Crear nuevo pedido
      </h1>

      <form className='block w-1/2 mx-auto mt-8 py-4 px-6' onSubmit={handleSubmit}>
        <div className='mb-4'>
          {error && <SubmitError message={error} />}
        </div>
        
        <div className='mb-8'>
          <label
            htmlFor='client'
            className='block bg-white py-3 px-2 border-l-4 border-l-slate-900'
          >
            1.- Asigna un cliente al pedido
          </label>

          <select
            name='client'
            id='client'
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className='w-full mt-2 py-2 px-4 border border-gray-300 rounded-md outline-none'
          >
            <option value='default' className='font-bold text-center'>
              -- Selecciona un cliente del listado --
            </option>

            {clients && (clients.getClientsSeller as Client[])?.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} {client.lastName}
              </option>
            ))}
          </select>
        </div>
        
        <div className='mb-8'>
          <label
            htmlFor='products'
            className='block bg-white py-3 px-2 border-l-4 border-l-slate-900'
          >
            2.- Selecciona los productos del pedido
          </label>

          <select
            name='products'
            id='products'
            value={productSelected}
            onChange={handleSelectProducts}
            className='w-full mt-2 py-2 px-4 border border-gray-300 rounded-md outline-none'
          >
            <option value='default' className='font-bold text-center'>
              -- Selecciona productos del listado --
            </option>

            {filteredProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - {product.existence} disponibles
              </option>
            ))}
          </select>

          {selectedProducts.map(({ product }) => (
            <article
              key={product.id + product.name}
              className='w-[80%] mx-auto flex my-3 justify-center items-center gap-2'
            >
              <p className='font-medium flex-1'>
                {product.name} - {product.existence} disponibles
              </p>

              <button
                type='button'
                className='py-0.5 px-2 bg-red-400 rounded-md text-sm font-medium shadow-sm'
                onClick={() => handleRemoveSelectProduct(product)}
              >
                Quitar
              </button>
            </article>
          ))}
        </div>
        
        <div className='mb-8'>
          <label
            htmlFor='products'
            className='block bg-white py-3 px-2 border-l-4 border-l-slate-900'
          >
            3.- Ajustar las cantidades de los productos
          </label>

          {selectedProducts.map(({ product, quantity }) => (
            <article
              key={product.id + quantity}
              className='w-full my-4 flex justify-between items-center gap-2'
            >
              <div>
                <p className='font-medium'>
                  {product.name}
                </p>
  
                <p className='font-medium'>
                  {priceFormatter.format(product.price)}
                </p>
              </div>

              <input
                type='number'
                value={quantity}
                onChange={createHandleChangeProductQuantity(product)}
                className='py-1 px-3 border border-gray-300 rounded-md outline-none text-lg text-center'
              />
            </article>
          ))}
        </div>

        <div className='w-full py-3 px-4 bg-white flex justify-between items-center gap-2 shadow-md rounded-md'>
          <p className='text-xl font-bold'>
            Total a pagar:
          </p>

          <p className='text-xl'>
            {priceFormatter.format(total)}
          </p>
        </div>

        <div className='flex justify-center items-center gap-4'>
          <button
            className='mt-4 w-full bg-slate-300 py-2 px-4 font-bold text-lg text-center text-slate-900 rounded-md shadow-lg transition hover:scale-95'
            type='button'
            onClick={() => router.push('/orders')}
          >
            Cancelar
          </button>

          <button
            className='mt-4 w-full bg-slate-900 py-2 px-4 font-bold text-lg text-center text-white rounded-md shadow-lg transition hover:scale-95'
            type='submit'
          >
            Registrar pedido
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
