import React from 'react';
import { View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import { useMutation } from '@apollo/client';
import { SAVE_ONBOARDING_MUTATION } from '../graphql/operations';
import { styles } from '../components/styles.js';

export default function MobileSettings({ user, t, refetch }) {
  const [saveOnboarding] = useMutation(SAVE_ONBOARDING_MUTATION, { onCompleted: () => refetch() });

  const changeLanguage = async (newLang) => {
    try {
      await saveOnboarding({
        variables: {
          lmpDate: user.lmpDate,
          dueDate: user.dueDate,
          language: newLang
        }
      });
    } catch (e) {
      Alert.alert('Unable to update language', e.message);
    }
  };

  const isPremium = user.subscriptionStatus && user.subscriptionStatus !== 'free';

  return (
    <View style={{ gap: 20 }}>
      {/* Language Preferences */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🌐 Language Preference</Text>
        <View style={styles.langSelectorRow}>
          <TouchableOpacity
            style={[styles.langSelectorBtn, user.language === 'en' && styles.langSelectorBtnActive]}
            onPress={() => changeLanguage('en')}
          >
            <Text style={[styles.langSelectorBtnText, user.language === 'en' && styles.langSelectorBtnTextActive]}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langSelectorBtn, user.language === 'hi' && styles.langSelectorBtnActive]}
            onPress={() => changeLanguage('hi')}
          >
            <Text style={[styles.langSelectorBtnText, user.language === 'hi' && styles.langSelectorBtnTextActive]}>हिंदी (Hindi)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Subscription plans */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>⭐ Subscription Tier</Text>
        <Text style={styles.cardDesc}>Current level: <Text style={{ fontWeight: 'bold', color: '#ea580c' }}>{user.subscriptionStatus.toUpperCase()}</Text></Text>
        
        {isPremium ? (
          <View style={styles.premiumBadgeBox}>
            <Text style={styles.premiumBadgeText}>✨ Full Premium Course Unlocked</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.checkoutBtnGold}
            onPress={() => Linking.openURL('https://wa.me/919638484545?text=Hello%2C%20I%20want%20to%20know%20about%20Divine%20programme%20access.')}
          >
            <Text style={styles.checkoutBtnTextGold}>Ask about programme access</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
