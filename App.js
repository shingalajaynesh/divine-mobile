import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Alert, Image, Linking, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ApolloProvider, gql, useMutation, useQuery } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { client } from './src/graphql/client.js';
import { ME_QUERY, SAVE_ONBOARDING_MUTATION } from './src/graphql/operations.js';
import { MOBILE_TRANSLATIONS } from './src/translations/translations.js';
import FirebaseSignInModal from './src/components/FirebaseSignInModal.js';
import { auth } from './src/config/firebase.js';
import MobileOnboardingCalculator from './src/views/OnboardingCalculator.js';
import MobileTodayDashboard from './src/views/TodayDashboard.js';
import MobileLibrary from './src/views/ContentLibrary.js';
import MobileBabyTracker from './src/views/BabyGrowthTracker.js';
import MobileForum from './src/views/CommunityForum.js';
import MobileLiveClasses from './src/views/LiveClasses.js';
import MobileSettings from './src/views/Settings.js';
import MobileProgrammes from './src/views/Programmes.js';
import MobileNotificationCentre from './src/views/NotificationCentre.js';
import MobileWeeklyReport from './src/views/WeeklyReport.js';
import MobileDietPlanner from './src/views/DietPlanner.js';
import MobileExpertConsultation from './src/views/ExpertConsultation.js';
import MobileVitalsTracker from './src/views/VitalsTracker.js';
import MobileSupportHub from './src/views/SupportHub.js';
import MobileStoreBoutique from './src/views/StoreBoutique.js';
import { appStyles } from './src/theme/appStyles.js';
import { colors } from './src/theme/theme.js';

const SUPPORT_URL = 'https://wa.me/919638484545?text=Hello%20Divine%20Garbh%20Sanskar%2C%20I%20need%20help.';
const TABS = [
  { id: 'home', icon: 'home-outline', activeIcon: 'home', label: 'Home' },
  { id: 'learn', icon: 'book-outline', activeIcon: 'book', label: 'Learn' },
  { id: 'activity', icon: 'sparkles-outline', activeIcon: 'sparkles', label: 'Activity' },
  { id: 'tools', icon: 'briefcase-outline', activeIcon: 'briefcase', label: 'Tools' },
  { id: 'more', icon: 'grid-outline', activeIcon: 'grid', label: 'More' },
];

