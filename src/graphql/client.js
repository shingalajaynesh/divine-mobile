import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  // Note: Replace with your actual local machine IP address for Expo physical device/emulator testing
  uri: process.env.EXPO_PUBLIC_GRAPHQL_API_URL || 'http://192.168.1.100:4000/graphql',
});

let getClerkTokenFn = null;

export const setClerkTokenProvider = (fn) => {
  getClerkTokenFn = fn;
};

const authLink = setContext(async (_, { headers }) => {
  let token = null;
  if (getClerkTokenFn) {
    try {
      token = await getClerkTokenFn();
    } catch (e) {
      console.warn('Error fetching Clerk token:', e);
    }
  }

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
export default client;
