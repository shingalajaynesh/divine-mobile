import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../components/styles.js';

export default function MobileOnboardingCalculator({ saveOnboarding, t }) {
  const [lmpDate, setLmpDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [language, setLanguage] = useState('en');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!lmpDate && !dueDate) {
      alert("Please enter your LMP date or Estimated Due Date.");
      return;
    }
    setSubmitting(true);
    try {
      await saveOnboarding({
        variables: {
          lmpDate: lmpDate || null,
          dueDate: dueDate || null,
          language
        }
      });
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.onboardingCard}>
      <Text style={styles.onboardingTitle}>🤰 {t.onboarding_title}</Text>
      <Text style={styles.onboardingSub}>{t.onboarding_sub}</Text>

      <Text style={styles.onboardingLabel}>{t.lmp_label}</Text>
      <TextInput
        style={styles.onboardingInput}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#cbd5e1"
        value={lmpDate}
        onChangeText={(text) => { setLmpDate(text); setDueDate(''); }}
      />

      <Text style={styles.onboardingDivider}>─── or ───</Text>

      <Text style={styles.onboardingLabel}>{t.edd_label}</Text>
      <TextInput
        style={styles.onboardingInput}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#cbd5e1"
        value={dueDate}
        onChangeText={(text) => { setDueDate(text); setLmpDate(''); }}
      />

      <Text style={styles.onboardingLabel}>{t.select_lang}</Text>
      <View style={styles.langSelectorRow}>
        <TouchableOpacity
          style={[styles.langSelectorBtn, language === 'en' && styles.langSelectorBtnActive]}
          onPress={() => setLanguage('en')}
        >
          <Text style={[styles.langSelectorBtnText, language === 'en' && styles.langSelectorBtnTextActive]}>English</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.langSelectorBtn, language === 'hi' && styles.langSelectorBtnActive]}
          onPress={() => setLanguage('hi')}
        >
          <Text style={[styles.langSelectorBtnText, language === 'hi' && styles.langSelectorBtnTextActive]}>हिंदी (Hindi)</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.onboardingSubmitBtn} onPress={handleSave} disabled={submitting}>
        <LinearGradient
          colors={['#f97316', '#f43f5e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeButtonGradient}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.welcomeButtonText}>{t.save_onboarding}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}
