import { useQuery } from '@apollo/client'
import Swal from 'sweetalert2'

import { GET_CLIENTS_SELLER } from '@/graphql/client'
import { deleteClient } from '@/graphql/services/clients.mutations'
import { useAppSelector } from '@/hooks/store'
import { Client } from '@/interfaces'
import { Button, LinkButton } from '../ui'

export default function TableOfUser() {
  const { token } = useAppSelector((state) => state.auth)
  const { data } = useQuery(GET_CLIENTS_SELLER, {
    context: {
      headers: {
        Authorization: token
      }
    }
  })

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
        deleteClient(token ?? '', id)
          .then(() => {
            Swal.fire({
              title: 'Eliminado!',
              text: 'Cliente eliminado con éxito.',
              icon: 'success'
            })
          })
          .catch(() => {
            Swal.fire({
              title: 'Error!',
              text: 'Ocurrió un error al eliminar el cliente.',
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
            Empresa
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
        {data && (data.getClientsSeller as Client[])?.map((client) => (
          <tr key={client.id} className='border-[0.5px]'>
            <td className='p-1'>
              {client.name} {client.lastName}
            </td>

            <td className='p-1'>
              {client.company}
            </td>

            <td className='p-1'>
              {client.email}
            </td>

            <td className='p-1 py-2 flex gap-2 justify-start'>
              <Button size='sm' bgColor='bg-red-700' onClick={() => handleDelete(client.id)}>
                Eliminar
              </Button>
              
              <LinkButton to={`/update-client/${client.id}`} size='sm' bgColor='bg-orange-500'>
                Editar
              </LinkButton>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
