import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ClerkProvider, SignedIn, SignedOut, useAuth, useUser } from '@clerk/clerk-expo';
import { ApolloProvider, gql, useMutation, useQuery } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { client, setClerkTokenProvider } from './src/graphql/client.js';
import { ME_QUERY, SAVE_ONBOARDING_MUTATION } from './src/graphql/operations.js';
import { MOBILE_TRANSLATIONS } from './src/translations/translations.js';
import ClerkSignInModal from './src/components/ClerkSignInModal.js';
import MobileOnboardingCalculator from './src/views/OnboardingCalculator.js';
import MobileTodayDashboard from './src/views/TodayDashboard.js';
import MobileLibrary from './src/views/ContentLibrary.js';
import MobileBabyTracker from './src/views/BabyGrowthTracker.js';
import MobileForum from './src/views/CommunityForum.js';
import MobileLiveClasses from './src/views/LiveClasses.js';
import MobileSettings from './src/views/Settings.js';
import { appStyles } from './src/theme/appStyles.js';
import { colors } from './src/theme/theme.js';

WebBrowser.maybeCompleteAuthSession();

const tokenCache = {
  getToken: (key) => SecureStore.getItemAsync(key),
  saveToken: (key, value) => SecureStore.setItemAsync(key, value),
};

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder';

const TABS = [
  { id: 'today', icon: 'today-outline', activeIcon: 'today', label: 'Today' },
  { id: 'library', icon: 'library-outline', activeIcon: 'library', label: 'Library' },
  { id: 'baby', icon: 'heart-outline', activeIcon: 'heart', label: 'Baby' },
  { id: 'forum', icon: 'chatbubbles-outline', activeIcon: 'chatbubbles', label: 'Community' },
];

