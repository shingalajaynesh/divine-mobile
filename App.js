import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ClerkProvider, SignedIn, SignedOut, useAuth, useSignIn, useOAuth } from '@clerk/clerk-expo';
import { ApolloProvider, useQuery, gql } from '@apollo/client';
import { client, setClerkTokenProvider } from './src/graphql/client.js';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';

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

const ME_QUERY = gql`
  query GetMe {
    me {
      id
      displayName
      emailAddress
      center {
        name
      }
      role {
        name
      }
    }
  }
`;

function MobileAppContent() {
  const { signOut } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

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
            <LinearGradient
              colors={['#f97316', '#f43f5e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBg}
            >
              <Text style={styles.logoEmoji}>☀️</Text>
            </LinearGradient>
            <View>
              <Text style={styles.headerTitle}>Divine Garbh Sanskar</Text>
              <Text style={styles.headerSubtitle}>Nurturing Life Within</Text>
            </View>
          </View>

          <SignedIn>
            <View style={styles.headerRight}>
              <ApolloUserProfile />
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
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
          >
            {/* Mother & Baby Greeting Banner */}
            <LinearGradient
              colors={['#fb923c', '#f43f5e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.greetingCard}
            >
              <Text style={styles.greetingBabyEmoji}>👶</Text>
              <Text style={styles.greetingTitle}>Hello, Beautiful Mother!</Text>
              <Text style={styles.greetingDesc}>
                You are currently in your <Text style={styles.greetingDescBold}>Week 24 of pregnancy</Text>. Your baby is the size of an ear of corn and is starting to open their eyes!
              </Text>
              <View style={styles.badgeRow}>
                <View style={styles.capsuleBadge}>
                  <Text style={styles.capsuleBadgeText}>📅 EDD: Oct 28, 2026</Text>
                </View>
                <View style={styles.capsuleBadge}>
                  <Text style={styles.capsuleBadgeText}>🌱 Trimester: 2nd</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Today's Rituals Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderEmoji}>✅</Text>
                <Text style={styles.sectionHeaderTitle}>Today's Garbh Sanskar Rituals</Text>
              </View>

              <View style={styles.ritualGrid}>
                {/* Ritual Card 1 */}
                <View style={styles.ritualCard}>
                  <Text style={styles.ritualCardEmoji}>🧘‍♀️</Text>
                  <View style={styles.ritualCardContent}>
                    <Text style={styles.ritualCardTitle}>Garbh Yoga & Pranayam</Text>
                    <Text style={styles.ritualCardDesc}>Gentle stretching and breathing for easy delivery.</Text>
                    <TouchableOpacity onPress={() => alert('Starting Garbh Yoga (15 min)...')}>
                      <Text style={styles.ritualCardLink}>Start (15 min) →</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Ritual Card 2 */}
                <View style={styles.ritualCard}>
                  <Text style={styles.ritualCardEmoji}>🎵</Text>
                  <View style={styles.ritualCardContent}>
                    <Text style={styles.ritualCardTitle}>Garbh Sanskar Sangeet</Text>
                    <Text style={styles.ritualCardDesc}>Calming ragas to enhance brain development.</Text>
                    <TouchableOpacity onPress={() => alert('Playing calming prenatal music...')}>
                      <Text style={styles.ritualCardLink}>Play Audio →</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Ritual Card 3 */}
                <View style={styles.ritualCard}>
                  <Text style={styles.ritualCardEmoji}>📚</Text>
                  <View style={styles.ritualCardContent}>
                    <Text style={styles.ritualCardTitle}>Inspirational Reading</Text>
                    <Text style={styles.ritualCardDesc}>Read optimistic stories for a positive mindset.</Text>
                    <TouchableOpacity onPress={() => alert('Opening inspirational reading chapter...')}>
                      <Text style={styles.ritualCardLink}>Read Chapter →</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Ritual Card 4 */}
                <View style={styles.ritualCard}>
                  <Text style={styles.ritualCardEmoji}>🥗</Text>
                  <View style={styles.ritualCardContent}>
                    <Text style={styles.ritualCardTitle}>Nutritional Diet Plan</Text>
                    <Text style={styles.ritualCardDesc}>Iron and Calcium-rich satvik recipes.</Text>
                    <TouchableOpacity onPress={() => alert('Opening nutritional recipes...')}>
                      <Text style={styles.ritualCardLink}>View Menu →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Guides Section */}
            <View style={styles.guidesCard}>
              <View style={styles.guidesCardHeader}>
                <Text style={styles.guidesCardHeaderEmoji}>👩‍⚕️</Text>
                <View>
                  <Text style={styles.guidesCardHeaderTitle}>Your Dedicated Guides</Text>
                  <Text style={styles.guidesCardHeaderDesc}>Reach out to your assigned Garbh Sanskar expert.</Text>
                </View>
              </View>

              <View style={styles.guideRow}>
                <View>
                  <Text style={styles.guideName}>Dr. Sunita Sharma</Text>
                  <Text style={styles.guideRoleOrange}>Chief Garbh Sanskar Trainer</Text>
                </View>
                <TouchableOpacity style={styles.chatButtonOrange} onPress={() => alert('Chatting with Dr. Sunita...')}>
                  <Text style={styles.chatButtonText}>Chat</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.guideRow, styles.guideRowLast]}>
                <View>
                  <Text style={styles.guideName}>Mrs. Priya Patel</Text>
                  <Text style={styles.guideRoleRose}>Prenatal Yoga Expert</Text>
                </View>
                <TouchableOpacity style={styles.chatButtonRose} onPress={() => alert('Chatting with Mrs. Priya...')}>
                  <Text style={styles.chatButtonText}>Chat</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Daily Affirmation Card */}
            <LinearGradient
              colors={['#f43f5e', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.affirmationCard}
            >
              <Text style={styles.affirmationLabel}>DAILY AFFIRMATION</Text>
              <Text style={styles.affirmationQuote}>
                "I am filled with love, peace, and strength. My baby feels safe, healthy, and cherished."
              </Text>
            </LinearGradient>

            {/* Log Out CTA */}
            <TouchableOpacity style={styles.footerSignOutButton} onPress={() => signOut()}>
              <Text style={styles.footerSignOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </ScrollView>
        </SignedIn>

        <SignedOut>
          <ScrollView 
            contentContainerStyle={styles.signedOutScrollContent} 
            showsVerticalScrollIndicator={false}
          >
            {/* Welcome / Landing View */}
            <View style={styles.welcomeContainer}>
              <View style={styles.welcomeBadge}>
                <Text style={styles.welcomeBadgeText}>WELCOME MOTHER & PARENT</Text>
              </View>
              <Text style={styles.welcomeTitle}>
                Begin Your Sacred Journey of{' '}
                <Text style={styles.welcomeTitleHighlight}>Conscious Pregnancy</Text>
              </Text>
              <Text style={styles.welcomeDesc}>
                Unlock ancient wisdom combined with modern science. Practice yoga, listen to classical meditation melodies, log positive readings, and track baby growth daily.
              </Text>

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

// Clerk Authentication Modal
function ClerkSignInModal({ visible, onClose }) {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignIn = async () => {
    if (!isLoaded) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const completeSignIn = await signIn.create({
        identifier: email,
        password: password,
      });

      if (completeSignIn.status === 'complete') {
        await setActive({ session: completeSignIn.createdSessionId });
        onClose();
        // Clear input state
        setEmail('');
        setPassword('');
      } else {
        setErrorMsg('Sign-in incomplete. Please verify details.');
      }
    } catch (err) {
      setErrorMsg(err.errors?.[0]?.message || 'Sign in failed. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { createdSessionId, setActive: setOAuthActive } = await startOAuthFlow();

      if (createdSessionId) {
        await setOAuthActive({ session: createdSessionId });
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Sign In / Join</Text>
          <Text style={styles.modalSubtitle}>Access your Divine Garbh Sanskar account</Text>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>{errorMsg}</Text>
            </View>
          ) : null}

          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.textInput}
            placeholder="mother@example.com"
            placeholderTextColor="#a3a3a3"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.textInput}
            placeholder="••••••••"
            placeholderTextColor="#a3a3a3"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TouchableOpacity style={styles.submitButton} onPress={handleSignIn} disabled={loading}>
            <LinearGradient
              colors={['#f97316', '#f43f5e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButtonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Access Your Dashboard</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn} disabled={loading}>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={loading}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// User Profile sync component via Apollo
function ApolloUserProfile() {
  const { data, loading } = useQuery(ME_QUERY);

  if (loading) return <Text style={styles.headerProfileLoading}>Syncing...</Text>;
  if (!data?.me) return null;

  return (
    <View style={styles.headerProfileTextContainer}>
      <Text style={styles.headerProfileName} numberOfLines={1}>{data.me.displayName}</Text>
      <Text style={styles.headerProfileSub} numberOfLines={1}>
        {data.me.role?.name || 'Mother'} @ {data.me.center?.name || 'Central'}
      </Text>
    </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    height: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(253, 224, 224, 0.6)',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  logoEmoji: {
    fontSize: 16,
    color: '#fff',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ea580c',
  },
  headerSubtitle: {
    fontSize: 8,
    color: '#fb7185',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerProfileTextContainer: {
    alignItems: 'flex-end',
    marginRight: 10,
    maxWidth: 120,
  },
  headerProfileName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
  },
  headerProfileSub: {
    fontSize: 9,
    color: '#fb7185',
    fontWeight: '600',
    marginTop: 1,
  },
  headerProfileLoading: {
    fontSize: 10,
    color: '#94a3b8',
    marginRight: 10,
  },
  signOutIconButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#ffe4e6',
  },
  signOutIconText: {
    fontSize: 14,
  },
  headerSignInButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f97316',
  },
  headerSignInButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  signedOutScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  greetingCard: {
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  greetingBabyEmoji: {
    fontSize: 100,
    opacity: 0.12,
    position: 'absolute',
    right: -10,
    bottom: -15,
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  greetingDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    marginTop: 8,
    paddingRight: 40,
  },
  greetingDescBold: {
    fontWeight: '700',
    color: '#fff',
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  capsuleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 8,
  },
  capsuleBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b',
  },
  ritualGrid: {
    gap: 12,
  },
  ritualCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(254, 242, 242, 0.9)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  ritualCardEmoji: {
    fontSize: 28,
    marginRight: 14,
  },
  ritualCardContent: {
    flex: 1,
  },
  ritualCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
  },
  ritualCardDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 15,
  },
  ritualCardLink: {
    color: '#f97316',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
  },
  guidesCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(254, 242, 242, 0.9)',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 1,
    marginBottom: 24,
  },
  guidesCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 12,
    marginBottom: 12,
  },
  guidesCardHeaderEmoji: {
    fontSize: 22,
    marginRight: 8,
  },
  guidesCardHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1e293b',
  },
  guidesCardHeaderDesc: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  guideRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  guideName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
  },
  guideRoleOrange: {
    fontSize: 9,
    color: '#f97316',
    fontWeight: '700',
    marginTop: 2,
  },
  guideRoleRose: {
    fontSize: 9,
    color: '#f43f5e',
    fontWeight: '700',
    marginTop: 2,
  },
  chatButtonOrange: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ffedd5',
  },
  chatButtonRose: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#ffe4e6',
  },
  chatButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1e293b',
  },
  affirmationCard: {
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 24,
  },
  affirmationLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1.5,
  },
  affirmationQuote: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
  },
  footerSignOutButton: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  footerSignOutButtonText: {
    color: '#fb7185',
    fontWeight: '700',
    fontSize: 13,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 40,
  },
  welcomeBadge: {
    backgroundColor: '#ffe4e6',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginBottom: 20,
  },
  welcomeBadgeText: {
    color: '#e11d48',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1e293b',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  welcomeTitleHighlight: {
    color: '#f97316',
  },
  welcomeDesc: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  welcomeButton: {
    width: '100%',
    maxWidth: 280,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  welcomeButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: '#fff1f2',
    borderColor: '#ffe4e6',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBoxText: {
    color: '#e11d48',
    fontSize: 11,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: '#1e293b',
    marginBottom: 16,
    backgroundColor: '#f8fafc',
  },
  submitButton: {
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: 12,
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 2,
  },
  submitButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 13,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  googleButton: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleButtonText: {
    color: '#1e293b',
    fontSize: 13,
    fontWeight: '800',
  },
});
