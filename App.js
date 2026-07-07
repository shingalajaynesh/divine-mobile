import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Alert, Image, Linking, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import MobilePartnerDashboard from './src/views/PartnerDashboard.js';
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
import MobileUpgradePlans from './src/views/UpgradePlans.js';
import MobileStaffConsole from './src/views/StaffConsole.js';
import { appStyles } from './src/theme/appStyles.js';
import { colors } from './src/theme/theme.js';

const SUPPORT_URL = 'https://wa.me/919638484545?text=Hello%20Divine%20Garbh%20Sanskar%2C%20I%20need%20help.';

const getTabsForRole = (roleType) => {
  switch (roleType) {
    case 'STAFF':
      return [
        { id: 'staffConsole', icon: 'people-outline', activeIcon: 'people', label: 'Staff' },
        { id: 'notifications', icon: 'notifications-outline', activeIcon: 'notifications', label: 'Alerts' },
        { id: 'supportHub', icon: 'chatbubble-ellipses-outline', activeIcon: 'chatbubble-ellipses', label: 'Support' },
        { id: 'more', icon: 'grid-outline', activeIcon: 'grid', label: 'More' },
      ];
    case 'GUIDE':
      return [
        { id: 'expertConsultation', icon: 'medical-outline', activeIcon: 'medical', label: 'Consults' },
        { id: 'tools', icon: 'videocam-outline', activeIcon: 'videocam', label: 'Classes' },
        { id: 'notifications', icon: 'notifications-outline', activeIcon: 'notifications', label: 'Alerts' },
        { id: 'more', icon: 'grid-outline', activeIcon: 'grid', label: 'More' },
      ];
    case 'ADMIN':
      return [
        { id: 'staffConsole', icon: 'people-outline', activeIcon: 'people', label: 'Staff' },
        { id: 'notifications', icon: 'notifications-outline', activeIcon: 'notifications', label: 'Alerts' },
        { id: 'more', icon: 'grid-outline', activeIcon: 'grid', label: 'More' },
      ];
    case 'PARTNER':
      return [
        { id: 'partnerDashboard', icon: 'heart-outline', activeIcon: 'heart', label: 'Partner' },
        { id: 'notifications', icon: 'notifications-outline', activeIcon: 'notifications', label: 'Alerts' },
        { id: 'more', icon: 'grid-outline', activeIcon: 'grid', label: 'More' },
      ];
    default:
      return [
        { id: 'home', icon: 'home-outline', activeIcon: 'home', label: 'Home' },
        { id: 'learn', icon: 'book-outline', activeIcon: 'book', label: 'Learn' },
        { id: 'activity', icon: 'sparkles-outline', activeIcon: 'sparkles', label: 'Activity' },
        { id: 'tools', icon: 'briefcase-outline', activeIcon: 'briefcase', label: 'Tools' },
        { id: 'more', icon: 'grid-outline', activeIcon: 'grid', label: 'More' },
      ];
  }
};


function MobileAppContent() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [cachedUser, setCachedUser] = useState(null);
  const { data: meData, loading: meLoading, refetch: refetchMe } = useQuery(ME_QUERY);
  const [syncUser] = useMutation(gql`mutation SyncUser { syncUser { id emailAddress } }`, { onCompleted: () => refetchMe() });
  const [saveOnboarding] = useMutation(SAVE_ONBOARDING_MUTATION, { onCompleted: () => refetchMe() });
  const [syncing, setSyncing] = useState(false);

  useEffect(() => onAuthStateChanged(auth, (user) => {
    setFirebaseUser(user);
    setAuthLoaded(true);
    if (!user) {
      setCachedUser(null);
      AsyncStorage.removeItem('divine_cached_user').catch(() => {});
    }
  }), []);

  useEffect(() => {
    async function restoreCache() {
      try {
        const savedCache = await AsyncStorage.getItem('apollo-cache-persist');
        if (savedCache) {
          client.cache.restore(JSON.parse(savedCache));
        }
        const storedUser = await AsyncStorage.getItem('divine_cached_user');
        if (storedUser) {
          setCachedUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.warn('Failed to restore cache from AsyncStorage:', e);
      } finally {
        setCacheLoaded(true);
      }
    }
    restoreCache();
  }, []);

  useEffect(() => {
    if (authLoaded && firebaseUser && !meLoading && !(meData?.me || cachedUser) && !syncing) {
      setSyncing(true);
      syncUser().finally(() => setSyncing(false));
    }
  }, [authLoaded, firebaseUser, meData, meLoading, syncing, syncUser, cachedUser]);

  useEffect(() => {
    if (meData?.me) {
      setCachedUser(meData.me);
      AsyncStorage.setItem('divine_cached_user', JSON.stringify(meData.me)).catch(err => {
        console.warn('Failed to save cached user profile:', err);
      });
    }
  }, [meData]);

  const user = meData?.me || cachedUser;
  const isSignedIn = Boolean(firebaseUser);
  const lang = user?.language || 'en';
  const t = MOBILE_TRANSLATIONS[lang] || MOBILE_TRANSLATIONS.en;
  const displayName = user?.displayName || firebaseUser?.displayName || 'Divine Mother';

  const roleType = user?.role?.roleType || 'MOTHER';
  const roleTabs = useMemo(() => getTabsForRole(roleType), [roleType]);

  useEffect(() => {
    if (user) {
      const currentRoleType = user.role?.roleType || 'MOTHER';
      const allowedTabs = getTabsForRole(currentRoleType);
      const isValid = allowedTabs.some((tab) => tab.id === activeTab);
      if (!isValid && allowedTabs.length > 0) {
        setActiveTab(allowedTabs[0].id);
      }
    }
  }, [user]);

  const navigate = (tab) => setActiveTab(tab);
  const screen = useMemo(() => {
    switch (activeTab) {
      case 'home':
        return <MobileTodayDashboard user={user} t={t} onNavigate={navigate} />;
      case 'partnerDashboard':
        return <MobilePartnerDashboard user={user} t={t} onNavigate={navigate} />;
      case 'learn':
        return <MobileLibrary t={t} lang={lang} />;
      case 'activity':
        return <MobileProgrammes />;
      case 'baby':
        return <MobileBabyTracker user={user} t={t} />;
      case 'tools':
        return <MobileLiveClasses user={user} />;
      case 'more':
        return <MobileSettings user={user} t={t} refetch={refetchMe} onNavigate={navigate} onSignOut={() => signOut(auth)} />;
      case 'community':
        return <MobileForum user={user} />;
      case 'notifications':
        return <MobileNotificationCentre />;
      case 'weeklyReport':
        return <MobileWeeklyReport user={user} lang={lang} onNavigate={navigate} />;
      case 'dietPlanner':
        return <MobileDietPlanner user={user} />;
      case 'expertConsultation':
        return <MobileExpertConsultation user={user} />;
      case 'wellnessTracker':
        return <MobileVitalsTracker user={user} />;
      case 'supportHub':
        return <MobileSupportHub user={user} />;
      case 'storeBoutique':
        return <MobileStoreBoutique user={user} />;
      case 'upgradePlans':
        return <MobileUpgradePlans user={user} />;
      case 'staffConsole':
        return <MobileStaffConsole user={user} />;
      default:
        return null;
    }
  }, [activeTab, refetchMe, t, user, lang]);

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

        {!authLoaded || !cacheLoaded || (isSignedIn && ((meLoading && !cachedUser) || syncing)) ? (
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
              {roleTabs.map((tab) => {
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
