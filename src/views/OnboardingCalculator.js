import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../components/styles.js';
import { colors } from '../theme/theme.js';

export default function MobileOnboardingCalculator({ saveOnboarding, t }) {
  const [lmpDate, setLmpDate] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [picker, setPicker] = useState(null);
  const [lmpText, setLmpText] = useState('');
  const [dueText, setDueText] = useState('');
  const [language, setLanguage] = useState('en');
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    if (!lmpDate && !dueDate) {
      Alert.alert('Date required', 'Please select your LMP date or estimated due date.');
      return;
    }
    setSubmitting(true);
    try {
      await saveOnboarding({
        variables: {
          lmpDate: lmpDate ? lmpDate.toISOString().slice(0, 10) : null,
          dueDate: dueDate ? dueDate.toISOString().slice(0, 10) : null,
          language
        }
      });
    } catch (err) {
      Alert.alert('Unable to save', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.onboardingCard}>
      <Text style={styles.onboardingTitle}>🤰 {t.onboarding_title}</Text>
      <Text style={styles.onboardingSub}>{t.onboarding_sub}</Text>

      <Text style={styles.onboardingLabel}>{t.lmp_label}</Text>
      {Platform.OS === 'web' ? (
        <TextInput style={styles.onboardingInput} placeholder="YYYY-MM-DD" value={lmpText} onChangeText={(text) => { setLmpText(text); if (text.length === 10) { const value = new Date(`${text}T00:00:00`); if (!Number.isNaN(value.getTime())) { setLmpDate(value); setDueDate(null); setDueText(''); } } }} />
      ) : (
        <TouchableOpacity style={styles.onboardingInput} onPress={() => setPicker('lmp')}>
          <Text style={{ color: lmpDate ? colors.ink : colors.muted }}>{lmpDate ? lmpDate.toLocaleDateString() : 'Choose LMP date'}</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.onboardingDivider}>─── or ───</Text>

      <Text style={styles.onboardingLabel}>{t.edd_label}</Text>
      {Platform.OS === 'web' ? (
        <TextInput style={styles.onboardingInput} placeholder="YYYY-MM-DD" value={dueText} onChangeText={(text) => { setDueText(text); if (text.length === 10) { const value = new Date(`${text}T00:00:00`); if (!Number.isNaN(value.getTime())) { setDueDate(value); setLmpDate(null); setLmpText(''); } } }} />
      ) : (
        <TouchableOpacity style={styles.onboardingInput} onPress={() => setPicker('due')}>
          <Text style={{ color: dueDate ? colors.ink : colors.muted }}>{dueDate ? dueDate.toLocaleDateString() : 'Choose due date'}</Text>
        </TouchableOpacity>
      )}

      {picker && Platform.OS !== 'web' && (
        <DateTimePicker
          value={(picker === 'lmp' ? lmpDate : dueDate) || new Date()}
          mode="date"
          maximumDate={picker === 'lmp' ? new Date() : undefined}
          onChange={(event, value) => {
            setPicker(Platform.OS === 'ios' ? picker : null);
            if (event.type === 'set' && value) {
              if (picker === 'lmp') { setLmpDate(value); setDueDate(null); }
              else { setDueDate(value); setLmpDate(null); }
            }
          }}
        />
      )}
      {picker && Platform.OS === 'ios' && (
        <TouchableOpacity onPress={() => setPicker(null)} style={{ alignSelf: 'flex-end', paddingVertical: 8 }}>
          <Text style={{ color: colors.maroon, fontWeight: '800' }}>Done</Text>
        </TouchableOpacity>
      )}

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
