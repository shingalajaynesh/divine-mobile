import React, { useState, useEffect, useMemo } from 'react';
import { ActivityIndicator, Alert, Image, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {
  GET_BABY_DEVELOPMENT_QUERY,
  GET_DAILY_CONTENT_QUERY,
  MY_DAILY_PROGRESS_QUERY,
  MY_DAILY_PROGRESS_RANGE_QUERY,
  TOGGLE_DAILY_ACTIVITY_MUTATION,
  SAVE_DAILY_ACTIVITY_DETAILS_MUTATION,
  GET_DAILY_QUIZ_QUERY,
  GET_MY_QUIZ_ATTEMPT_QUERY,
  SUBMIT_QUIZ_ANSWER_MUTATION,
  GET_PARTNER_ACTIVITY_QUERY,
  GET_MY_PARTNER_ACTIVITY_LOG_QUERY,
  ACKNOWLEDGE_PARTNER_ACTIVITY_MUTATION,
  GET_SENSORY_ACTIVITY_QUERY,
  GET_MY_SENSORY_ACTIVITY_LOG_QUERY,
  TOGGLE_SENSORY_ACTIVITY_MUTATION,
  LINK_PARTNER_MUTATION,
  UPDATE_PARTNER_SHARING_MUTATION,
  ME_QUERY
} from '../graphql/operations.js';
import { colors, shadows } from '../theme/theme.js';
import VideoPlayerModal from '../components/VideoPlayerModal.js';
import AudioPlayerModal from '../components/AudioPlayerModal.js';
import ReadingModeModal from '../components/ReadingModeModal.js';

const SUPPORT = 'https://wa.me/919638484545?text=Hello%20Divine%20team%2C%20I%20would%20like%20guidance.';

const inspiration = [
  { title: 'Calm digestion', subtitle: 'Gentle habits for pregnancy', icon: 'leaf-outline', colors: ['#6A1320', '#9C3541'] },
  { title: 'Mindful bonding', subtitle: 'Connect with your baby', icon: 'heart-outline', colors: ['#B45309', '#F59E0B'] },
  { title: 'Deep rest', subtitle: 'Sleep and meditation', icon: 'moon-outline', colors: ['#4A235A', '#7E3D83'] },
];

const getMonthsForTrimester = (tri) => {
  if (tri === 1) return [1, 2, 3];
  if (tri === 2) return [4, 5, 6];
  return [7, 8, 9, 10];
};

const getWeeksForMonth = (mon) => {
  const startWeek = (mon - 1) * 4 + 1;
  return [startWeek, startWeek + 1, startWeek + 2, startWeek + 3];
};

const getDaysForWeek = (wk) => {
  const startDay = (wk - 1) * 7 + 1;
  return Array.from({ length: 7 }, (_, i) => startDay + i);
};

const getSensoryIcon = (senseType) => {
  switch (senseType) {
    case 'HEARING': return 'musical-notes-outline';
    case 'SIGHT': return 'eye-outline';
    case 'SMELL': return 'leaf-outline';
    case 'TASTE': return 'restaurant-outline';
    case 'TOUCH': return 'hand-left-outline';
    default: return 'help-circle-outline';
  }
};

function getQuotientContent(selectedDay, content, userLanguage) {
  const isHi = userLanguage === 'hi';
  const isGu = userLanguage === 'gu';

  const defaults = {
    PQ: {
      title: isHi ? "शारीरिक स्वास्थ्य (Physical Quotient)" : (isGu ? "શારીરિક સ્વાસ્થ્ય (Physical Quotient)" : "Physical Wellness (PQ)"),
      description: isHi
        ? "आज 15 मिनट के लिए प्रसव-पूर्व तितली खिंचाव और गहरी श्वास क्रिया करें। प्रचुर मात्रा में पानी पिएं और मौसमी फल खाएं।"
        : (isGu
          ? "આજે ૧૫ મિનિટ માટે હળવા પતંગિયા આસન (બટરફ્લાય સ્ટ્રેચ) અને ઊંડા શ્વાસોચ્છવાસ (પ્રાણાયામ) કરો. નાળિયેર પાણી અને મોસમી ફળો લો."
          : "Practice 15 minutes of gentle butterfly stretches and deep pranayama breathing today. Hydrate with coconut water and seasonal fruits."),
      icon: "fitness-outline",
      category: "yoga"
    },
    IQ: {
      title: isHi ? "बौद्धिक स्वास्थ्य (Intelligence Quotient)" : (isGu ? "બૌદ્ધિક સ્વાસ્થ્ય (Intelligence Quotient)" : "Intelligence Development (IQ)"),
      description: isHi
        ? "एक पहेली या वर्ग पहेली खेलें। गर्भ में पल रहे शिशु के संज्ञानात्मक विकास के लिए आज 10 मिनट कुछ नया पढ़ने में व्यतीत करें।"
        : (isGu
          ? "આજે એક કોયડો અથવા તાર્કિક રમત રમો. ગર્ભસ્થ શિશુના જ્ઞાનાત્મક વિકાસ માટે આજે ૧૦ મિનિટ કંઈક નવું વાંચવા માટે વિતાવો."
          : "Solve a puzzle or play a logic game today. Nurture your baby's cognitive development by reading an educational story for 10 minutes."),
      icon: "bulb-outline",
      category: "story"
    },
    EQ: {
      title: isHi ? "भावनात्मक स्वास्थ्य (Emotional Quotient)" : (isGu ? "ભાવનાત્મક સ્વાસ્થ્ય (Emotional Quotient)" : "Emotional Bonding (EQ)"),
      description: isHi
        ? "गर्भ संवाद: अपने हाथों को अपने पेट पर धीरे से रखें और मुस्कुराते हुए शिशु से बातें करें। कहें कि हम सब आपका स्वागत करने के लिए उत्सुक हैं।"
        : (isGu
          ? "ગર્ભ સંવાદ: તમારા હાથ તમારા પેટ પર હળવેથી રાખો, હસો અને ગર્ભસ્થ શિશુ સાથે વાત કરો: 'અમે તમને ખૂબ પ્રેમ કરીએ છીએ, તમે અમારા માટે એક આશીર્વાદ છો.'"
          : "Garbh Samvad: Place your hands on your belly, smile, and speak to your unborn child: 'We love you, you are a blessing to us.'"),
      icon: "heart-outline",
      category: "dialogue"
    },
    SQ: {
      title: isHi ? "आध्यात्मिक स्वास्थ्य (Spiritual Quotient)" : (isGu ? "આધ્યાત્મિક સ્વાસ્થ્ય (Spiritual Quotient)" : "Spiritual Aura (SQ)"),
      description: isHi
        ? "आज शांति से गायत्री मंत्र का 11 बार उच्चारण करें। सकारात्मक दिव्य ऊर्जा प्रवाह पर ध्यान केंद्रित करते हुए 10 मिनट ध्यान लगाएं।"
        : (isGu
          ? "આજે ૧૧ વાર શાંતિથી ગાયત્રી મંત્રનો જાપ કરો. ગર્ભસ્થ શિશુની આસપાસ દૈવી પ્રકાશ અને હકારાત્મક ઊર્જાની કલ્પના કરીને ૧૦ મિનિટ શાંત ધ્યાન કરો."
          : "Chant the Gayatri Mantra 11 times. Spend 10 minutes in silent meditation, visualizing divine light and positive energy surrounding your baby."),
      icon: "🕉️",
      category: "mantra"
    }
  };

  if (content) {
    const categoryLower = (content.category || '').toLowerCase();

    if (categoryLower === 'yoga' || categoryLower === 'recipe') {
      defaults.PQ.title = content.title || defaults.PQ.title;
      defaults.PQ.description = content.body || defaults.PQ.description;
    } else if (categoryLower === 'story' || categoryLower === 'article' || categoryLower === 'puzzle') {
      defaults.IQ.title = content.title || defaults.IQ.title;
      defaults.IQ.description = content.body || defaults.IQ.description;
    } else if (categoryLower === 'dialogue' || categoryLower === 'affirmation') {
      defaults.EQ.title = content.title || defaults.EQ.title;
      defaults.EQ.description = content.body || defaults.EQ.description;
    } else if (categoryLower === 'mantra' || categoryLower === 'music' || categoryLower === 'spiritual') {
      defaults.SQ.title = content.title || defaults.SQ.title;
      defaults.SQ.description = content.body || defaults.SQ.description;
    }
  }

  return defaults;
}

export default function MobileTodayDashboard({ user, onNavigate }) {
  const [selectedDay, setSelectedDay] = useState(user.pregnancyDay || 1);
  const [activeQuotient, setActiveQuotient] = useState('PQ');
  const [videoPlayerVisible, setVideoPlayerVisible] = useState(false);
  const [audioPlayerVisible, setAudioPlayerVisible] = useState(false);
  const [readingModalVisible, setReadingModalVisible] = useState(false);
  const userLang = user.language || 'en';
  const isHi = userLang === 'hi';

  const selectedTrimester = Math.max(1, Math.min(3, Math.floor((selectedDay - 1) / 84) + 1));
  const selectedMonth = Math.max(1, Math.min(10, Math.floor((selectedDay - 1) / 28) + 1));
  const selectedWeek = Math.max(1, Math.min(40, Math.floor((selectedDay - 1) / 7) + 1));

  const trimesterStory = useMemo(() => {
    const tri = selectedTrimester;
    if (tri === 1) {
      return {
        title: isHi ? "प्रथम तिमाही: प्राण संचार" : "Trimester 1: Prana Sanchar",
        desc: isHi 
          ? "जीवन शक्ति का आगमन। शांतिपूर्ण मंत्रोच्चार और विश्राम पर ध्यान केंद्रित करें।"
          : "Inflow of Life Force. Establish peace, bond with quiet mantras, and practice deep breathing.",
        color: "#ca8a04",
      };
    } else if (tri === 2) {
      return {
        title: isHi ? "द्वितीय तिमाही: इंद्रिय संचार" : "Trimester 2: Indriya Sanchar",
        desc: isHi
          ? "इंद्रियों का विकास। संगीत, सकारात्मक पठन और मधुर गर्भ संवाद पर ध्यान दें।"
          : "Development of Senses. Nourish with sensory sounds, positive reading, and soft music.",
        color: "#b45309",
      };
    } else {
      return {
        title: isHi ? "तृतीय तिमाही: चेतना संचार" : "Trimester 3: Chetana Sanchar",
        desc: isHi
          ? "चेतना का जागरण। प्रार्थना, उच्च नैतिक संकल्प और सजग प्रसव-पूर्व योग अभ्यास करें।"
          : "Awakening of Consciousness. Focus on prayer, moral values, and light prenatal yoga.",
        color: "#be123c",
      };
    }
  }, [selectedTrimester, isHi]);

  const startDay = (selectedWeek - 1) * 7 + 1;
  const endDay = selectedWeek * 7;

  const { data: babyData } = useQuery(GET_BABY_DEVELOPMENT_QUERY, { variables: { weekNumber: selectedWeek } });
  const { data: contentData } = useQuery(GET_DAILY_CONTENT_QUERY, { variables: { dayNumber: selectedDay } });
  const { data: progressData } = useQuery(MY_DAILY_PROGRESS_QUERY, { variables: { dayNumber: selectedDay } });
  const { data: progressRangeData } = useQuery(MY_DAILY_PROGRESS_RANGE_QUERY, { variables: { startDay, endDay } });
  const { data: quizData } = useQuery(GET_DAILY_QUIZ_QUERY, { variables: { dayNumber: selectedDay } });
  const { data: quizAttemptData } = useQuery(GET_MY_QUIZ_ATTEMPT_QUERY, { variables: { dayNumber: selectedDay } });

  const [submitQuizAnswerMutation] = useMutation(SUBMIT_QUIZ_ANSWER_MUTATION, {
    refetchQueries: [
      { query: GET_MY_QUIZ_ATTEMPT_QUERY, variables: { dayNumber: selectedDay } }
    ],
    onCompleted: (res) => {
      if (res?.submitQuizAnswer?.isCorrect) {
        Alert.alert('Correct Answer', isHi ? "सही उत्तर! अद्भुत!" : "Correct answer! Amazing!");
      } else {
        Alert.alert('Incorrect Answer', isHi ? "गलत उत्तर, कोई बात नहीं!" : "Incorrect answer, no worries!");
      }
    },
    onError: (err) => {
      Alert.alert('Error', err.message);
    }
  });

  const dailyQuiz = quizData?.getDailyQuiz;
  const quizAttempt = quizAttemptData?.getMyQuizAttempt;

  const { data: partnerData } = useQuery(GET_PARTNER_ACTIVITY_QUERY, { variables: { dayNumber: selectedDay } });
  const { data: partnerLogData } = useQuery(GET_MY_PARTNER_ACTIVITY_LOG_QUERY, { variables: { dayNumber: selectedDay } });

  const [acknowledgePartnerActivityMutation] = useMutation(ACKNOWLEDGE_PARTNER_ACTIVITY_MUTATION, {
    refetchQueries: [
      { query: GET_MY_PARTNER_ACTIVITY_LOG_QUERY, variables: { dayNumber: selectedDay } }
    ],
    onCompleted: (res) => {
      const acknowledged = res?.acknowledgePartnerActivity?.partnerAcknowledged;
      if (acknowledged) {
        Alert.alert('Success', isHi ? "गतिविधि पूरी चिह्नित की गई!" : "Partner activity marked as completed!");
      } else {
        Alert.alert('Success', isHi ? "गतिविधि अधूरी चिह्नित की गई!" : "Partner activity unchecked!");
      }
    },
    onError: (err) => {
      Alert.alert('Error', err.message);
    }
  });

  const partnerActivity = partnerData?.getPartnerActivity;
  const partnerLog = partnerLogData?.getMyPartnerActivityLog;

  const { data: sensoryData } = useQuery(GET_SENSORY_ACTIVITY_QUERY, { variables: { dayNumber: selectedDay } });
  const { data: sensoryLogData } = useQuery(GET_MY_SENSORY_ACTIVITY_LOG_QUERY, { variables: { dayNumber: selectedDay } });

  const [toggleSensoryActivityMutation] = useMutation(TOGGLE_SENSORY_ACTIVITY_MUTATION, {
    refetchQueries: [
      { query: GET_MY_SENSORY_ACTIVITY_LOG_QUERY, variables: { dayNumber: selectedDay } }
    ],
    onCompleted: (res) => {
      const completed = res?.toggleSensoryActivity?.completed;
      if (completed) {
        Alert.alert('Success', isHi ? "गतिविधि पूरी चिह्नित की गई!" : "Sensory exercise marked as completed!");
      } else {
        Alert.alert('Success', isHi ? "गतिविधि अधूरी चिह्नित की गई!" : "Sensory exercise unchecked!");
      }
    },
    onError: (err) => {
      Alert.alert('Error', err.message);
    }
  });

  const [partnerEmail, setPartnerEmail] = useState('');
  const [linkPartner, { loading: linkingPartner }] = useMutation(LINK_PARTNER_MUTATION, {
    refetchQueries: [{ query: ME_QUERY }],
    onCompleted: () => {
      Alert.alert('Success', isHi ? "साथी सफलतापूर्वक जुड़ गया!" : "Partner linked successfully!");
      setPartnerEmail('');
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [updatePartnerSharing] = useMutation(UPDATE_PARTNER_SHARING_MUTATION, {
    refetchQueries: [{ query: ME_QUERY }],
    onCompleted: () => Alert.alert('Success', isHi ? "साझाकरण अनुमतियां अपडेट की गईं!" : "Sharing preferences updated!"),
    onError: (err) => Alert.alert('Error', err.message)
  });

  const sensoryActivity = sensoryData?.getSensoryActivity;
  const sensoryLog = sensoryLogData?.getMySensoryActivityLog;

  const [durationValue, setDurationValue] = useState('0');
  const [evidenceValue, setEvidenceValue] = useState('');
  const [notesValue, setNotesValue] = useState('');

  useEffect(() => {
    if (progressData?.myDailyProgress) {
      const qKey = activeQuotient.toLowerCase();
      setDurationValue(String(progressData.myDailyProgress[`${qKey}DurationMins`] || 0));
      setEvidenceValue(progressData.myDailyProgress[`${qKey}Evidence`] || '');
      setNotesValue(progressData.myDailyProgress[`${qKey}Notes`] || '');
    } else {
      setDurationValue('0');
      setEvidenceValue('');
      setNotesValue('');
    }
  }, [progressData, activeQuotient, selectedDay]);

  const [toggleDailyActivityMutation] = useMutation(TOGGLE_DAILY_ACTIVITY_MUTATION, {
    refetchQueries: [
      { query: MY_DAILY_PROGRESS_QUERY, variables: { dayNumber: selectedDay } },
      { query: MY_DAILY_PROGRESS_RANGE_QUERY, variables: { startDay, endDay } }
    ],
    onError: (err) => {
      Alert.alert('Error updating activity', err.message);
    }
  });

  const [saveDailyActivityDetailsMutation, { loading: savingDetails }] = useMutation(SAVE_DAILY_ACTIVITY_DETAILS_MUTATION, {
    refetchQueries: [
      { query: MY_DAILY_PROGRESS_QUERY, variables: { dayNumber: selectedDay } },
      { query: MY_DAILY_PROGRESS_RANGE_QUERY, variables: { startDay, endDay } }
    ],
    onCompleted: () => {
      Alert.alert('Success', isHi ? "गतिविधि विवरण सहेजे गए!" : "Activity details saved successfully!");
    },
    onError: (err) => {
      Alert.alert('Error', err.message);
    }
  });

  const baby = babyData?.getBabyDevelopment;
  const content = contentData?.getDailyContent;

  const completedActivities = {
    PQ: progressData?.myDailyProgress?.pqCompleted || false,
    IQ: progressData?.myDailyProgress?.iqCompleted || false,
    EQ: progressData?.myDailyProgress?.eqCompleted || false,
    SQ: progressData?.myDailyProgress?.sqCompleted || false,
  };

  const toggleActivity = async (qKey) => {
    try {
      await toggleDailyActivityMutation({
        variables: {
          dayNumber: selectedDay,
          quotient: qKey
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveDetails = async () => {
    try {
      await saveDailyActivityDetailsMutation({
        variables: {
          input: {
            dayNumber: selectedDay,
            quotient: activeQuotient,
            durationMins: parseInt(durationValue, 10) || 0,
            evidence: evidenceValue.trim() || null,
            notes: notesValue.trim() || null
          }
        }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const isLocked = selectedDay > (user.pregnancyDay || 1);
  const unlockDate = new Date();
  unlockDate.setDate(unlockDate.getDate() + (selectedDay - (user.pregnancyDay || 1)));
  const unlockDateString = unlockDate.toLocaleDateString(userLang === 'hi' ? 'hi-IN' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const quotients = getQuotientContent(selectedDay, content, userLang);
  const completedCount = Object.values(completedActivities).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 4) * 100);

  return (
    <View style={s.screen}>
      {/* Horizontally scrolling inspiration rail */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail}>
        {inspiration.map((item) => (
          <LinearGradient key={item.title} colors={item.colors} style={s.inspirationCard}>
            <View style={s.inspirationIcon}><Ionicons name={item.icon} size={24} color={colors.paper} /></View>
            <View><Text style={s.inspirationTitle}>{item.title}</Text><Text style={s.inspirationSubtitle}>{item.subtitle}</Text></View>
          </LinearGradient>
        ))}
      </ScrollView>

      {/* Support Card */}
      <View style={s.supportCard}>
        <View style={s.supportIllustration}><Ionicons name="headset" size={34} color={colors.maroon} /></View>
        <View style={s.supportCopy}><Text style={s.supportTitle}>Talk to our care team</Text><Text style={s.supportText}>We are here for you, every day.</Text></View>
        <TouchableOpacity style={s.supportButton} onPress={() => Linking.openURL(SUPPORT)}><Text style={s.supportButtonText}>Chat</Text></TouchableOpacity>
      </View>

      {/* Quick Actions Row */}
      <View style={s.quickActionsContainer}>
        <Text style={s.quickActionsTitle}>{isHi ? "त्वरित उपकरण" : "Quick Tools"}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.quickActionsRow}>
          {[
            { key: 'dietPlanner', icon: 'heart-outline', label: isHi ? 'आहार योजना' : 'Diet' },
            { key: 'wellnessTracker', icon: 'pulse-outline', label: isHi ? 'वाइटल्स' : 'Vitals' },
            { key: 'weeklyReport', icon: 'bar-chart-outline', label: isHi ? 'रिपोर्ट' : 'Reports' },
            { key: 'expertConsultation', icon: 'medkit-outline', label: isHi ? 'सलाह लें' : 'Consult' }
          ].map((act) => (
            <TouchableOpacity
              key={act.key}
              style={s.quickActionChip}
              onPress={() => onNavigate(act.key)}
            >
              <Ionicons name={act.icon} size={18} color={colors.maroon} style={{ marginBottom: 4 }} />
              <Text style={s.quickActionLabel}>{act.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Journey Banner */}
      <LinearGradient 
        colors={
          selectedTrimester === 1 ? ['#FFFBEB', '#FEF3C7'] :
          selectedTrimester === 2 ? ['#FFF7ED', '#FFEDD5'] :
          ['#FFF1F2', '#FFE4E6']
        } 
        style={[s.journeyCard, { borderLeftWidth: 6, borderLeftColor: trimesterStory.color }]}
      >
        <View style={{ width: '100%', gap: 12 }}>
          {/* Header Row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[s.eyebrow, { color: trimesterStory.color }]}>
              {isHi ? `तिमाही ${selectedTrimester} · सप्ताह ${selectedWeek}` : `TRIMESTER ${selectedTrimester} · WEEK ${selectedWeek}`}
            </Text>
            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="leaf-outline" size={10} color={colors.maroon} />
              <Text style={{ fontSize: 9, fontWeight: '800', color: colors.maroon }}>{isHi ? `दिन ${selectedDay} / 280` : `Day ${selectedDay} / 280`}</Text>
            </View>
          </View>

          {/* Baby & Greeting Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderWidth: 3,
              borderColor: 'rgba(255, 255, 255, 0.5)',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <Image source={require('../../assets/smiling_baby.png')} style={{ width: 66, height: 66, borderRadius: 33 }} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: colors.maroonDark }}>
                {isHi ? "नमस्ते, प्रिय माँ!" : "Hello, Beautiful Mother!"}
              </Text>
              <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2, lineHeight: 15 }} numberOfLines={3}>
                {isHi ? `आपकी गर्भावस्था का सप्ताह ${selectedWeek}। शिशु का आकार: ${baby?.size || 'एक नन्हा बीज'} है और वह स्वस्थ बढ़ रहा है!` : `Week ${selectedWeek} of pregnancy. Baby size: ${baby?.size || 'a tiny seed'}. Growing healthy!`}
              </Text>
            </View>
          </View>

          {/* Garbh Sanskar Motif Box */}
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.45)',
            padding: 12,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.5)'
          }}>
            <Text style={{ color: trimesterStory.color, fontWeight: '800', fontSize: 9, textTransform: 'uppercase', marginBottom: 2 }}>
              <Ionicons name="sparkles-outline" size={10} color={trimesterStory.color} /> {isHi ? "गर्भ संस्कार विषय" : "GARBH SANSKAR MOTIF"}
            </Text>
            <Text style={{ fontWeight: '800', color: colors.maroonDark, fontSize: 12, marginBottom: 2 }}>
              {trimesterStory.title}
            </Text>
            <Text style={{ color: colors.muted, fontSize: 10, lineHeight: 14 }}>
              {trimesterStory.desc}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* 280-day timeline Picker */}
      <SectionTitle title={isHi ? "गर्भ संस्कार कैलेंडर" : "Garbh Sanskar Calendar"} />
      <View style={s.timelineContainer}>
        {/* Trimester row */}
        <View style={s.trimesterRow}>
          {[1, 2, 3].map((tri) => {
            const active = selectedTrimester === tri;
            return (
              <TouchableOpacity
                key={tri}
                style={[s.trimesterButton, active && s.trimesterButtonActive]}
                onPress={() => setSelectedDay((tri - 1) * 84 + 1)}
              >
                <Text style={[s.trimesterButtonText, active && s.trimesterButtonTextActive]}>
                  {isHi ? `तिमाही ${tri}` : `Trimester ${tri}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Month scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.monthScroll}>
          {getMonthsForTrimester(selectedTrimester).map((m) => {
            const active = selectedMonth === m;
            return (
              <TouchableOpacity
                key={m}
                style={[s.monthButton, active && s.monthButtonActive]}
                onPress={() => setSelectedDay((m - 1) * 28 + 1)}
              >
                <Text style={[s.monthButtonText, active && s.monthButtonTextActive]}>
                  {isHi ? `महीना ${m}` : `Month ${m}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Week scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.weekScroll}>
          {getWeeksForMonth(selectedMonth).map((w) => {
            const active = selectedWeek === w;
            return (
              <TouchableOpacity
                key={w}
                style={[s.weekButton, active && s.weekButtonActive]}
                onPress={() => setSelectedDay((w - 1) * 7 + 1)}
              >
                <Text style={[s.weekButtonText, active && s.weekButtonTextActive]}>
                  {isHi ? `सप्ताह ${w}` : `Week ${w}`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Day bubbles scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dayScroll}>
          {getDaysForWeek(selectedWeek).map((d) => {
            const active = selectedDay === d;
            const isDayLocked = d > (user.pregnancyDay || 1);
            const dayProgress = progressRangeData?.myDailyProgressRange?.find(p => p.dayNumber === d);
            const isDayCompleted = dayProgress?.pqCompleted && dayProgress?.iqCompleted && dayProgress?.eqCompleted && dayProgress?.sqCompleted;

            return (
              <TouchableOpacity
                key={d}
                style={[
                  s.dayBubble,
                  active && s.dayBubbleActive,
                  isDayLocked && s.dayBubbleLocked
                ]}
                onPress={() => setSelectedDay(d)}
              >
                <Text style={[s.dayBubbleText, active && s.dayBubbleTextActive, isDayLocked && s.dayBubbleTextLocked]}>
                  {d}
                </Text>
                {isDayLocked && (
                  <View style={s.bubbleBadge}><Ionicons name="lock-closed" size={10} color={colors.muted} /></View>
                )}
                {!isDayLocked && isDayCompleted && (
                  <View style={s.bubbleBadgeCompleted}><Ionicons name="checkmark" size={10} color={colors.paper} /></View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Lock screen / Quotient Checklist Workspace */}
      {isLocked ? (
        <View style={s.lockedCard}>
          <Ionicons name="lock-closed" size={44} color={colors.muted} style={{ alignSelf: 'center', marginBottom: 12 }} />
          <Text style={s.lockedTitle}>{isHi ? `दिन ${selectedDay} लॉक है` : `Day ${selectedDay} is locked`}</Text>
          <Text style={s.lockedText}>
            {isHi
              ? "यह कार्यक्रम आपके गर्भधारण सप्ताह के अनुसार स्वतः अनलॉक होगा। आप पिछले दिनों के कार्य पूरे कर सकती हैं।"
              : "This daily ritual unlocks as your pregnancy journey progresses. Feel free to complete any past days."}
          </Text>
          <View style={s.unlockBadge}>
            <Text style={[s.unlockBadgeText, { flexDirection: 'row', alignItems: 'center' }]}>
              <Ionicons name="lock-open-outline" size={10} color={colors.saffron} /> {isHi ? "अनलॉक तिथि:" : "Expected unlock:"} {unlockDateString}
            </Text>
          </View>
        </View>
      ) : (
        <>
          <SectionTitle title={isHi ? "दैनिक आयामी गतिविधियां" : "Daily Quotients Activity"} />

          {/* Quick Quotients Grid Selector */}
          <View style={s.quotientGrid}>
            {Object.entries(quotients).map(([key, q]) => {
              const active = activeQuotient === key;
              const isCompleted = completedActivities[key];
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    s.quotientCard,
                    isCompleted && s.quotientCardCompleted,
                    active && s.quotientCardActive,
                    active && isCompleted && s.quotientCardCompletedActive
                  ]}
                  onPress={() => setActiveQuotient(key)}
                >
                  <View style={s.quotientCardTop}>
                    <Ionicons name={q.icon} size={22} color={active ? colors.saffron : (isCompleted ? colors.success : colors.muted)} />
                    <TouchableOpacity onPress={() => toggleActivity(key)}>
                      <Ionicons
                        name={isCompleted ? "checkbox" : "square-outline"}
                        size={20}
                        color={isCompleted ? colors.success : colors.muted}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={s.quotientLabel}>{key}</Text>
                  <Text style={s.quotientTitle} numberOfLines={1}>{q.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Detailed Selected Activity Panel */}
          <View style={s.detailsPanel}>
            <View style={s.detailsHeader}>
              <View style={s.detailsBadge}>
                <Text style={s.detailsBadgeText}>{activeQuotient} Quotient</Text>
              </View>
              {progressPercent === 100 && (
                <View style={s.doneBadge}>
                  <Text style={s.doneBadgeText}>ALL DONE</Text>
                </View>
              )}
            </View>

            <Text style={s.detailsTitle}>{quotients[activeQuotient].title}</Text>
            <Text style={s.detailsDescription}>{quotients[activeQuotient].description}</Text>

            {activeQuotient === 'PQ' && quotients.PQ.category === 'yoga' && (
              <View style={s.safetyBanner}>
                <Text style={[s.safetyTitle, { flexDirection: 'row', alignItems: 'center' }]}>
                  <Ionicons name="warning-outline" size={11} color="#78350f" /> {isHi ? "प्रसव-पूर्व सुरक्षा सावधानियां" : "Prenatal Safety Precautions"} (Trimester {selectedDay <= 90 ? '1' : selectedDay <= 180 ? '2' : '3'})
                </Text>
                <Text style={s.safetyText}>
                  {selectedDay <= 90
                    ? (isHi ? "त्रैमासिक 1 सावधानियां: पेट पर दबाव डालने वाले आसनों से बचें, झटकेदार आंदोलनों से बचें, और यदि ऐंठन या रक्तस्राव हो तो अभ्यास तुरंत रोक दें।" : "Trimester 1 Precautions: Avoid abdominal pressure, sudden twists or high-impact jumps. Stop immediately if experiencing cramping or spotting.")
                    : selectedDay <= 180
                      ? (isHi ? "त्रैमासिक 2 सावधानियां: पीठ के बल अधिक देर तक लेटने से बचें, संतुलन के लिए दीवार या सहारा लें, और अत्यधिक खिंचाव से बचें।" : "Trimester 2 Precautions: Avoid lying flat on your back for long. Use wall or chair support for balance. Do not over-stretch.")
                      : (isHi ? "त्रैमासिक 3 सावधानियां: पीठ के बल लेटने वाले आसन न करें, सांस रोकने से बचें, और हमेशा सहारे के साथ अभ्यास करें।" : "Trimester 3 Precautions: Absolutely avoid supine positions (on your back) and breath retention. Always use support (blocks/cushions).")
                  }
                </Text>
                <Text style={s.safetyDisclaimer}>
                  {isHi ? "*चिकित्सीय अस्वीकरण: किसी भी व्यायाम को शुरू करने से पहले अपने डॉक्टर से परामर्श लें।" : "*Medical Disclaimer: Consult your doctor/gynecologist before performing any exercises."}
                </Text>
              </View>
            )}

            <View style={s.divider} />

            {/* Quotient Logs, evidence & reflection notes */}
            <View style={s.logsContainer}>
              <Text style={[s.logsLabel, { flexDirection: 'row', alignItems: 'center' }]}><Ionicons name="document-text-outline" size={12} color={colors.maroon} /> {isHi ? "गतिविधि विवरण और डायरी" : "Activity Logging & Reflection"}</Text>

              <Text style={s.inputLabel}>{isHi ? "समय (मिनट में)" : "Duration spent (mins)"}</Text>
              <TextInput
                style={s.input}
                value={durationValue}
                onChangeText={setDurationValue}
                keyboardType="numeric"
                placeholder="e.g. 15"
              />

              <Text style={s.inputLabel}>{isHi ? "प्रमाण/लिंक (वैकल्पिक)" : "Proof/Evidence Link (optional)"}</Text>
              <TextInput
                style={s.input}
                value={evidenceValue}
                onChangeText={setEvidenceValue}
                placeholder="https://..."
                autoCapitalize="none"
              />

              <Text style={s.inputLabel}>{isHi ? "आज के अनुभव / चिंतन डायरी" : "Daily Reflection Notes / Diary"}</Text>
              <TextInput
                style={[s.input, s.textArea]}
                value={notesValue}
                onChangeText={setNotesValue}
                placeholder={isHi ? "आज शिशु के साथ कैसा अनुभव रहा..." : "How did you and baby feel during this activity..."}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={s.divider} />

            <View style={s.detailsActions}>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                <TouchableOpacity
                  style={[s.completeButton, completedActivities[activeQuotient] && s.completeButtonActive]}
                  onPress={() => toggleActivity(activeQuotient)}
                >
                  <Ionicons
                    name={completedActivities[activeQuotient] ? "checkmark-circle" : "ellipse-outline"}
                    size={18}
                    color={colors.paper}
                  />
                  <Text style={s.completeButtonText}>
                    {completedActivities[activeQuotient]
                      ? (isHi ? "पूर्ण है" : "Done")
                      : (isHi ? "पूर्ण करें" : "Complete")
                    }
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={s.saveButton}
                  onPress={handleSaveDetails}
                  disabled={savingDetails}
                >
                  {savingDetails ? (
                    <ActivityIndicator size="small" color={colors.paper} />
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={16} color={colors.paper} />
                      <Text style={s.saveButtonText}>{isHi ? "सहेजें" : "Save Log"}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {content?.mediaUrl && activeQuotient === 'SQ' && (
                <TouchableOpacity
                  style={s.playLink}
                  onPress={() => {
                    if (content.category === 'video') setVideoPlayerVisible(true);
                    else setAudioPlayerVisible(true);
                  }}
                >
                  <Ionicons name="play-circle" size={18} color={colors.maroon} />
                  <Text style={s.playLinkText}>{isHi ? "चलाएं" : "Play Media"}</Text>
                </TouchableOpacity>
              )}

              {['IQ', 'EQ'].includes(activeQuotient) && (
                <TouchableOpacity
                  style={[s.playLink, { marginLeft: 12 }]}
                  onPress={() => setReadingModalVisible(true)}
                >
                  <Ionicons name="book-outline" size={18} color={colors.maroon} />
                  <Text style={s.playLinkText}>{isHi ? "पढ़ें" : "Open Reader"}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </>
      )}

      {/* Daily Quiz & Puzzle Card */}
      {!isLocked && dailyQuiz && (
        <View style={s.quizCard}>
          <View style={s.quizHeader}>
            <Ionicons name="bulb-outline" size={18} color={colors.maroon} />
            <Text style={s.quizHeaderTitle}>
              {isHi ? "दैनिक मस्तिष्क व्यायाम पहेली" : "Daily Cognitive Quiz & Puzzle"}
            </Text>
          </View>

          <Text style={s.quizQuestionText}>{dailyQuiz.questionText}</Text>

          <View style={s.quizOptionsGrid}>
            {dailyQuiz.options.map((option, index) => {
              const isAttempted = !!quizAttempt;
              const isSelected = isAttempted && quizAttempt.selectedOptionIndex === index;
              const isCorrectIndex = index === dailyQuiz.correctOptionIndex;

              let optBtnStyle = [s.quizOptionButton];
              let optTxtStyle = [s.quizOptionText];

              if (isAttempted) {
                if (isSelected && quizAttempt.isCorrect) {
                  optBtnStyle.push(s.quizOptionCorrect);
                  optTxtStyle.push(s.quizOptionTextCorrect);
                } else if (isSelected && !quizAttempt.isCorrect) {
                  optBtnStyle.push(s.quizOptionIncorrect);
                  optTxtStyle.push(s.quizOptionTextIncorrect);
                } else if (isCorrectIndex) {
                  optBtnStyle.push(s.quizOptionCorrect);
                  optTxtStyle.push(s.quizOptionTextCorrect);
                } else {
                  optBtnStyle.push(s.quizOptionDisabled);
                }
              }

              const handleSelect = async () => {
                if (isAttempted) return;
                try {
                  await submitQuizAnswerMutation({
                    variables: {
                      dayNumber: selectedDay,
                      selectedOptionIndex: index
                    }
                  });
                } catch (e) {
                  console.error(e);
                }
              };

              return (
                <TouchableOpacity
                  key={index}
                  style={optBtnStyle}
                  onPress={handleSelect}
                  disabled={isAttempted}
                >
                  <Text style={optTxtStyle}>{option}</Text>
                  {isAttempted && isCorrectIndex && <Ionicons name="checkmark-circle" size={14} color="#10b981" />}
                  {isAttempted && isSelected && !quizAttempt.isCorrect && <Ionicons name="close-circle" size={14} color="#ef4444" />}
                </TouchableOpacity>
              );
            })}
          </View>

          {quizAttempt && (
            <View style={s.quizExplanationCard}>
              <Text style={[s.quizExplanationLabel, { flexDirection: 'row', alignItems: 'center' }]}>
                <Ionicons name="bulb-outline" size={12} color="#0f766e" /> {isHi ? "उत्तर स्पष्टीकरण" : "Explanation & Insight"}
              </Text>
              <Text style={s.quizExplanationText}>{dailyQuiz.explanation}</Text>
            </View>
          )}
        </View>
      )}

      {/* Daily Partner & Family Activity Card */}
      {!isLocked && partnerActivity && (
        <View style={s.partnerCard}>
          <View style={s.partnerHeader}>
            <Ionicons name="people-outline" size={18} color={colors.maroon} />
            <Text style={s.partnerHeaderTitle}>
              {isHi ? "पिता और परिवार दैनिक अनुष्ठान" : "Partner & Family Daily Ritual"}
            </Text>
          </View>

          <Text style={s.partnerTitleText}>{partnerActivity.title}</Text>
          <Text style={s.partnerDescriptionText}>{partnerActivity.description}</Text>

          <View style={s.partnerActionsRow}>
            <View style={[s.partnerStatusBadge, partnerLog?.partnerAcknowledged ? s.partnerStatusDone : s.partnerStatusPending]}>
              <Text style={[s.partnerStatusText, partnerLog?.partnerAcknowledged ? s.partnerStatusTextDone : s.partnerStatusTextPending, { flexDirection: 'row', alignItems: 'center' }]}>
                {partnerLog?.partnerAcknowledged
                  ? <><Ionicons name="checkmark-circle-outline" size={10} color={colors.success} /> {isHi ? "पूर्ण" : "Done"}</>
                  : <><Ionicons name="warning-outline" size={10} color={colors.saffron} /> {isHi ? "लंबित" : "Pending"}</>
                }
              </Text>
            </View>

            <TouchableOpacity
              style={[s.partnerAckButton, partnerLog?.partnerAcknowledged && s.partnerAckButtonActive]}
              onPress={async () => {
                try {
                  await acknowledgePartnerActivityMutation({
                    variables: { dayNumber: selectedDay }
                  });
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              <Text style={s.partnerAckButtonText}>
                {partnerLog?.partnerAcknowledged
                  ? (isHi ? "अपूर्ण करें" : "Uncheck")
                  : (isHi ? "पूर्ण चिह्नित करें" : "Mark Done")
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Partner Link & Consent Card */}
      {!isLocked && (
        <View style={s.partnerSettingsCard}>
          <View style={s.partnerHeader}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.maroon} />
            <Text style={s.partnerHeaderTitle}>
              {isHi ? "साथी जुड़ाव और साझाकरण सेटिंग्स" : "Partner Link & Sharing Consent"}
            </Text>
          </View>

          {user?.partner ? (
            <View>
              <View style={s.partnerActionsRow}>
                <View>
                  <Text style={s.inputLabel}>{isHi ? "संबद्ध साथी ईमेल" : "LINKED PARTNER EMAIL"}</Text>
                  <Text style={s.partnerEmailVal}>{user.partner.emailAddress}</Text>
                </View>
                <View style={[s.partnerStatusBadge, s.partnerStatusDone]}>
                  <Text style={[s.partnerStatusTextDone, { flexDirection: 'row', alignItems: 'center' }]}>
                    <Ionicons name="checkmark-circle-outline" size={10} color={colors.success} /> {isHi ? "संबद्ध" : "Linked"}
                  </Text>
                </View>
              </View>

              <View style={s.divider} />

              <Text style={s.partnerSharingTitle}>
                {isHi ? "साझाकरण अनुमतियाँ" : "Sharing Permissions"}
              </Text>

              <TouchableOpacity 
                style={s.checkboxRow}
                onPress={() => {
                  updatePartnerSharing({
                    variables: {
                      shareVitals: !user.shareVitalsWithPartner,
                      shareReports: user.shareReportsWithPartner
                    }
                  });
                }}
              >
                <Ionicons 
                  name={user.shareVitalsWithPartner ? "checkbox" : "square-outline"} 
                  size={20} 
                  color={user.shareVitalsWithPartner ? colors.success : colors.muted} 
                />
                <Text style={s.checkboxLabel}>
                  {isHi ? "स्वास्थ्य महत्वपूर्ण (Vitals) विवरण साझा करें" : "Share health vitals logs with partner"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={s.checkboxRow}
                onPress={() => {
                  updatePartnerSharing({
                    variables: {
                      shareVitals: user.shareVitalsWithPartner,
                      shareReports: !user.shareReportsWithPartner
                    }
                  });
                }}
              >
                <Ionicons 
                  name={user.shareReportsWithPartner ? "checkbox" : "square-outline"} 
                  size={20} 
                  color={user.shareReportsWithPartner ? colors.success : colors.muted} 
                />
                <Text style={s.checkboxLabel}>
                  {isHi ? "साप्ताहिक प्रगति रिपोर्ट साझा करें" : "Share weekly journey reports with partner"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={s.partnerDescriptionText}>
                {isHi 
                  ? "अपने जीवनसाथी के साथ अपनी मातृत्व यात्रा साझा करें। वे दैनिक कार्यों को देख सकते हैं, प्रोत्साहन भेज सकते हैं और प्रगति देख सकते हैं।" 
                  : "Invite and link your partner to join your Garbh Sanskar journey. They will receive their own dashboard, assigned tasks, and can send you encouraging messages."}
              </Text>
              <TextInput 
                placeholder={isHi ? "साथी का ईमेल दर्ज करें..." : "Enter partner's email..."}
                value={partnerEmail}
                onChangeText={setPartnerEmail}
                style={s.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={[s.partnerAckButton, { marginTop: 12, alignItems: 'center' }]}
                onPress={() => {
                  if (!partnerEmail.trim()) return;
                  linkPartner({ variables: { partnerEmail: partnerEmail.trim() } });
                }}
                disabled={linkingPartner}
              >
                {linkingPartner ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={s.partnerAckButtonText}>{isHi ? "साथी लिंक करें" : "Link Partner"}</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Daily Sensory (Panchendriya) Activity Card */}
      {!isLocked && sensoryActivity && (
        <View style={s.sensoryCard}>
          <View style={s.sensoryHeader}>
            <Ionicons name={getSensoryIcon(sensoryActivity.senseType)} size={18} color={colors.maroon} />
            <Text style={s.sensoryHeaderTitle}>
              {isHi ? "पंचेंद्रिय विकास दैनिक अनुष्ठान" : "Five-Sense Daily Sensory Ritual"}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <View style={s.sensoryTypeBadge}>
              <Text style={s.sensoryTypeText}>{sensoryActivity.senseType}</Text>
            </View>
          </View>

          <Text style={s.sensoryTitleText}>{sensoryActivity.title}</Text>
          <Text style={s.sensoryDescriptionText}>{sensoryActivity.description}</Text>

          <View style={s.sensoryActionsRow}>
            <View style={[s.sensoryStatusBadge, sensoryLog?.completed ? s.sensoryStatusDone : s.sensoryStatusPending]}>
              <Text style={[s.sensoryStatusText, sensoryLog?.completed ? s.sensoryStatusTextDone : s.sensoryStatusTextPending, { flexDirection: 'row', alignItems: 'center' }]}>
                {sensoryLog?.completed
                  ? <><Ionicons name="checkmark-circle-outline" size={10} color={colors.success} /> {isHi ? "पूर्ण" : "Completed"}</>
                  : <><Ionicons name="warning-outline" size={10} color={colors.saffron} /> {isHi ? "लंबित" : "Pending"}</>
                }
              </Text>
            </View>

            <TouchableOpacity
              style={[s.sensoryAckButton, sensoryLog?.completed && s.sensoryAckButtonActive]}
              onPress={async () => {
                try {
                  await toggleSensoryActivityMutation({
                    variables: { dayNumber: selectedDay }
                  });
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              <Text style={s.sensoryAckButtonText}>
                {sensoryLog?.completed
                  ? (isHi ? "अपूर्ण करें" : "Uncheck")
                  : (isHi ? "पूर्ण चिह्नित करें" : "Mark Completed")
                }
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Premium Programme Banner */}
      <View style={s.planCard}>
        <View style={s.planBadge}><Ionicons name="diamond-outline" size={22} color={colors.saffron} /></View>
        <Text style={s.planTitle}>Divine Complete Programme</Text>
        <Text style={s.planText}>Daily activities, meditation, yoga, diet guidance and expert sessions in one organised journey.</Text>
        <TouchableOpacity style={s.planButton} onPress={() => Linking.openURL(SUPPORT)}><Text style={s.planButtonText}>Explore programme</Text><Ionicons name="arrow-forward" size={16} color={colors.paper} /></TouchableOpacity>
      </View>

      {/* Testimonials */}
      <SectionTitle title="Mothers share their journey" />
      <View style={s.testimonial}>
        <Text style={s.quote}>“</Text>
        <Text style={s.testimonialText}>The daily guidance helped me feel calmer, more connected and confident throughout my pregnancy.</Text>
        <Text style={s.testimonialName}>A Divine mother · Surat</Text>
      </View>

      {content?.mediaUrl && (
        <VideoPlayerModal
          visible={videoPlayerVisible}
          onClose={() => setVideoPlayerVisible(false)}
          mediaUrl={content.mediaUrl}
          dailyContentId={content.id}
          title={isHi ? content.titleHi || content.title : content.titleEn || content.title}
          isHi={isHi}
        />
      )}

      {content?.mediaUrl && (
        <AudioPlayerModal
          visible={audioPlayerVisible}
          onClose={() => setAudioPlayerVisible(false)}
          mediaUrl={content.mediaUrl}
          contentItemId={content.id}
          title={isHi ? content.titleHi || content.title : content.titleEn || content.title}
          isHi={isHi}
        />
      )}

      <ReadingModeModal
        visible={readingModalVisible}
        onClose={() => setReadingModalVisible(false)}
        title={quotients[activeQuotient].title}
        body={quotients[activeQuotient].description}
        lang={userLang}
      />
    </View>
  );
}

function SectionTitle({ title, action, onPress }) {
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      {action ? (
        <TouchableOpacity onPress={onPress}>
          <Text style={s.sectionAction}>{action}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { gap: 18 },
  rail: { gap: 12, paddingRight: 16 },
  inspirationCard: { width: 164, minHeight: 176, padding: 16, borderRadius: 22, justifyContent: 'space-between', overflow: 'hidden' },
  inspirationIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: 'rgba(255,255,255,.16)', alignItems: 'center', justifyContent: 'center' },
  inspirationTitle: { color: colors.paper, fontSize: 17, fontWeight: '900' },
  inspirationSubtitle: { color: 'rgba(255,255,255,.78)', fontSize: 11, lineHeight: 15, marginTop: 5 },
  supportCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 20, backgroundColor: '#E8F4ED', borderWidth: 1, borderColor: '#D4EBDD' },
  supportIllustration: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' },
  supportCopy: { flex: 1 }, supportTitle: { color: colors.maroonDark, fontSize: 14, fontWeight: '900' }, supportText: { color: colors.muted, fontSize: 10, marginTop: 3 },
  supportButton: { paddingHorizontal: 15, paddingVertical: 10, backgroundColor: colors.success, borderRadius: 12 }, supportButtonText: { color: colors.paper, fontSize: 11, fontWeight: '900' },
  journeyCard: { borderRadius: 24, padding: 16, flexDirection: 'column', overflow: 'hidden' }, journeyCopy: { flex: 1, zIndex: 2 },
  eyebrow: { color: colors.saffron, fontSize: 9, fontWeight: '900', letterSpacing: 1 }, journeyTitle: { color: colors.maroonDark, fontSize: 29, fontWeight: '900', marginTop: 7 }, journeyText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5, maxWidth: 210 },
  metaRow: { flexDirection: 'row', gap: 7, marginTop: 14 }, metaText: { color: colors.maroon, backgroundColor: 'rgba(255,255,255,.7)', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 10, fontSize: 9, fontWeight: '800' },
  journeyOrb: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,.72)', borderWidth: 8, borderColor: 'rgba(255,255,255,.42)' },
  sectionHeader: { marginTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionTitle: { color: colors.maroonDark, fontSize: 18, fontWeight: '900', letterSpacing: -.3 }, sectionAction: { color: colors.saffron, fontSize: 11, fontWeight: '800' },
  planCard: { padding: 21, borderRadius: 24, backgroundColor: colors.softMaroon, borderWidth: 1, borderColor: '#EBCFD4' }, planBadge: { width: 44, height: 44, borderRadius: 16, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' }, planTitle: { color: colors.maroon, fontSize: 20, fontWeight: '900', marginTop: 14 }, planText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 7 }, planButton: { minHeight: 46, marginTop: 17, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.maroon }, planButtonText: { color: colors.paper, fontSize: 12, fontWeight: '900' },
  testimonial: { padding: 22, borderRadius: 24, backgroundColor: '#E4F3F8', overflow: 'hidden' }, quote: { color: colors.saffron, fontSize: 54, lineHeight: 42, fontWeight: '900' }, testimonialText: { color: colors.maroonDark, fontSize: 14, lineHeight: 22, fontWeight: '600' }, testimonialName: { color: colors.maroon, fontSize: 11, fontWeight: '900', marginTop: 14 },

  // Timeline picker styles
  timelineContainer: { backgroundColor: colors.paper, padding: 15, borderRadius: 20, borderWidth: 1, borderColor: colors.line, ...shadows.card },
  trimesterRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  trimesterButton: { flex: 1, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: colors.line, alignItems: 'center', marginHorizontal: 3 },
  trimesterButtonActive: { backgroundColor: colors.maroon, borderColor: colors.maroon },
  trimesterButtonText: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  trimesterButtonTextActive: { color: colors.paper },
  monthScroll: { gap: 6, paddingBottom: 6 },
  monthButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.canvas },
  monthButtonActive: { backgroundColor: colors.saffron, borderColor: colors.saffron },
  monthButtonText: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  monthButtonTextActive: { color: colors.paper },
  weekScroll: { gap: 6, paddingVertical: 4 },
  weekButton: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  weekButtonActive: { backgroundColor: colors.softMaroon },
  weekButtonText: { color: colors.muted, fontSize: 9, fontWeight: '600' },
  weekButtonTextActive: { color: colors.maroon, fontWeight: 'bold' },
  dayScroll: { gap: 8, paddingVertical: 8 },
  dayBubble: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  dayBubbleActive: { borderColor: colors.saffron, backgroundColor: colors.softSaffron },
  dayBubbleLocked: { backgroundColor: colors.canvas },
  dayBubbleText: { color: colors.ink, fontSize: 11, fontWeight: '800' },
  dayBubbleTextActive: { color: colors.maroon },
  dayBubbleTextLocked: { color: colors.muted },
  bubbleBadge: { position: 'absolute', bottom: -3, right: -3, backgroundColor: colors.paper, borderRadius: 6, padding: 1, borderWidth: 1, borderColor: colors.line },
  bubbleBadgeCompleted: { position: 'absolute', bottom: -3, right: -3, backgroundColor: colors.success, borderRadius: 6, padding: 1 },

  // Locked card
  lockedCard: { padding: 24, borderRadius: 22, backgroundColor: colors.canvas, borderStyle: 'dashed', borderWidth: 2, borderColor: colors.line, alignItems: 'center', textAlign: 'center' },
  lockedTitle: { color: colors.maroonDark, fontSize: 15, fontWeight: '900', marginBottom: 4 },
  lockedText: { color: colors.muted, fontSize: 11, lineHeight: 16, textAlign: 'center', marginBottom: 16 },
  unlockBadge: { backgroundColor: colors.softSaffron, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  unlockBadgeText: { color: colors.saffron, fontSize: 10, fontWeight: '800' },

  // Quotients Checklist styles
  quotientGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  quotientCard: {
    width: '48.5%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    shadowColor: colors.maroonDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  quotientCardActive: {
    borderColor: colors.saffron,
    backgroundColor: colors.softSaffron,
    shadowColor: colors.saffron,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  quotientCardCompleted: {
    borderColor: '#d1fae5',
    backgroundColor: '#f0fdf4',
  },
  quotientCardCompletedActive: {
    borderColor: colors.saffron,
    backgroundColor: '#f6fcf8',
  },
  quotientCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  quotientIcon: { fontSize: 20 },
  quotientLabel: { color: colors.muted, fontSize: 8, fontWeight: '800', textTransform: 'uppercase' },
  quotientTitle: { color: colors.maroonDark, fontSize: 11, fontWeight: '900', marginTop: 2 },

  // Quotient details panel
  detailsPanel: { padding: 18, borderRadius: 20, backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.line },
  detailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  detailsBadge: { backgroundColor: colors.softSaffron, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  detailsBadgeText: { color: colors.saffron, fontSize: 8, fontWeight: '900', textTransform: 'uppercase' },
  doneBadge: { backgroundColor: '#E4F2E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  doneBadgeText: { color: colors.success, fontSize: 8, fontWeight: '900' },
  detailsTitle: { color: colors.maroonDark, fontSize: 15, fontWeight: '900', marginBottom: 8 },
  detailsDescription: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 14 },
  detailsActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  completeButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.maroon, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  completeButtonActive: { backgroundColor: colors.success },
  completeButtonText: { color: colors.paper, fontSize: 10, fontWeight: '900' },
  playLink: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, paddingHorizontal: 10 },
  playLinkText: { color: colors.maroon, fontSize: 10, fontWeight: '900' },

  // Logs styles
  logsContainer: { gap: 8, marginVertical: 6 },
  logsLabel: { color: colors.maroonDark, fontSize: 12, fontWeight: '800', marginBottom: 4 },
  inputLabel: { color: colors.muted, fontSize: 9, fontWeight: '700', marginTop: 4 },
  input: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, fontSize: 11, color: colors.ink },
  textArea: { minHeight: 52, textAlignVertical: 'top' },
  saveButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.success, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  saveButtonText: { color: colors.paper, fontSize: 10, fontWeight: '900' },

  // Quiz styles
  quizCard: { padding: 18, borderRadius: 24, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, ...shadows.card },
  quizHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  quizHeaderTitle: { color: colors.maroonDark, fontSize: 13, fontWeight: '900', textTransform: 'uppercase' },
  quizQuestionText: { color: colors.ink, fontSize: 14, fontWeight: '800', marginBottom: 16 },
  quizOptionsGrid: { gap: 10 },
  quizOptionButton: { minHeight: 48, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.canvas, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quizOptionCorrect: { backgroundColor: '#E6FFFA', borderColor: '#10b981' },
  quizOptionIncorrect: { backgroundColor: '#FEF2F2', borderColor: '#ef4444' },
  quizOptionDisabled: { opacity: 0.5 },
  quizOptionText: { color: colors.ink, fontSize: 12, fontWeight: '700', flex: 1 },
  quizOptionTextCorrect: { color: '#0f766e', fontWeight: '800' },
  quizOptionTextIncorrect: { color: '#991b1b', fontWeight: '800' },
  quizExplanationCard: { marginTop: 16, padding: 12, borderRadius: 10, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: colors.line },
  quizExplanationLabel: { color: '#0f766e', fontSize: 11, fontWeight: '800', marginBottom: 4 },
  quizExplanationText: { color: colors.muted, fontSize: 11, lineHeight: 16 },

  // Partner styles
  partnerCard: { padding: 18, borderRadius: 24, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, ...shadows.card },
  partnerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  partnerHeaderTitle: { color: colors.maroonDark, fontSize: 13, fontWeight: '900', textTransform: 'uppercase' },
  partnerTitleText: { color: colors.ink, fontSize: 14, fontWeight: '800', marginBottom: 6 },
  partnerDescriptionText: { color: colors.muted, fontSize: 11, lineHeight: 16, marginBottom: 16 },
  partnerActionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  partnerStatusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  partnerStatusPending: { backgroundColor: '#FFF3CD' },
  partnerStatusDone: { backgroundColor: '#D4EDDA' },
  partnerStatusText: { fontSize: 10, fontWeight: '800' },
  partnerStatusTextPending: { color: '#856404' },
  partnerStatusTextDone: { color: '#155724' },
  partnerAckButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.maroon },
  partnerAckButtonActive: { backgroundColor: colors.muted },
  partnerAckButtonText: { color: colors.paper, fontSize: 10, fontWeight: '900' },

  // Sensory styles
  sensoryCard: { padding: 18, borderRadius: 24, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, ...shadows.card, marginTop: 16 },
  sensoryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sensoryHeaderTitle: { color: colors.maroonDark, fontSize: 13, fontWeight: '900', textTransform: 'uppercase' },
  sensoryTypeBadge: { backgroundColor: '#F3E8FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  sensoryTypeText: { color: '#7C3AED', fontSize: 8, fontWeight: '900' },
  sensoryTitleText: { color: colors.ink, fontSize: 14, fontWeight: '800', marginBottom: 6 },
  sensoryDescriptionText: { color: colors.muted, fontSize: 11, lineHeight: 16, marginBottom: 16 },
  sensoryActionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sensoryStatusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  sensoryStatusPending: { backgroundColor: '#DBEAFE' },
  sensoryStatusDone: { backgroundColor: '#D4EDDA' },
  sensoryStatusText: { fontSize: 10, fontWeight: '800' },
  sensoryStatusTextPending: { color: '#1E40AF' },
  sensoryStatusTextDone: { color: '#155724' },
  sensoryAckButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.maroon },
  sensoryAckButtonActive: { backgroundColor: colors.muted },
  sensoryAckButtonText: { color: colors.paper, fontSize: 10, fontWeight: '900' },
  safetyBanner: { marginVertical: 12, padding: 12, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 10 },
  safetyTitle: { fontWeight: 'bold', color: '#B45309', fontSize: 11, marginBottom: 4 },
  safetyText: { fontSize: 10, color: '#78350F', lineHeight: 14, marginBottom: 6 },
  safetyDisclaimer: { fontSize: 9, color: '#9A3412', fontWeight: 'bold' },

  // Quick Actions Styles
  quickActionsContainer: { marginVertical: 12 },
  quickActionsTitle: { color: colors.maroonDark, fontSize: 13, fontWeight: '900', textTransform: 'uppercase', marginBottom: 8, paddingHorizontal: 4 },
  quickActionsRow: { gap: 10, paddingHorizontal: 4 },
  quickActionChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, gap: 6, ...shadows.card },
  quickActionIcon: { fontSize: 16 },
  quickActionLabel: { color: colors.maroonDark, fontSize: 12, fontWeight: '800' },

  // Additional Journey Card styles
  journeyBabyText: { color: colors.muted, fontSize: 11, fontStyle: 'italic', marginTop: 4, marginBottom: 8 },

  // Partner settings card styles
  partnerSettingsCard: { padding: 18, borderRadius: 24, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, ...shadows.card, marginTop: 16 },
  partnerEmailVal: { fontSize: 15, fontWeight: '800', color: colors.ink, marginTop: 2 },
  partnerSharingTitle: { color: colors.maroon, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 8 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  checkboxLabel: { fontSize: 12, color: colors.ink, fontWeight: '600', flex: 1 }
});
