import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  // Note: Replace with your actual local machine IP address for Expo physical device/emulator testing
  uri: process.env.EXPO_PUBLIC_GRAPHQL_API_URL || 'http://192.168.1.100:4000/graphql',
});

import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

import { auth } from '../config/firebase.js';

let deviceId = null;
const getDeviceId = async () => {
  if (deviceId) return deviceId;
  try {
    deviceId = await SecureStore.getItemAsync('divine_device_id');
    if (!deviceId) {
      deviceId = Crypto.randomUUID();
      await SecureStore.setItemAsync('divine_device_id', deviceId);
    }
  } catch (e) {
    deviceId = 'mobile-' + Math.random().toString(36).substring(2);
  }
  return deviceId;
};

const getDeviceName = () => {
  return `${Platform.OS === 'ios' ? 'iPhone/iPad' : 'Android Mobile'}`;
};

const authLink = setContext(async (_, { headers }) => {
  let token = null;
  try {
    if (auth.currentUser) {
      token = await auth.currentUser.getIdToken();
    }
  } catch (e) {
    console.warn('Error fetching Firebase token:', e);
  }

  const devId = await getDeviceId();
  const devName = getDeviceName();

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'x-device-id': devId,
      'x-device-name': devName,
      'x-device-type': 'mobile',
    },
  };
});

const cache = new InMemoryCache();

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
export default client;
