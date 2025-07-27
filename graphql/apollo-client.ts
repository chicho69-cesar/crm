import { ApolloClient, InMemoryCache } from '@apollo/client'

export const client = new ApolloClient({
  uri: 'https://simple-crm-dusky.vercel.app/api/graphql',
  cache: new InMemoryCache()
})
