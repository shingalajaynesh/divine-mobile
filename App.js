import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClerkProvider, SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-expo';
import { ApolloProvider, useQuery, useMutation, gql } from '@apollo/client';
import { client, setClerkTokenProvider } from './src/graphql/client.js';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

// Modular Imports
import { styles } from './src/components/styles.js';
import { ME_QUERY, SAVE_ONBOARDING_MUTATION } from './src/graphql/operations.js';
import { MOBILE_TRANSLATIONS } from './src/translations/translations.js';

// Components & Views
import ApolloUserProfile from './src/components/ApolloUserProfile.js';
import ClerkSignInModal from './src/components/ClerkSignInModal.js';
import MobileOnboardingCalculator from './src/views/OnboardingCalculator.js';
import MobileTodayDashboard from './src/views/TodayDashboard.js';
import MobileLibrary from './src/views/ContentLibrary.js';
import MobileBabyTracker from './src/views/BabyGrowthTracker.js';
import MobileForum from './src/views/CommunityForum.js';
import MobileLiveClasses from './src/views/LiveClasses.js';
import MobileSettings from './src/views/Settings.js';

// Warm up the browser for better performance on Android
WebBrowser.maybeCompleteAuthSession();

// SECURE TOKEN CACHE FOR CLERK MOBILE SESSIONS
const tokenCache = {
  async getToken(key) {
    try {
      const item = await SecureStore.getItemAsync(key);
      return item;
    } catch (err) {
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_placeholder";

function MobileAppContent() {
  const { signOut } = useAuth();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('today');

  const { data: meData, loading: meLoading, refetch: refetchMe } = useQuery(ME_QUERY);

  const [syncUser] = useMutation(gql`
    mutation SyncUser($payload: String!) {
      syncUser(clerkUserPayload: $payload) {
        id
        emailAddress
      }
    }
  `, {
    onCompleted: () => refetchMe()
  });

  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (clerkLoaded && clerkUser && !meLoading) {
      const dbUser = meData?.me;
      if (!dbUser && !syncing) {
        setSyncing(true);
        const payload = {
          id: clerkUser.id,
          first_name: clerkUser.firstName,
          last_name: clerkUser.lastName,
          image_url: clerkUser.imageUrl,
          email_addresses: clerkUser.emailAddresses.map(email => ({
            email_address: email.emailAddress
          }))
        };
        syncUser({ variables: { payload: JSON.stringify(payload) } })
          .then(() => setSyncing(false))
          .catch((err) => {
            console.error('Failed to sync user on mobile:', err);
            setSyncing(false);
          });
      }
    }
  }, [clerkLoaded, clerkUser, meData, meLoading, syncing]);

  const [saveOnboarding] = useMutation(SAVE_ONBOARDING_MUTATION, {
    onCompleted: () => refetchMe()
  });

  const user = meData?.me;
  const lang = user?.language || 'en';
  const t = MOBILE_TRANSLATIONS[lang] || MOBILE_TRANSLATIONS.en;

  return (
    <LinearGradient
      colors={['#fef3c7', '#fff1f2', '#ffedd5']}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        
        {/* Header / Navbar */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require('./assets/logo.jpg')}
              style={styles.logoImage}
            />
            <View>
              <Text style={styles.headerTitle}>Divine Garbh Sanskar</Text>
              <Text style={styles.headerSubtitle}>Nurturing Life Within</Text>
            </View>
          </View>

          <SignedIn>
            <View style={styles.headerRight}>
              <ApolloUserProfile user={user} />
              <TouchableOpacity style={styles.signOutIconButton} onPress={() => signOut()}>
                <Text style={styles.signOutIconText}>🚪</Text>
              </TouchableOpacity>
            </View>
          </SignedIn>
          
          <SignedOut>
            <TouchableOpacity style={styles.headerSignInButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.headerSignInButtonText}>Sign In</Text>
            </TouchableOpacity>
          </SignedOut>
        </View>

        {/* Clerk Sign-In Modal */}
        <ClerkSignInModal visible={modalVisible} onClose={() => setModalVisible(false)} />

        {/* Main Content */}
        <SignedIn>
          {meLoading ? (
            <View style={styles.centeredContainer}>
              <ActivityIndicator size="large" color="#f97316" />
            </View>
          ) : user && !user.lmpDate ? (
            /* Onboarding Pregnancy Calculator */
            <MobileOnboardingCalculator saveOnboarding={saveOnboarding} t={t} />
          ) : user ? (
            /* Main Dashboard Views based on Active Tab */
            <View style={{ flex: 1 }}>
              <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
              >
                {activeTab === 'today' && <MobileTodayDashboard user={user} t={t} />}
                {activeTab === 'library' && <MobileLibrary t={t} />}
                {activeTab === 'baby' && <MobileBabyTracker user={user} t={t} />}
                {activeTab === 'forum' && <MobileForum t={t} />}
                {activeTab === 'classes' && <MobileLiveClasses t={t} />}
                {activeTab === 'settings' && <MobileSettings user={user} t={t} refetch={refetchMe} />}
              </ScrollView>

              {/* Bottom Tab Bar */}
              <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('today')}>
                  <Text style={[styles.tabIcon, activeTab === 'today' && styles.tabActiveText]}>📅</Text>
                  <Text style={[styles.tabLabel, activeTab === 'today' && styles.tabActiveText]}>{t.tab_today}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('library')}>
                  <Text style={[styles.tabIcon, activeTab === 'library' && styles.tabActiveText]}>📚</Text>
                  <Text style={[styles.tabLabel, activeTab === 'library' && styles.tabActiveText]}>{t.tab_library}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('baby')}>
                  <Text style={[styles.tabIcon, activeTab === 'baby' && styles.tabActiveText]}>👶</Text>
                  <Text style={[styles.tabLabel, activeTab === 'baby' && styles.tabActiveText]}>{t.tab_baby}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('forum')}>
                  <Text style={[styles.tabIcon, activeTab === 'forum' && styles.tabActiveText]}>💬</Text>
                  <Text style={[styles.tabLabel, activeTab === 'forum' && styles.tabActiveText]}>{t.tab_forum}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('classes')}>
                  <Text style={[styles.tabIcon, activeTab === 'classes' && styles.tabActiveText]}>👩‍⚕️</Text>
                  <Text style={[styles.tabLabel, activeTab === 'classes' && styles.tabActiveText]}>{t.tab_classes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('settings')}>
                  <Text style={[styles.tabIcon, activeTab === 'settings' && styles.tabActiveText]}>⚙️</Text>
                  <Text style={[styles.tabLabel, activeTab === 'settings' && styles.tabActiveText]}>{t.tab_settings}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </SignedIn>

        <SignedOut>
          <ScrollView 
            contentContainerStyle={styles.signedOutScrollContent} 
            showsVerticalScrollIndicator={false}
          >
            {/* Welcome / Landing View */}
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeBadge}>
                <Text style={styles.welcomeBadgeText}>{t.welcome}</Text>
              </View>
              <Text style={styles.welcomeTitle}>
                Begin Your Sacred Journey of{' '}
                <Text style={styles.welcomeTitleHighlight}>Conscious Pregnancy</Text>
              </Text>
              <Text style={styles.welcomeDesc}>{t.journey_desc}</Text>

              <TouchableOpacity style={styles.welcomeButton} onPress={() => setModalVisible(true)}>
                <LinearGradient
                  colors={['#f97316', '#f43f5e']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.welcomeButtonGradient}
                >
                  <Text style={styles.welcomeButtonText}>Access Your Dashboard</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SignedOut>
      </SafeAreaView>
    </LinearGradient>
  );
}

export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <ApolloProvider client={client}>
        <ApolloTokenBridge />
        <MobileAppContent />
      </ApolloProvider>
    </ClerkProvider>
  );
}

// Sub-component to sync Clerk authentication token with Apollo Client
function ApolloTokenBridge() {
  const { getToken } = useAuth();
  
  useEffect(() => {
    setClerkTokenProvider(getToken);
  }, [getToken]);

  return null;
}
