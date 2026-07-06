import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useMutation } from '@apollo/client';
import { SAVE_ONBOARDING_MUTATION, CREATE_STRIPE_CHECKOUT_MUTATION } from '../graphql/operations';
import { styles } from '../components/styles.js';

export default function MobileSettings({ user, t, refetch }) {
  const [saveOnboarding] = useMutation(SAVE_ONBOARDING_MUTATION, { onCompleted: () => refetch() });
  const [createStripeCheckout] = useMutation(CREATE_STRIPE_CHECKOUT_MUTATION);
  const [loading, setLoading] = useState(false);

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
      alert(e.message);
    }
  };

  const handleCheckout = async (plan) => {
    setLoading(true);
    try {
      const { data } = await createStripeCheckout({ variables: { plan } });
      if (data?.createStripeCheckout) {
        Linking.openURL(data.createStripeCheckout);
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
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
          <View style={{ gap: 10, marginTop: 12 }}>
            <TouchableOpacity style={styles.checkoutBtn} onPress={() => handleCheckout('monthly')}>
              <Text style={styles.checkoutBtnText}>Monthly Premium ($9.99)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.checkoutBtn} onPress={() => handleCheckout('quarterly')}>
              <Text style={styles.checkoutBtnText}>Quarterly Premium ($24.99)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.checkoutBtnGold} onPress={() => handleCheckout('lifetime')}>
              <Text style={styles.checkoutBtnTextGold}>🚀 Lifetime Access ($49.99)</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
