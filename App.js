import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { ClerkProvider, SignedIn, SignedOut, useAuth } from '@clerk/clerk-expo';
import { ApolloProvider, useQuery, gql } from '@apollo/client';
import { client, setClerkTokenProvider } from './src/graphql/client.js';

// SECURE TOKEN CACHE FOR CLERK MOBILE SESSIONS
const tokenCache = {
  async getToken(key) {
    try {
      // In production, use expo-secure-store or AsyncStorage
      return null; 
    } catch (err) {
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      return;
    } catch (err) {
      return;
    }
  },
};

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_placeholder";

const ME_QUERY = gql`
  query GetMe {
    me {
      id
      displayName
      emailAddress
      center {
        name
      }
    }
  }
`;

function MobileAppContent() {
  const { getToken, signOut } = useAuth();

  useEffect(() => {
    setClerkTokenProvider(getToken);
  }, [getToken]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Divine Garbh Sanskar</Text>
        <Text style={styles.headerSubtitle}>Conscious Prenatal Journey</Text>
      </View>

      <SignedIn>
        <View style={styles.content}>
          <UserProfileSection />

          <View style={styles.ritualSection}>
            <Text style={styles.sectionTitle}>Today's Rituals</Text>
            
            <View style={styles.card}>
              <Text style={styles.cardEmoji}>🧘‍♀️</Text>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>Garbh Dhyan (Meditation)</Text>
                <Text style={styles.cardDesc}>10 mins of mindful connection with your baby.</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardEmoji}>🎵</Text>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>Garbh Sanskar Music</Text>
                <Text style={styles.cardDesc}>Classical flute tunes for prenatal relaxation.</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.buttonLogout} onPress={() => signOut()}>
            <Text style={styles.buttonLogoutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </SignedIn>

      <SignedOut>
        <View style={styles.contentCenter}>
          <Text style={styles.welcomeText}>Welcome to Divine Garbh Sanskar</Text>
          <Text style={styles.welcomeSub}>Please sign in to access your daily tasks, meditations, and prenatal tracking.</Text>
          
          <TouchableOpacity style={styles.buttonLogin}>
            <Text style={styles.buttonText}>Log In / Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SignedOut>
    </SafeAreaView>
  );
}

function UserProfileSection() {
  const { data, loading } = useQuery(ME_QUERY);

  if (loading) return <Text style={styles.loadingText}>Syncing profile...</Text>;
  if (!data?.me) return <Text style={styles.notSyncedText}>Welcome, Mother! (Not Synced)</Text>;

  return (
    <View style={styles.profileCard}>
      <Text style={styles.profileName}>Hello, {data.me.displayName}</Text>
      <Text style={styles.profileSub}>{data.me.emailAddress}</Text>
      <Text style={styles.profileCenter}>Center: {data.me.center?.name || 'Main'}</Text>
    </View>
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <ApolloProvider client={client}>
        <MobileAppContent />
      </ApolloProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7f6',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ffe5e2',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e0533c',
    marginTop: 20,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#f08b7d',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentCenter: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  welcomeSub: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  buttonLogin: {
    backgroundColor: '#e0533c',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 30,
    shadowColor: '#e0533c',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ffe5e2',
    marginBottom: 20,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  profileSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  profileCenter: {
    fontSize: 12,
    color: '#e0533c',
    fontWeight: '600',
    marginTop: 8,
  },
  ritualSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ffe5e2',
    marginBottom: 12,
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 28,
    marginRight: 15,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  cardDesc: {
    fontSize: 11,
    color: '#666',
    marginTop: 3,
  },
  buttonLogout: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonLogoutText: {
    color: '#f08b7d',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
  },
  notSyncedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
});
