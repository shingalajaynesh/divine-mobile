import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { GET_PRESCRIPTION_SUMMARY_QUERY, SUBMIT_CASE_NOTES_MUTATION } from '../graphql/operations.js';
import { colors, shadows } from '../theme/theme.js';

const GET_EXPERT_SCHEDULES = gql`
  query GetExpertSchedules {
    getExpertSchedules {
      id
      dayOfWeek
      startTime
      endTime
      slotDurationMins
      expert {
        id
        displayName
        emailAddress
      }
    }
  }
`;

const GET_MY_CONSULTATIONS = gql`
  query GetMyConsultations {
    getMyConsultations {
      id
      scheduleSlot
      videoCallUrl
      status
      caseNotes
      followUpTasks
      user {
        id
        displayName
      }
      expert {
        id
        displayName
      }
    }
  }
`;

const BOOK_CONSULTATION = gql`
  mutation BookConsultation($expertId: ID!, $scheduleSlot: String!) {
    bookConsultation(expertId: $expertId, scheduleSlot: $scheduleSlot) {
      id
      scheduleSlot
      videoCallUrl
    }
  }
`;

const CANCEL_CONSULTATION = gql`
  mutation CancelConsultation($bookingId: ID!) {
    cancelConsultation(bookingId: $bookingId)
  }
`;