function MobileAppContent() {
  const { signOut } = useAuth();
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const [signInOpen, setSignInOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('today');
  const { data: meData, loading: meLoading, refetch: refetchMe } = useQuery(ME_QUERY);
  const [syncUser] = useMutation(gql`mutation SyncUser { syncUser { id emailAddress } }`, { onCompleted: () => refetchMe() });
  const [saveOnboarding] = useMutation(SAVE_ONBOARDING_MUTATION, { onCompleted: () => refetchMe() });
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (clerkLoaded && clerkUser && !meLoading && !meData?.me && !syncing) {
      setSyncing(true);
      syncUser().finally(() => setSyncing(false));
    }
  }, [clerkLoaded, clerkUser, meData, meLoading, syncing, syncUser]);

  const user = meData?.me;
  const lang = user?.language || 'en';
  const t = MOBILE_TRANSLATIONS[lang] || MOBILE_TRANSLATIONS.en;
  const profileInitial = (user?.displayName || clerkUser?.firstName || 'M').charAt(0).toUpperCase();

  const screen = useMemo(() => ({
    today: <MobileTodayDashboard user={user} t={t} />,
    library: <MobileLibrary t={t} />,
    baby: <MobileBabyTracker user={user} t={t} />,
    forum: <MobileForum t={t} />,
    classes: <MobileLiveClasses t={t} />,
    settings: <MobileSettings user={user} t={t} refetch={refetchMe} />,
  }[activeTab]), [activeTab, refetchMe, t, user]);

  const chooseMore = (tab) => {
    setActiveTab(tab);
    setMoreOpen(false);
  };

  return (
    <View style={appStyles.root}>
      <StatusBar style="dark" backgroundColor={colors.paper} />
      <SafeAreaView style={appStyles.safeArea} edges={['top', 'left', 'right']}>
        <View style={appStyles.header}>
          <View style={appStyles.brand}>
            <Image source={require('./assets/logo.jpg')} style={appStyles.logo} />
            <View>
              <Text style={appStyles.brandTitle}>Divine Garbh Sanskar</Text>
              <Text style={appStyles.brandSubtitle}>Motherhood companion</Text>
            </View>
          </View>
          <SignedIn>
            <TouchableOpacity style={appStyles.profileButton} onPress={() => setMoreOpen(true)} accessibilityLabel="Open account menu">
              <Text style={appStyles.profileInitial}>{profileInitial}</Text>
            </TouchableOpacity>
          </SignedIn>
          <SignedOut>
            <TouchableOpacity style={appStyles.profileButton} onPress={() => setSignInOpen(true)} accessibilityLabel="Sign in">
              <Ionicons name="log-in-outline" size={20} color={colors.maroon} />
            </TouchableOpacity>
          </SignedOut>
        </View>

        <ClerkSignInModal visible={signInOpen} onClose={() => setSignInOpen(false)} />

        <SignedIn>
          {meLoading || syncing ? (
            <View style={appStyles.loading}><ActivityIndicator size="large" color={colors.maroon} /><Text style={appStyles.loadingText}>Preparing your dashboard…</Text></View>
          ) : user && !user.lmpDate ? (
            <MobileOnboardingCalculator saveOnboarding={saveOnboarding} t={t} />
          ) : user ? (
            <View style={appStyles.page}>
              <ScrollView contentContainerStyle={appStyles.scroll} showsVerticalScrollIndicator={false}>{screen}</ScrollView>
              <View style={appStyles.tabBar}>
                {TABS.map((tab) => {
                  const active = tab.id === activeTab;
                  return (
                    <TouchableOpacity key={tab.id} style={[appStyles.tab, active && appStyles.tabActive]} onPress={() => setActiveTab(tab.id)} accessibilityRole="button" accessibilityState={{ selected: active }}>
                      <Ionicons name={active ? tab.activeIcon : tab.icon} size={20} color={active ? colors.maroon : colors.muted} />
                      <Text style={[appStyles.tabLabel, active && appStyles.tabLabelActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity style={[appStyles.tab, ['classes', 'settings'].includes(activeTab) && appStyles.tabActive]} onPress={() => setMoreOpen(true)}>
                  <Ionicons name="grid-outline" size={20} color={['classes', 'settings'].includes(activeTab) ? colors.maroon : colors.muted} />
                  <Text style={[appStyles.tabLabel, ['classes', 'settings'].includes(activeTab) && appStyles.tabLabelActive]}>More</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </SignedIn>

        <SignedOut>
          <ScrollView contentContainerStyle={appStyles.welcome}>
            <Image source={require('./assets/logo.jpg')} style={appStyles.welcomeLogo} />
            <Text style={appStyles.welcomeEyebrow}>{t.welcome}</Text>
            <Text style={appStyles.welcomeTitle}>A calmer, more organised pregnancy journey.</Text>
            <Text style={appStyles.welcomeText}>{t.journey_desc}</Text>
            <TouchableOpacity style={appStyles.primaryButton} onPress={() => setSignInOpen(true)}>
              <Text style={appStyles.primaryButtonText}>Sign in to your dashboard</Text>
            </TouchableOpacity>
            <Text style={appStyles.version}>Divine Mobile · v1.1.0</Text>
          </ScrollView>
        </SignedOut>

        <Modal visible={moreOpen} transparent animationType="slide" onRequestClose={() => setMoreOpen(false)}>
          <Pressable style={appStyles.moreBackdrop} onPress={() => setMoreOpen(false)}>
            <Pressable style={appStyles.moreSheet} onPress={(event) => event.stopPropagation()}>
              <View style={appStyles.sheetHandle} />
              <Text style={appStyles.sheetTitle}>More</Text>
              <TouchableOpacity style={appStyles.moreAction} onPress={() => chooseMore('classes')}>
                <Ionicons name="videocam-outline" size={22} color={colors.maroon} /><Text style={appStyles.moreActionText}>Live classes</Text><Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </TouchableOpacity>
              <TouchableOpacity style={appStyles.moreAction} onPress={() => chooseMore('settings')}>
                <Ionicons name="settings-outline" size={22} color={colors.maroon} /><Text style={appStyles.moreActionText}>Preferences</Text><Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </TouchableOpacity>
              <TouchableOpacity style={[appStyles.moreAction, appStyles.signOutAction]} onPress={() => { setMoreOpen(false); signOut(); }}>
                <Ionicons name="log-out-outline" size={22} color={colors.error} /><Text style={[appStyles.moreActionText, { color: colors.error }]}>Sign out</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

function ApolloTokenBridge() {
  const { getToken } = useAuth();
  useEffect(() => setClerkTokenProvider(getToken), [getToken]);
  return null;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
        <ApolloProvider client={client}>
          <ApolloTokenBridge />
          <MobileAppContent />
        </ApolloProvider>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}
