import { useQuery } from '@apollo/client'
import Swal from 'sweetalert2'

import { GET_USERS } from '@/graphql/client'
import { deleteUser } from '@/graphql/services/users.mutations'
import { User } from '@/interfaces'
import { Button, LinkButton } from '../ui'

export default function TableOfSellers() {
  const { data } = useQuery(GET_USERS)

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
        deleteUser(id)
          .then(() => {
            Swal.fire({
              title: 'Eliminado!',
              text: 'Vendedor eliminado con éxito.',
              icon: 'success'
            })
          })
          .catch(() => {
            Swal.fire({
              title: 'Error!',
              text: 'Ocurrió un error al eliminar el vendedor.',
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
            Apellidos
          </th>

          <th className='font-medium text-lg p-1 text-white'>
            Email
          </th>

          <th className='font-medium text-lg p-1 text-white'>
            Acciones
          </th>
        </tr>
      </thead>

      <tbody>
        {data && (data.getUsers as User[])?.map((user) => (
          <tr key={user.id} className='border-[0.5px]'>
            <td className='p-1'>
              {user.name}
            </td>

            <td className='p-1'>
              {user.lastName}
            </td>

            <td className='p-1'>
              {user.email}
            </td>

            <td className='p-1 py-2 flex gap-2 justify-start'>
              <Button size='sm' bgColor='bg-red-700' onClick={() => handleDelete(user.id)}>
                Eliminar
              </Button>
              
              <LinkButton to={`/update-seller/${user.id}`} size='sm' bgColor='bg-orange-500'>
                Editar
              </LinkButton>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