export default function MobileExpertConsultation({ user }) {
  const userLang = user?.language || 'en';
  const isHi = userLang === 'hi';
  const isExpert = user?.role?.roleType === 'STAFF' || user?.role?.roleType === 'ADMIN';

  // GraphQL
  const { data: schedulesData, loading: loadingSchedules } = useQuery(GET_EXPERT_SCHEDULES);
  const { data: consultsData, loading: loadingConsults, refetch: refetchConsults } = useQuery(GET_MY_CONSULTATIONS);
  
  const [bookConsultation, { loading: booking }] = useMutation(BOOK_CONSULTATION);
  const [cancelConsultation, { loading: cancelling }] = useMutation(CANCEL_CONSULTATION);
  const [submitCaseNotes] = useMutation(SUBMIT_CASE_NOTES_MUTATION);

  // Selector states
  const [activeSubTab, setActiveSubTab] = useState('book');
  const [selectedExpertId, setSelectedExpertId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlotTime, setSelectedSlotTime] = useState('');

  // Editor states
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [caseNotes, setCaseNotes] = useState('');
  const [followUpTasks, setFollowUpTasks] = useState([]);
  const [newTaskInput, setNewTaskInput] = useState('');

  const schedules = schedulesData?.getExpertSchedules || [];
  const consults = consultsData?.getMyConsultations || [];

  // Group unique experts
  const uniqueExperts = [];
  schedules.forEach((s) => {
    if (!uniqueExperts.some((e) => e.id === s.expert.id)) {
      uniqueExperts.push(s.expert);
    }
  });

  const expertSchedules = schedules.filter((s) => s.expert.id === selectedExpertId);

  const getDateOptions = () => {
    const options = [];
    const today = new Date();

    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();

      const hasSched = expertSchedules.some((s) => s.dayOfWeek === dayOfWeek);
      if (hasSched) {
        options.push({
          dateStr: date.toISOString().split('T')[0],
          label: date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
        });
      }
    }
    return options;
  };

  const getSlotOptions = () => {
    if (!selectedDate) return [];
    const dateObj = new Date(selectedDate);
    const dayOfWeek = dateObj.getDay();

    const matchedSchedules = expertSchedules.filter((s) => s.dayOfWeek === dayOfWeek);
    const slots = [];

    matchedSchedules.forEach((s) => {
      let current = new Date(`${selectedDate}T${s.startTime}:00`);
      const end = new Date(`${selectedDate}T${s.endTime}:00`);

      while (current < end) {
        const timeStr = current.toTimeString().split(' ')[0].substring(0, 5);
        slots.push(timeStr);
        current.setMinutes(current.getMinutes() + s.slotDurationMins);
      }
    });

    return slots;
  };

  const handleBook = async () => {
    if (!selectedExpertId || !selectedDate || !selectedSlotTime) return;
    try {
      const slotTimestamp = new Date(`${selectedDate}T${selectedSlotTime}:00`).toISOString();
      await bookConsultation({
        variables: { expertId: selectedExpertId, scheduleSlot: slotTimestamp }
      });
      Alert.alert(isHi ? "सफलता" : "Success", isHi ? "परामर्श सफलतापूर्वक बुक किया गया!" : "Consultation booked!");
      refetchConsults();
      setActiveSubTab('appointments');
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      await cancelConsultation({ variables: { bookingId } });
      Alert.alert(isHi ? "सफलता" : "Cancelled", isHi ? "परामर्श रद्द कर दिया गया।" : "Booking cancelled successfully.");
      refetchConsults();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleSaveNotes = async (bookingId) => {
    try {
      await submitCaseNotes({
        variables: {
          input: { bookingId, caseNotes, followUpTasks }
        }
      });
      Alert.alert(isHi ? "सफलता" : "Success", isHi ? "केस नोट्स सहेजे गए।" : "Prescription notes saved.");
      setEditingBookingId(null);
      refetchConsults();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const addTask = () => {
    if (!newTaskInput.trim()) return;
    setFollowUpTasks([...followUpTasks, newTaskInput.trim()]);
    setNewTaskInput('');
  };

  const startEditNotes = (consult) => {
    setEditingBookingId(consult.id);
    setCaseNotes(consult.caseNotes || '');
    try {
      setFollowUpTasks(JSON.parse(consult.followUpTasks || '[]'));
    } catch (e) {
      setFollowUpTasks([]);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Title */}
      <View style={s.hero}>
        <View style={s.badge}>
          <Text style={s.badgeText}>{isHi ? "चिकित्सीय परामर्श" : "Medical Counseling"}</Text>
        </View>
        <Text style={s.heroTitle}>{isHi ? "विशेषज्ञ सलाह" : "Expert Consulting"}</Text>
        <Text style={s.heroSubtitle}>
          {isHi 
            ? "प्रसव-पूर्व सलाहकारों के साथ वन-टू-वन वीडियो सत्र बुक करें।" 
            : "Schedule 1-to-1 video guidance call sessions with gynecologist guides."}
        </Text>
      </View>

      {/* Tabs */}
      <View style={s.tabBar}>
        <TouchableOpacity 
          style={[s.tabBtn, activeSubTab === 'book' && s.tabBtnActive]} 
          onPress={() => setActiveSubTab('book')}
        >
          <Text style={[s.tabBtnText, activeSubTab === 'book' && s.tabBtnTextActive]}>
            {isHi ? "बुक करें" : "Book"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[s.tabBtn, activeSubTab === 'appointments' && s.tabBtnActive]} 
          onPress={() => setActiveSubTab('appointments')}
        >
          <Text style={[s.tabBtnText, activeSubTab === 'appointments' && s.tabBtnTextActive]}>
            {isHi ? "मेरे अपॉइंटमेंट" : "My Calls"}
          </Text>
        </TouchableOpacity>
      </View>

      {activeSubTab === 'book' ? (
        <View style={{ gap: 16 }}>
          {/* Select Expert */}
          <View style={s.card}>
            <Text style={s.cardTitle}>👩‍⚕️ {isHi ? "सलाहकार गाइड चुनें" : "Select Expert Guide"}</Text>
            {loadingSchedules ? (
              <ActivityIndicator color={colors.maroon} style={{ marginVertical: 16 }} />
            ) : uniqueExperts.length === 0 ? (
              <Text style={s.emptyText}>{isHi ? "इस समय कोई विशेषज्ञ उपलब्ध नहीं है।" : "No expert schedules configured."}</Text>
            ) : (
              <View style={{ gap: 8, marginTop: 12 }}>
                {uniqueExperts.map(expert => (
                  <TouchableOpacity 
                    key={expert.id} 
                    style={[s.expertCard, selectedExpertId === expert.id && s.expertCardActive]}
                    onPress={() => {
                      setSelectedExpertId(expert.id);
                      setSelectedDate('');
                      setSelectedSlotTime('');
                    }}
                  >
                    <View style={s.avatar}><Text style={s.avatarText}>Dr</Text></View>
                    <View>
                      <Text style={s.expertName}>Dr. {expert.displayName}</Text>
                      <Text style={s.expertSub}>{isHi ? "गर्भ संस्कार विशेषज्ञ" : "Obstetrics Consultant"}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Select Date */}
          {selectedExpertId !== '' && (
            <View style={s.card}>
              <Text style={s.cardTitle}>📅 {isHi ? "दिनांक चुनें" : "Select Date"}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 12 }}>
                {getDateOptions().map(opt => (
                  <TouchableOpacity 
                    key={opt.dateStr} 
                    style={[s.chip, selectedDate === opt.dateStr && s.chipActive]}
                    onPress={() => {
                      setSelectedDate(opt.dateStr);
                      setSelectedSlotTime('');
                    }}
                  >
                    <Text style={[s.chipText, selectedDate === opt.dateStr && s.chipTextActive]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Select Time slot */}
          {selectedDate !== '' && (
            <View style={s.card}>
              <Text style={s.cardTitle}>⏰ {isHi ? "समय स्लॉट चुनें" : "Select Time Slot"}</Text>
              <View style={s.slotGrid}>
                {getSlotOptions().map(time => (
                  <TouchableOpacity 
                    key={time} 
                    style={[s.slotChip, selectedSlotTime === time && s.slotChipActive]}
                    onPress={() => setSelectedSlotTime(time)}
                  >
                    <Text style={[s.slotChipText, selectedSlotTime === time && s.slotChipTextActive]}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Book seat button */}
          {selectedSlotTime !== '' && (
            <TouchableOpacity style={s.bookBtn} onPress={handleBook} disabled={booking}>
              {booking ? (
                <ActivityIndicator color={colors.paper} />
              ) : (
                <Text style={s.bookBtnText}>{isHi ? "परामर्श की पुष्टि करें" : "Book Call Appointment"}</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      ) : (
        /* My Appointments / Calls list */
        <View style={{ gap: 16 }}>
          {loadingConsults ? (
            <ActivityIndicator color={colors.maroon} style={{ marginVertical: 30 }} />
          ) : consults.filter(c => c.status === 'confirmed').length === 0 ? (
            <Text style={s.emptyText}>{isHi ? "कोई अपॉइंटमेंट नहीं मिला।" : "No confirmed call slots scheduled yet."}</Text>
          ) : (
            consults.filter(c => c.status === 'confirmed').map(consult => {
              let tasks = [];
              try {
                tasks = JSON.parse(consult.followUpTasks || '[]');
              } catch (e) {
                tasks = [];
              }

              return (
                <View key={consult.id} style={s.bookingCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={s.bookingTitle}>
                      {isExpert ? `Patient: ${consult.user.displayName}` : `Dr. ${consult.expert.displayName}`}
                    </Text>
                    <TouchableOpacity onPress={() => handleCancel(consult.id)} disabled={cancelling}>
                      <Ionicons name="close-circle-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={s.bookingTime}>
                    📅 {new Date(consult.scheduleSlot).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </Text>

                  {/* Actions */}
                  <TouchableOpacity style={s.callBtn} onPress={() => Linking.openURL(consult.videoCallUrl)}>
                    <Ionicons name="videocam" size={14} color={colors.paper} />
                    <Text style={s.callBtnText}>{isHi ? "कॉल में शामिल हों" : "Join Call Session"}</Text>
                  </TouchableOpacity>

                  {/* Case Notes & Prescriptions display */}
                  <View style={{ marginTop: 12 }}>
                    {editingBookingId === consult.id ? (
                      /* Expert Notes Editor Mode */
                      <View style={{ background: '#f8fafc', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.line, marginTop: 8 }}>
                        <Text style={s.label}>Clinical Notes</Text>
                        <TextInput
                          style={s.textArea}
                          value={caseNotes}
                          onChangeText={setCaseNotes}
                          placeholder="Clinical summary notes..."
                          multiline
                        />
                        <Text style={s.label}>Tasks</Text>
                        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
                          <TextInput
                            style={[s.input, { flex: 1, marginBottom: 0 }]}
                            value={newTaskInput}
                            onChangeText={setNewTaskInput}
                            placeholder="Add action task..."
                          />
                          <TouchableOpacity style={s.addTaskBtn} onPress={addTask}>
                            <Ionicons name="add" size={18} color={colors.paper} />
                          </TouchableOpacity>
                        </View>
                        {followUpTasks.map((t, idx) => (
                          <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
                            <Text style={{ fontSize: 11 }}>• {t}</Text>
                            <TouchableOpacity onPress={() => setFollowUpTasks(followUpTasks.filter((_, i) => i !== idx))}>
                              <Ionicons name="trash-outline" size={14} color={colors.error} />
                            </TouchableOpacity>
                          </View>
                        ))}
                        <TouchableOpacity style={[s.saveBtn, { marginTop: 12 }]} onPress={() => handleSaveNotes(consult.id)}>
                          <Text style={s.saveBtnText}>Save Notes</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      /* Display notes */
                      <View>
                        {consult.caseNotes ? (
                          <View style={s.prescriptionCard}>
                            <Text style={s.prescriptionHeader}>📋 {isHi ? "सत्र केस नोट्स" : "Session Prescription Notes"}</Text>
                            <Text style={s.prescriptionText}>{consult.caseNotes}</Text>
                            {tasks.length > 0 && (
                              <View style={{ marginTop: 8 }}>
                                <Text style={s.tasksHeader}>✅ {isHi ? "अनुवर्ती कार्य" : "Follow-up Tasks"}</Text>
                                {tasks.map((t, idx) => (
                                  <Text key={idx} style={s.taskItem}>• {t}</Text>
                                ))}
                              </View>
                            )}
                          </View>
                        ) : (
                          <Text style={{ fontSize: 10, color: colors.muted, fontStyle: 'italic', marginTop: 4 }}>
                            {isHi ? "कॉल समाप्त होने के बाद केस नोट्स यहाँ दिखाई देंगे।" : "Clinical prescription and tasks will appear here after slot."}
                          </Text>
                        )}

                        {isExpert && (
                          <TouchableOpacity 
                            style={{ alignSelf: 'flex-start', marginTop: 8 }}
                            onPress={() => startEditNotes(consult)}
                          >
                            <Text style={{ fontSize: 11, color: colors.maroon, fontWeight: '800' }}>
                              ✍️ {consult.caseNotes ? "Edit Case Notes" : "Write Case Notes"}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 20, paddingBottom: 60, gap: 20 },
  hero: { marginBottom: 4 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: '#EBF8FF', borderWidth: 1, borderColor: '#3182CE', marginBottom: 8 },
  badgeText: { color: '#2b6cb0', fontSize: 10, fontWeight: '800' },
  heroTitle: { color: colors.maroonDark, fontSize: 26, fontWeight: '900' },
  heroSubtitle: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  tabBar: { flexDirection: 'row', backgroundColor: colors.paper, borderRadius: 16, padding: 4, borderWidth: 1, borderColor: colors.line },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  tabBtnActive: { backgroundColor: colors.maroon },
  tabBtnText: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  tabBtnTextActive: { color: colors.paper },
  card: { padding: 20, borderRadius: 24, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, ...shadows.card },
  cardTitle: { color: colors.maroonDark, fontSize: 14, fontWeight: '900' },
  emptyText: { color: colors.muted, fontSize: 12, fontStyle: 'italic', textAlign: 'center', marginVertical: 20 },
  expertCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16, backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.line },
  expertCardActive: { borderColor: colors.maroon, backgroundColor: '#FFF5F5' },
  avatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#FFF0D3', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.saffron, fontSize: 14, fontWeight: '900' },
  expertName: { color: colors.maroonDark, fontSize: 13, fontWeight: '800' },
  expertSub: { color: colors.muted, fontSize: 10, marginTop: 2 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.line },
  chipActive: { backgroundColor: colors.maroon, borderColor: colors.maroon },
  chipText: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  chipTextActive: { color: colors.paper },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  slotChip: { width: '31%', paddingVertical: 10, borderRadius: 10, backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.line, alignItems: 'center' },
  slotChipActive: { backgroundColor: colors.maroon, borderColor: colors.maroon },
  slotChipText: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  slotChipTextActive: { color: colors.paper },
  bookBtn: { height: 48, borderRadius: 14, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center' },
  bookBtnText: { color: colors.paper, fontSize: 12, fontWeight: '900' },
  bookingCard: { padding: 18, borderRadius: 20, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, ...shadows.card },
  bookingTitle: { fontSize: 14, fontWeight: '800', color: colors.maroonDark },
  bookingTime: { fontSize: 11, color: colors.saffron, marginTop: 4, fontWeight: '700' },
  callBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.success, paddingVertical: 10, borderRadius: 10, marginTop: 12 },
  callBtnText: { color: colors.paper, fontSize: 11, fontWeight: '900' },
  prescriptionCard: { background: '#F0FDF4', border: '1px solid #bcf0da', padding: 14, borderRadius: 12, marginTop: 12, backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#bcf0da' },
  prescriptionHeader: { fontSize: 11, fontWeight: '800', color: '#14532d', marginBottom: 4 },
  prescriptionText: { fontSize: 11, color: '#166534', lineHeight: 15 },
  tasksHeader: { fontSize: 10, fontWeight: '900', color: '#14532d', marginTop: 8, marginBottom: 4 },
  taskItem: { fontSize: 10, color: '#15803d', marginLeft: 6 },
  label: { fontSize: 10, fontWeight: '800', color: colors.muted, marginBottom: 4 },
  textArea: { height: 60, padding: 8, borderWidth: 1, borderColor: colors.line, borderRadius: 8, fontSize: 11, backgroundColor: colors.paper, textAlignVertical: 'top', marginBottom: 10 },
  input: { height: 36, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.line, borderRadius: 8, fontSize: 11, backgroundColor: colors.paper },
  addTaskBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center' },
  saveBtn: { height: 36, borderRadius: 8, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: colors.paper, fontSize: 10, fontWeight: '900' }
});