function MobileAppContent() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const { data: meData, loading: meLoading, refetch: refetchMe } = useQuery(ME_QUERY);
  const [syncUser] = useMutation(gql`mutation SyncUser { syncUser { id emailAddress } }`, { onCompleted: () => refetchMe() });
  const [saveOnboarding] = useMutation(SAVE_ONBOARDING_MUTATION, { onCompleted: () => refetchMe() });
  const [syncing, setSyncing] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (user) => {
    setFirebaseUser(user);
    setAuthLoaded(true);
  }), []);

  useEffect(() => {
    if (authLoaded && firebaseUser && !meLoading && !meData?.me && !syncing) {
      setSyncing(true);
      syncUser().finally(() => setSyncing(false));
    }
  }, [authLoaded, firebaseUser, meData, meLoading, syncing, syncUser]);

  const user = meData?.me;
  const isSignedIn = Boolean(firebaseUser);
  const lang = user?.language || 'en';
  const t = MOBILE_TRANSLATIONS[lang] || MOBILE_TRANSLATIONS.en;
  const displayName = user?.displayName || firebaseUser?.displayName || 'Divine Mother';

  const navigate = (tab) => setActiveTab(tab);
  const screen = useMemo(() => ({
    home: <MobileTodayDashboard user={user} t={t} onNavigate={navigate} />,
    learn: <MobileLibrary t={t} lang={lang} />,
    activity: <MobileProgrammes />,
    baby: <MobileBabyTracker user={user} t={t} />,
    tools: <MobileLiveClasses user={user} />,
    more: <MobileSettings user={user} t={t} refetch={refetchMe} onNavigate={navigate} onSignOut={() => signOut(auth)} />,
    community: <MobileForum user={user} />,
    notifications: <MobileNotificationCentre />,
    weeklyReport: <MobileWeeklyReport user={user} lang={lang} onNavigate={navigate} />,
    dietPlanner: <MobileDietPlanner user={user} />,
    expertConsultation: <MobileExpertConsultation user={user} />,
    wellnessTracker: <MobileVitalsTracker user={user} />,
    supportHub: <MobileSupportHub user={user} />,
    storeBoutique: <MobileStoreBoutique user={user} />,
  }[activeTab]), [activeTab, refetchMe, t, user, lang]);

  const shareApp = () => Share.share({
    message: 'Join me on Divine Garbh Sanskar for a mindful pregnancy journey: https://www.thedivinegarbhsanskar.com',
  });

  return (
    <View style={appStyles.root}>
      <StatusBar style="dark" backgroundColor={colors.paper} />
      <SafeAreaView style={appStyles.safeArea} edges={['top', 'left', 'right']}>
        {isSignedIn && user ? (
          <View style={appStyles.header}>
            <TouchableOpacity style={appStyles.identity} onPress={() => setActiveTab('more')} accessibilityLabel="Open profile">
              <Image source={require('./assets/logo.jpg')} style={appStyles.avatar} />
              <View style={appStyles.identityCopy}>
                <Text style={appStyles.greeting}>Namaste, good to see you</Text>
                <Text style={appStyles.personName} numberOfLines={1}>{displayName}</Text>
              </View>
            </TouchableOpacity>
            <View style={appStyles.headerActions}>
              <TouchableOpacity style={appStyles.iconButton} onPress={shareApp} accessibilityLabel="Share Divine app">
                <Ionicons name="share-social-outline" size={22} color={colors.maroon} />
              </TouchableOpacity>
              <TouchableOpacity style={appStyles.iconButton} onPress={() => setActiveTab('notifications')} accessibilityLabel="Notifications">
                <Ionicons name="notifications-outline" size={22} color={colors.maroon} />
                <View style={appStyles.notificationDot} />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <FirebaseSignInModal visible={signInOpen} onClose={() => setSignInOpen(false)} />

        {!authLoaded || (isSignedIn && (meLoading || syncing)) ? (
          <View style={appStyles.loading}><ActivityIndicator size="large" color={colors.maroon} /><Text style={appStyles.loadingText}>Preparing your Divine space…</Text></View>
        ) : !isSignedIn ? (
          <ScrollView contentContainerStyle={appStyles.welcome}>
            <Image source={require('./assets/logo.jpg')} style={appStyles.welcomeLogo} />
            <Text style={appStyles.welcomeEyebrow}>{t.welcome}</Text>
            <Text style={appStyles.welcomeTitle}>A thoughtful companion for pregnancy and parenthood.</Text>
            <Text style={appStyles.welcomeText}>{t.journey_desc}</Text>
            <TouchableOpacity style={appStyles.primaryButton} onPress={() => setSignInOpen(true)}><Text style={appStyles.primaryButtonText}>Continue to Divine</Text></TouchableOpacity>
            <Text style={appStyles.version}>Divine Mobile · v1.1.0</Text>
          </ScrollView>
        ) : user && !user.lmpDate ? (
          <MobileOnboardingCalculator saveOnboarding={saveOnboarding} t={t} />
        ) : user ? (
          <View style={appStyles.page}>
            <ScrollView contentContainerStyle={appStyles.scroll} showsVerticalScrollIndicator={false}>{screen}</ScrollView>
            {activeTab !== 'more' && (
              <TouchableOpacity style={appStyles.floatingHelp} onPress={() => Linking.openURL(SUPPORT_URL)} accessibilityLabel="Chat with support">
                <Ionicons name="chatbubble-ellipses" size={22} color={colors.paper} />
              </TouchableOpacity>
            )}
            <View style={appStyles.tabBar}>
              {TABS.map((tab) => {
                const active = tab.id === activeTab;
                return (
                  <TouchableOpacity key={tab.id} style={appStyles.tab} onPress={() => setActiveTab(tab.id)} accessibilityRole="button" accessibilityState={{ selected: active }}>
                    <View style={[appStyles.tabIcon, active && appStyles.tabIconActive]}><Ionicons name={active ? tab.activeIcon : tab.icon} size={21} color={active ? colors.maroon : 'rgba(255,255,255,.64)'} /></View>
                    <Text style={[appStyles.tabLabel, active && appStyles.tabLabelActive]}>{tab.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

export default function App() {
  return <SafeAreaProvider><ApolloProvider client={client}><MobileAppContent /></ApolloProvider></SafeAreaProvider>;
}
