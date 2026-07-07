import React, { useState } from 'react';
import { 
  ActivityIndicator, 
  Alert, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View 
} from 'react-native';
import { useQuery, useMutation, gql } from '@apollo/client';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { 
  GET_PARTNER_DASHBOARD_QUERY, 
  SEND_ENCOURAGEMENT_MUTATION 
} from '../graphql/operations.js';
import { colors, spacing, radius, shadows } from '../theme/theme.js';

export default function MobilePartnerDashboard({ user, t }) {
  const isHi = user?.language === 'hi';
  const { data, loading, error, refetch } = useQuery(GET_PARTNER_DASHBOARD_QUERY, {
    fetchPolicy: 'network-only'
  });

  const [customMsg, setCustomMsg] = useState('');
  const [sending, setSending] = useState(false);

  // Mutations
  const [sendEncourage] = useMutation(SEND_ENCOURAGEMENT_MUTATION);
  
  // Re-use partner checkoff mutation
  const [acknowledgeTask, { loading: toggling }] = useMutation(ACKNOWLEDGE_PARTNER_ACTIVITY_MUTATION_MOBILE, {
    onCompleted: () => refetch()
  });

  const handleSendMessage = async (msg) => {
    if (!msg.trim()) return;
    setSending(true);
    try {
      await sendEncourage({ variables: { message: msg.trim() } });
      Alert.alert(
        isHi ? 'सफलता' : 'Success', 
        isHi ? 'प्रोत्साहन संदेश सफलतापूर्वक भेजा गया!' : 'Encouragement message sent successfully!'
      );
      setCustomMsg('');
    } catch (err) {
      Alert.alert(isHi ? 'त्रुटि' : 'Error', err.message);
    } finally {
      setSending(false);
    }
  };

  const handleToggleTask = async (dayNumber) => {
    try {
      await acknowledgeTask({ variables: { dayNumber } });
      Alert.alert(
        isHi ? 'सफलता' : 'Success',
        isHi ? 'गतिविधि स्थिति अपडेट की गई!' : 'Activity status updated!'
      );
    } catch (err) {
      Alert.alert(isHi ? 'त्रुटि' : 'Error', err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.maroon} />
        <Text style={styles.loadingText}>
          {isHi ? 'आपके साथी का स्थान लोड हो रहा है...' : 'Loading your partner space...'}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>
            {isHi ? 'साझेदार डैशबोर्ड लोड करने में विफल।' : 'Failed to load partner dashboard.'}
          </Text>
        </View>
      </ScrollView>
    );
  }

  const dbData = data?.getPartnerDashboard;
  const isVitalsShared = data?.me?.partner?.shareVitalsWithPartner ?? true;
  const vitalsLogs = data?.getMyVitals || [];

  // Messages templates
  const messages = isHi ? [
    'आप बहुत अच्छा कर रही हैं! ❤️',
    'थोड़ा आराम करें 🧘‍♀️',
    'मैं हमेशा आपके साथ हूँ! 🌟',
    'पानी पीना न भूलें 💧'
  ] : [
    'You are doing amazing! ❤️',
    'Take a little rest 🧘‍♀️',
    'I am always here for you! 🌟',
    'Do not forget to stay hydrated 💧'
  ];

  // Trimester Story styling
  const getTrimesterGradient = (trimester) => {
    switch (trimester) {
      case 1:
        return ['#FF9A9E', '#F6CBEF'];
      case 2:
        return ['#F6D365', '#FDA085'];
      default:
        return ['#A18CD1', '#FBC2EB'];
    }
  };

  const trimesterColors = getTrimesterGradient(dbData?.currentTrimester || 1);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.container}>
      
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.kicker}>{isHi ? 'नमस्ते, साथी' : 'NAMASTE, PARTNER'}</Text>
        <Text style={styles.title}>
          {isHi ? `${dbData?.motherName} की यात्रा` : `${dbData?.motherName}'s Journey`}
        </Text>
        <Text style={styles.subtitle}>
          {isHi ? 'यहाँ आपके साथी और बच्चे की दैनिक स्थिति है।' : "Here is how your partner and baby are doing today."}
        </Text>
      </View>

      {/* Progress Journey Gradient Card */}
      <LinearGradient colors={trimesterColors} style={styles.journeyCard} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
        <View style={styles.journeyHeader}>
          <Text style={styles.journeyTrimester}>
            {isHi ? `तिमाही ${dbData?.currentTrimester || 1}` : `Trimester ${dbData?.currentTrimester || 1}`}
          </Text>
          <Text style={styles.journeyWeek}>
            {isHi ? `सप्ताह ${dbData?.currentWeek || 1}` : `Week ${dbData?.currentWeek || 1}`}
          </Text>
        </View>

        <View style={styles.journeyStats}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>{isHi ? 'गर्भावस्था दिन' : 'Pregnancy Day'}</Text>
            <Text style={styles.statValue}>{dbData?.pregnancyDay} / 280</Text>
          </View>
          {dbData?.babySize && (
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>{isHi ? 'शिशु का आकार' : "Baby Size"}</Text>
              <Text style={styles.statValue}>{dbData?.babySize}</Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              {isHi ? 'माँ की दैनिक पूर्णता' : "Mother's Daily Completion"}
            </Text>
            <Text style={styles.progressPercent}>{dbData?.progressPercent}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${dbData?.progressPercent || 0}%` }]} />
          </View>
        </View>
      </LinearGradient>

      {/* Daily Connection Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardIcon}>🤝</Text>
          <View>
            <Text style={styles.cardKicker}>{isHi ? 'आज का साथी संबंध कार्य' : "TODAY'S PARTNER TASK"}</Text>
            <Text style={styles.cardTitle}>{dbData?.partnerActivityTitle || (isHi ? 'संबंध गतिविधि' : 'Connection Activity')}</Text>
          </View>
        </View>
        <Text style={styles.cardDesc}>
          {dbData?.partnerActivityDescription || (isHi ? 'आज अपने साथी के साथ कुछ शांत क्षण बिताएं और चर्चा करें।' : 'Spend some quiet moments today connecting with your partner and talking about your plans.')}
        </Text>
        <View style={styles.cardFooter}>
          <View style={[styles.statusTag, dbData?.partnerActivityCompleted ? styles.statusSuccess : styles.statusPending]}>
            <Text style={[styles.statusText, dbData?.partnerActivityCompleted ? styles.textSuccess : styles.textPending]}>
              {dbData?.partnerActivityCompleted ? (isHi ? 'पूरा किया गया' : 'Completed') : (isHi ? 'लंबित' : 'Pending')}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.toggleBtn, dbData?.partnerActivityCompleted ? styles.btnOutline : styles.btnPrimary]}
            disabled={toggling}
            onPress={() => handleToggleTask(dbData?.pregnancyDay)}
          >
            <Text style={[styles.btnText, dbData?.partnerActivityCompleted ? styles.btnTextOutline : styles.btnTextPrimary]}>
              {dbData?.partnerActivityCompleted ? (isHi ? 'पूर्ण के रूप में चिह्नित' : 'Completed') : (isHi ? 'पूर्ण चिह्नित करें' : 'Mark Completed')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Micro Encouragements Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>✨ {isHi ? 'त्वरित प्रोत्साहन भेजें' : 'Send Encouragement'}</Text>
        <Text style={styles.subtext}>
          {isHi ? 'अपनी पत्नी को खुश करने या याद दिलाने के लिए एक त्वरित संदेश भेजें।' : 'Send a micro-encouragement card to show your support.'}
        </Text>

        {/* Chips Container */}
        <View style={styles.chipsContainer}>
          {messages.map((msg) => (
            <TouchableOpacity 
              key={msg} 
              onPress={() => handleSendMessage(msg)}
              style={styles.chip}
            >
              <Text style={styles.chipText}>{msg}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Input */}
        <TextInput 
          placeholder={isHi ? 'अपना खुद का संदेश लिखें...' : 'Type a custom message...'}
          value={customMsg}
          onChangeText={setCustomMsg}
          style={styles.textInput}
          multiline
        />

        <TouchableOpacity 
          style={[styles.sendBtn, !customMsg.trim() && styles.btnDisabled]}
          onPress={() => handleSendMessage(customMsg)}
          disabled={!customMsg.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendBtnText}>{isHi ? 'संदेश भेजें' : 'Send Message'}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Vitals Logs Card (Conditional on Sharing Consent) */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardHeading}>📈 {isHi ? 'स्वास्थ्य महत्वपूर्ण (Vitals)' : "Mother's Health Vitals"}</Text>
          {!isVitalsShared && (
            <View style={styles.privateTag}>
              <Ionicons name="eye-off-outline" size={14} color="#B45309" />
              <Text style={styles.privateTagText}>{isHi ? 'निजी' : 'Private'}</Text>
            </View>
          )}
        </View>

        {isVitalsShared ? (
          vitalsLogs.length > 0 ? (
            vitalsLogs.slice(0, 4).map((log) => (
              <View key={log.id} style={styles.vitalRow}>
                <View>
                  <Text style={styles.vitalDate}>{new Date(parseInt(log.loggedAt) || log.loggedAt).toLocaleDateString()}</Text>
                  <View style={styles.row}>
                    {log.symptoms?.map((sym) => (
                      <View key={sym} style={styles.symptomTag}>
                        <Text style={styles.symptomText}>{sym}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={styles.vitalRight}>
                  {log.weight && <Text style={styles.vitalVal}>{log.weight} kg</Text>}
                  {log.systolicBp && log.diastolicBp && (
                    <Text style={styles.vitalValSub}>{log.systolicBp}/{log.diastolicBp} BP</Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>{isHi ? 'कोई विटल्स लॉग नहीं मिला।' : 'No vitals logged yet.'}</Text>
          )
        ) : (
          <View style={styles.privatePlaceholder}>
            <Ionicons name="lock-closed-outline" size={32} color={colors.muted} />
            <Text style={styles.privatePlaceholderText}>
              {isHi 
                ? 'स्वास्थ्य महत्वपूर्ण विवरण देखने की सहमति आपके साथी द्वारा सक्षम नहीं की गई है।' 
                : "Vitals sharing is currently paused by the mother. Respecting her privacy first."}
            </Text>
          </View>
        )}
      </View>

    </ScrollView>
  );
}

const ACKNOWLEDGE_PARTNER_ACTIVITY_MUTATION_MOBILE = gql`
  mutation AcknowledgePartnerActivity($dayNumber: Int!) {
    acknowledgePartnerActivity(dayNumber: $dayNumber) {
      id
      partnerAcknowledged
    }
  }
`;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.canvas,
    padding: spacing.xl
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.muted,
    fontSize: 14
  },
  errorCard: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.card
  },
  errorText: {
    marginTop: spacing.md,
    color: colors.ink,
    fontSize: 15,
    textAlign: 'center'
  },
  header: {
    marginBottom: spacing.lg,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 1.2,
    marginBottom: spacing.xs
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.ink,
  },
  subtitle: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 4
  },
  journeyCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.glass
  },
  journeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  journeyTrimester: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  journeyWeek: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff'
  },
  journeyStats: {
    flexDirection: 'row',
    marginBottom: spacing.lg
  },
  statBox: {
    marginRight: spacing.xl
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    marginBottom: 2
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff'
  },
  progressSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: spacing.md
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  progressLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500'
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff'
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: 6,
    backgroundColor: '#fff',
    borderRadius: 3
  },
  card: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  cardIcon: {
    fontSize: 24,
    marginRight: spacing.sm
  },
  cardKicker: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink
  },
  cardDesc: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: spacing.lg
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  statusSuccess: {
    backgroundColor: '#DEF2E6'
  },
  statusPending: {
    backgroundColor: '#FFF1E6'
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700'
  },
  textSuccess: {
    color: colors.success
  },
  textPending: {
    color: colors.accent
  },
  toggleBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 10
  },
  btnPrimary: {
    backgroundColor: colors.maroon
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border
  },
  btnText: {
    fontSize: 13,
    fontWeight: '700'
  },
  btnTextPrimary: {
    color: '#fff'
  },
  btnTextOutline: {
    color: colors.ink
  },
  subtext: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: spacing.md
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md
  },
  chip: {
    backgroundColor: colors.softMaroon,
    borderColor: '#FFE8EC',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  chipText: {
    fontSize: 12,
    color: colors.maroon,
    fontWeight: '600'
  },
  textInput: {
    backgroundColor: colors.canvas,
    borderRadius: radius.sm,
    padding: spacing.md,
    height: 60,
    textAlignVertical: 'top',
    fontSize: 13,
    marginBottom: spacing.md,
    borderColor: colors.border,
    borderWidth: 1,
    color: colors.ink
  },
  sendBtn: {
    backgroundColor: colors.maroon,
    borderRadius: radius.sm,
    paddingVertical: spacing.md,
    alignItems: 'center'
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700'
  },
  btnDisabled: {
    backgroundColor: '#C5B3B5'
  },
  privateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  privateTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B45309',
    marginLeft: 4
  },
  privatePlaceholder: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md
  },
  privatePlaceholderText: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18
  },
  vitalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  vitalDate: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4
  },
  symptomTag: {
    backgroundColor: colors.softMaroon,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  symptomText: {
    fontSize: 10,
    color: colors.maroon,
    fontWeight: '600'
  },
  vitalRight: {
    alignItems: 'flex-end'
  },
  vitalVal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink
  },
  vitalValSub: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2
  },
  emptyText: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: spacing.md
  }
});
