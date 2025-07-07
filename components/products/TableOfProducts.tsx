import { useQuery } from '@apollo/client'
import Swal from 'sweetalert2'

import { Button, LinkButton } from '../ui'
import { GET_PRODUCTS } from '@/graphql/client'
import { deleteProduct } from '@/graphql/services/products.mutations'
import { Product } from '@/interfaces'
import { priceFormatter } from '../../utils/formatters';

export default function TableOfProducts() {
  const { data } = useQuery(GET_PRODUCTS)

  const handleDelete = async (id: string) => {
    Swal.fire({
      title: 'Estas seguro?',
      text: 'Tu no podrás revertir esta operación!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteProduct(id)
          .then(() => {
            Swal.fire({
              title: 'Eliminado!',
              text: 'Producto eliminado con éxito.',
              icon: 'success'
            })
          })
          .catch(() => {
            Swal.fire({
              title: 'Error!',
              text: 'Ocurrió un error al eliminar el producto.',
              icon: 'error'
            })
          })
      }
    })
  }

  return (
    <table className='w-full mt-6 bg-white'>
      <thead className='bg-slate-900 text-left'>
        <tr className='border-[0.5px] border-slate-900'>
          <th className='font-medium text-lg p-1 text-white'>
            Nombre
          </th>

          <th className='font-medium text-lg p-1 text-white'>
            Existencias
          </th>

          <th className='font-medium text-lg p-1 text-white'>
            Precio
          </th>

          <th className='font-medium text-lg p-1 text-white'>
            Acciones
          </th>
        </tr>
      </thead>

      <tbody>
        {data && (data.getProducts as Product[])?.map((product) => (
          <tr key={product.id} className='border-[0.5px] text-left'>
            <td className='p-1'>
              {product.name}
            </td>

            <td className='p-1'>
              {product.existence}
            </td>

            <td className='p-1'>
              {priceFormatter.format(product.price)}
            </td>

            <td className='p-1 py-2 flex gap-2 justify-start'>
              <Button size='sm' bgColor='bg-red-700' onClick={() => handleDelete(product.id)}>
                Eliminar
              </Button>
              
              <LinkButton to={`/update-product/${product.id}`} size='sm' bgColor='bg-orange-500'>
                Editar
              </LinkButton>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
