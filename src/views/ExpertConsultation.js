import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Linking,
  Modal,
  FlatList
} from 'react-native';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, spacing, radius } from '../theme/theme.js';
import { SUBMIT_CASE_NOTES_MUTATION } from '../graphql/operations.js';

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
        emailAddress
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

// NEW mutations for Slot setup and Status updates
const CREATE_EXPERT_SCHEDULE = gql`
  mutation CreateExpertSchedule($dayOfWeek: Int!, $startTime: String!, $endTime: String!, $slotDurationMins: Int!) {
    createExpertSchedule(dayOfWeek: $dayOfWeek, startTime: $startTime, endTime: $endTime, slotDurationMins: $slotDurationMins) {
      id
      dayOfWeek
      startTime
      endTime
      slotDurationMins
    }
  }
`;

const DELETE_EXPERT_SCHEDULE = gql`
  mutation DeleteExpertSchedule($id: ID!) {
    deleteExpertSchedule(id: $id)
  }
`;

const UPDATE_CONSULTATION_STATUS = gql`
  mutation UpdateConsultationStatus($bookingId: ID!, $status: String!) {
    updateConsultationStatus(bookingId: $bookingId, status: $status) {
      id
      status
    }
  }
`;

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function MobileExpertConsultation({ user }) {
  const userLang = user?.language || 'en';
  const isHi = userLang === 'hi';
  const isExpert = user?.role?.roleType === 'GUIDE' || user?.role?.roleType === 'STAFF' || user?.role?.roleType === 'ADMIN';

  // State
  const [activeSubTab, setActiveSubTab] = useState(isExpert ? 'queue' : 'book'); // 'queue' | 'slots' | 'book' | 'appointments'

  // Booking selectors
  const [selectedExpertId, setSelectedExpertId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlotTime, setSelectedSlotTime] = useState('');

  // Slots setup selectors
  const [newDayOfWeek, setNewDayOfWeek] = useState(1); // Monday
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('17:00');
  const [newDuration, setNewDuration] = useState(30);

  // Status Selector modal
  const [statusSelectorBooking, setStatusSelectorBooking] = useState(null);

  // Editor states
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [caseNotes, setCaseNotes] = useState('');
  const [followUpTasks, setFollowUpTasks] = useState([]);
  const [newTaskInput, setNewTaskInput] = useState('');

  // Queries
  const { data: schedulesData, loading: loadingSchedules, refetch: refetchSchedules } = useQuery(GET_EXPERT_SCHEDULES);
  const { data: consultsData, loading: loadingConsults, refetch: refetchConsults } = useQuery(GET_MY_CONSULTATIONS);

  // Mutations
  const [bookConsultation, { loading: booking }] = useMutation(BOOK_CONSULTATION);
  const [cancelConsultation, { loading: cancelling }] = useMutation(CANCEL_CONSULTATION);
  const [submitCaseNotes] = useMutation(SUBMIT_CASE_NOTES_MUTATION);

  const [createExpertSchedule, { loading: creatingSchedule }] = useMutation(CREATE_EXPERT_SCHEDULE, {
    onCompleted: () => {
      refetchSchedules();
      Alert.alert('Success', isHi ? 'शेड्यूल स्लॉट सहेजा गया' : 'Schedule slot created successfully');
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [deleteExpertSchedule] = useMutation(DELETE_EXPERT_SCHEDULE, {
    onCompleted: () => {
      refetchSchedules();
      Alert.alert('Success', isHi ? 'साप्ताहिक स्लॉट हटाया गया' : 'Schedule slot deleted successfully');
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [updateConsultationStatus] = useMutation(UPDATE_CONSULTATION_STATUS, {
    onCompleted: () => {
      refetchConsults();
      setStatusSelectorBooking(null);
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

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

  // Filter own weekly slots
  const mySchedules = schedules.filter((s) => s.expert?.id === user?.id);

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

  const handleCreateSlot = () => {
    if (!newStartTime || !newEndTime) {
      Alert.alert('Error', isHi ? 'समय दर्ज करें' : 'Please type start and end times');
      return;
    }
    createExpertSchedule({
      variables: {
        dayOfWeek: parseInt(newDayOfWeek),
        startTime: newStartTime,
        endTime: newEndTime,
        slotDurationMins: parseInt(newDuration)
      }
    });
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
    <View style={s.container}>
      {/* Tab bar header */}
      <View style={s.tabBar}>
        {isExpert ? (
          <>
            <TouchableOpacity 
              style={[s.tabBtn, activeSubTab === 'queue' && s.tabBtnActive]} 
              onPress={() => setActiveSubTab('queue')}
            >
              <Text style={[s.tabBtnText, activeSubTab === 'queue' && s.tabBtnTextActive]}>
                {isHi ? "कतार" : "Queue"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[s.tabBtn, activeSubTab === 'slots' && s.tabBtnActive]} 
              onPress={() => setActiveSubTab('slots')}
            >
              <Text style={[s.tabBtnText, activeSubTab === 'slots' && s.tabBtnTextActive]}>
                {isHi ? "साप्ताहिक सेटिंग्स" : "Setup Slots"}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
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
                {isHi ? "मेरे कॉल" : "My Calls"}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <ScrollView contentContainerStyle={s.content}>

        {/* ========================================== */}
        {/* EXPERT VIEW 1: QUEUE LIST */}
        {/* ========================================== */}
        {isExpert && activeSubTab === 'queue' && (
          <View style={{ gap: 16 }}>
            {loadingConsults ? (
              <ActivityIndicator color={colors.maroon} style={{ marginVertical: 30 }} />
            ) : consults.length === 0 ? (
              <Text style={s.emptyText}>{isHi ? "कोई अपॉइंटमेंट नहीं मिला।" : "No booked appointments."}</Text>
            ) : (
              consults.map(consult => {
                let tasks = [];
                try {
                  tasks = JSON.parse(consult.followUpTasks || '[]');
                } catch (e) {
                  tasks = [];
                }

                return (
                  <View key={consult.id} style={s.bookingCard}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View>
                        <Text style={s.bookingTitle}>Patient: {consult.user?.displayName || 'Member'}</Text>
                        <Text style={{ fontSize: 10, color: colors.muted }}>{consult.user?.emailAddress}</Text>
                        <Text style={s.bookingTime}>
                          📅 {new Date(consult.scheduleSlot).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        <TouchableOpacity 
                          style={s.statusBadge}
                          onPress={() => setStatusSelectorBooking(consult)}
                        >
                          <Text style={s.statusBadgeText}>{consult.status.toUpperCase()}</Text>
                          <Ionicons name="caret-down" size={10} color={colors.maroon} />
                        </TouchableOpacity>
                        {consult.status !== 'cancelled' && (
                          <TouchableOpacity onPress={() => handleCancel(consult.id)} disabled={cancelling}>
                            <Text style={{ fontSize: 10, color: colors.error, fontWeight: 'bold' }}>Cancel</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    <TouchableOpacity style={s.callBtn} onPress={() => Linking.openURL(consult.videoCallUrl)}>
                      <Ionicons name="videocam" size={14} color={colors.paper} />
                      <Text style={s.callBtnText}>{isHi ? "कॉल शुरू करें" : "Start Video Call"}</Text>
                    </TouchableOpacity>

                    {/* Editor / Display */}
                    <View style={{ marginTop: 12 }}>
                      {editingBookingId === consult.id ? (
                        <View style={s.editorSection}>
                          <Text style={s.label}>Session Prescription Notes</Text>
                          <TextInput 
                            style={s.textArea}
                            value={caseNotes}
                            onChangeText={setCaseNotes}
                            multiline
                            placeholder="Write medical advice..."
                          />
                          <Text style={s.label}>Follow-up Tasks</Text>
                          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
                            <TextInput 
                              style={[s.input, { flex: 1 }]}
                              value={newTaskInput}
                              onChangeText={setNewTaskInput}
                              placeholder="e.g. Drink water..."
                            />
                            <TouchableOpacity style={s.addTaskBtn} onPress={addTask}>
                              <Ionicons name="add" size={18} color={colors.paper} />
                            </TouchableOpacity>
                          </View>
                          {followUpTasks.map((t, idx) => (
                            <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 2 }}>
                              <Text style={{ fontSize: 11 }}>• {t}</Text>
                              <TouchableOpacity onPress={() => setFollowUpTasks(followUpTasks.filter((_, i) => i !== idx))}>
                                <Ionicons name="trash" size={12} color={colors.error} />
                              </TouchableOpacity>
                            </View>
                          ))}
                          <TouchableOpacity style={s.saveBtn} onPress={() => handleSaveNotes(consult.id)}>
                            <Text style={s.saveBtnText}>Submit Notes</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View>
                          {consult.caseNotes ? (
                            <View style={s.prescriptionCard}>
                              <Text style={s.prescriptionHeader}>Clinical Notes</Text>
                              <Text style={s.prescriptionText}>{consult.caseNotes}</Text>
                              {tasks.length > 0 && (
                                <View style={{ marginTop: 8 }}>
                                  <Text style={s.tasksHeader}>Tasks Assigned:</Text>
                                  {tasks.map((t, idx) => (
                                    <Text key={idx} style={s.taskItem}>• {t}</Text>
                                  ))}
                                </View>
                              )}
                            </View>
                          ) : (
                            <Text style={{ fontSize: 10, color: colors.muted, fontStyle: 'italic' }}>
                              No clinical summary recorded.
                            </Text>
                          )}
                          <TouchableOpacity style={{ marginTop: 8 }} onPress={() => startEditNotes(consult)}>
                            <Text style={{ fontSize: 11, color: colors.maroon, fontWeight: 'bold' }}>
                              {consult.caseNotes ? "Edit Clinical Notes" : "Write Case Notes"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ========================================== */}
        {/* EXPERT VIEW 2: SETUP WEEKLY SLOTS */}
        {/* ========================================== */}
        {isExpert && activeSubTab === 'slots' && (
          <View style={{ gap: 16 }}>
            {/* Slot setup card */}
            <View style={s.card}>
              <Text style={s.cardTitle}>{isHi ? "नया समय स्लॉट जोड़ें" : "Configure Time Block"}</Text>
              
              <Text style={s.inputLabel}>Day of Week</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginVertical: 6 }}>
                {DAYS.map((d, idx) => (
                  <TouchableOpacity 
                    key={d} 
                    style={[s.dayChip, newDayOfWeek === idx && s.dayChipActive]}
                    onPress={() => setNewDayOfWeek(idx)}
                  >
                    <Text style={[s.dayChipText, newDayOfWeek === idx && s.dayChipTextActive]}>{d.substring(0, 3)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={s.inputLabel}>Start Time (e.g. 09:00)</Text>
                  <TextInput 
                    style={s.input} 
                    value={newStartTime} 
                    onChangeText={setNewStartTime} 
                    placeholder="09:00"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.inputLabel}>End Time (e.g. 17:00)</Text>
                  <TextInput 
                    style={s.input} 
                    value={newEndTime} 
                    onChangeText={setNewEndTime} 
                    placeholder="17:00"
                  />
                </View>
              </View>

              <Text style={s.inputLabel}>Duration (Mins)</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginVertical: 8 }}>
                {[15, 30, 45, 60].map(mins => (
                  <TouchableOpacity 
                    key={mins} 
                    style={[s.minsChip, newDuration === mins && s.minsChipActive]}
                    onPress={() => setNewDuration(mins)}
                  >
                    <Text style={[s.minsChipText, newDuration === mins && s.minsChipTextActive]}>{mins}m</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={s.bookBtn} 
                onPress={handleCreateSlot}
                disabled={creatingSchedule}
              >
                <Text style={s.bookBtnText}>{isHi ? "स्लॉट जोड़ें" : "Save Slot Config"}</Text>
              </TouchableOpacity>
            </View>

            {/* List current slots */}
            <Text style={s.sectionHeading}>{isHi ? "सक्रिय उपलब्धता" : "Active Weekly Slots"}</Text>
            {loadingSchedules ? (
              <ActivityIndicator color={colors.maroon} />
            ) : mySchedules.length === 0 ? (
              <Text style={s.emptyText}>{isHi ? "कोई स्लॉट सेट नहीं है।" : "No weekly slots configured yet."}</Text>
            ) : (
              mySchedules.map(sched => (
                <View key={sched.id} style={s.slotRow}>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: 'bold' }}>{DAYS[sched.dayOfWeek]}</Text>
                    <Text style={{ fontSize: 11, color: colors.muted }}>{sched.startTime} - {sched.endTime} ({sched.slotDurationMins}m slots)</Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteExpertSchedule({ variables: { id: sched.id } })}>
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* ========================================== */}
        {/* MOTHER VIEW 1: BOOK CONSULTATION */}
        {/* ========================================== */}
        {!isExpert && activeSubTab === 'book' && (
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
                      <View style={[s.avatar, { backgroundColor: '#FFE4E6' }]}><Text style={[s.avatarText, { color: colors.maroon }]}>Dr</Text></View>
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
        )}

        {/* ========================================== */}
        {/* MOTHER VIEW 2: APPOINTMENTS LIST */}
        {/* ========================================== */}
        {!isExpert && activeSubTab === 'appointments' && (
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
                      <Text style={s.bookingTitle}>Dr. {consult.expert?.displayName || 'Expert Guide'}</Text>
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

                    {/* Display notes */}
                    <View style={{ marginTop: 12 }}>
                      {consult.caseNotes ? (
                        <View style={s.prescriptionCard}>
                          <Text style={s.prescriptionHeader}>Prescription Notes</Text>
                          <Text style={s.prescriptionText}>{consult.caseNotes}</Text>
                          {tasks.length > 0 && (
                            <View style={{ marginTop: 8 }}>
                              <Text style={s.tasksHeader}>Daily Tasks to Follow:</Text>
                              {tasks.map((t, idx) => (
                                <Text key={idx} style={s.taskItem}>• {t}</Text>
                              ))}
                            </View>
                          )}
                        </View>
                      ) : (
                        <Text style={{ fontSize: 10, color: colors.muted, fontStyle: 'italic' }}>
                          Prescription notes will appear here after call.
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

      </ScrollView>

      {/* Status Picker Modal for Experts */}
      <Modal
        visible={statusSelectorBooking !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setStatusSelectorBooking(null)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Update Consultation Status</Text>
            {['confirmed', 'completed', 'no_show'].map(st => (
              <TouchableOpacity 
                key={st}
                style={s.statusOption}
                onPress={() => updateConsultationStatus({ variables: { bookingId: statusSelectorBooking.id, status: st } })}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.ink }}>{st.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.closeBtn} onPress={() => setStatusSelectorBooking(null)}>
              <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.lg, paddingBottom: 60, gap: 16 },
  
  tabBar: { flexDirection: 'row', backgroundColor: colors.paper, padding: 4, borderBottomWidth: 1, borderBottomColor: colors.line },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  tabBtnActive: { backgroundColor: colors.maroon, borderRadius: radius.sm },
  tabBtnText: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  tabBtnTextActive: { color: colors.paper, fontWeight: '900' },

  card: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, ...shadows.card },
  cardTitle: { color: colors.maroonDark, fontSize: 13, fontWeight: '900' },
  emptyText: { color: colors.muted, fontSize: 11, fontStyle: 'italic', textAlign: 'center', marginVertical: 20 },
  expertCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.line },
  expertCardActive: { borderColor: colors.maroon, backgroundColor: '#FFF5F5' },
  avatar: { width: 38, height: 38, borderRadius: radius.sm, backgroundColor: '#FFF0D3', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.saffron, fontSize: 12, fontWeight: '900' },
  expertName: { color: colors.maroonDark, fontSize: 12, fontWeight: '800' },
  expertSub: { color: colors.muted, fontSize: 10, marginTop: 2 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.line },
  chipActive: { backgroundColor: colors.maroon, borderColor: colors.maroon },
  chipText: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  chipTextActive: { color: colors.paper },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  slotChip: { width: '31%', paddingVertical: 8, borderRadius: 8, backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.line, alignItems: 'center' },
  slotChipActive: { backgroundColor: colors.maroon, borderColor: colors.maroon },
  slotChipText: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  slotChipTextActive: { color: colors.paper },
  bookBtn: { height: 42, borderRadius: 10, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  bookBtnText: { color: colors.paper, fontSize: 12, fontWeight: '900' },
  bookingCard: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, ...shadows.card },
  bookingTitle: { fontSize: 13, fontWeight: '800', color: colors.maroonDark },
  bookingTime: { fontSize: 11, color: colors.saffron, marginTop: 4, fontWeight: '700' },
  callBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.success, paddingVertical: 8, borderRadius: 8, marginTop: 12 },
  callBtnText: { color: colors.paper, fontSize: 11, fontWeight: '900' },
  
  // Status Selector
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  statusBadgeText: { fontSize: 9, fontWeight: '800', color: colors.maroon },
  
  // Clinical Notes
  prescriptionCard: { padding: 12, borderRadius: 10, backgroundColor: '#F0FDF4', borderWidth: 1, borderColor: '#bcf0da', marginTop: 8 },
  prescriptionHeader: { fontSize: 11, fontWeight: '800', color: '#14532d', marginBottom: 4 },
  prescriptionText: { fontSize: 11, color: '#166534' },
  tasksHeader: { fontSize: 10, fontWeight: '900', color: '#14532d', marginTop: 6, marginBottom: 4 },
  taskItem: { fontSize: 10, color: '#15803d', marginLeft: 6 },

  // Editor
  editorSection: { backgroundColor: colors.canvas, padding: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line, marginTop: 8 },
  label: { fontSize: 10, fontWeight: '800', color: colors.muted, marginBottom: 4 },
  textArea: { height: 60, padding: 8, borderWidth: 1, borderColor: colors.line, borderRadius: 8, fontSize: 11, backgroundColor: colors.paper, textAlignVertical: 'top', marginBottom: 8 },
  input: { height: 36, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.line, borderRadius: 8, fontSize: 11, backgroundColor: colors.paper },
  addTaskBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center' },
  saveBtn: { height: 36, borderRadius: 8, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  saveBtnText: { color: colors.paper, fontSize: 11, fontWeight: '900' },

  // Slots setup
  inputLabel: { fontSize: 10, fontWeight: '800', color: colors.muted, marginTop: 8 },
  dayChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.line },
  dayChipActive: { backgroundColor: colors.maroon, borderColor: colors.maroon },
  dayChipText: { fontSize: 10, color: colors.muted, fontWeight: '800' },
  dayChipTextActive: { color: colors.paper },
  minsChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.line },
  minsChipActive: { backgroundColor: colors.maroon, borderColor: colors.maroon },
  minsChipText: { fontSize: 10, color: colors.muted, fontWeight: '800' },
  minsChipTextActive: { color: colors.paper },
  sectionHeading: { fontSize: 12, fontWeight: '900', color: colors.maroonDark, marginTop: 12 },
  slotRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, backgroundColor: colors.paper, borderRadius: radius.md, borderWidth: 1, borderColor: colors.line },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.xl },
  modalContent: { backgroundColor: colors.paper, borderRadius: radius.lg, padding: spacing.lg, gap: 12 },
  modalTitle: { fontSize: 14, fontWeight: '900', color: colors.maroonDark, textAlign: 'center', marginBottom: 8 },
  statusOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line, alignItems: 'center' },
  closeBtn: { marginTop: 8, backgroundColor: colors.canvas, paddingVertical: 10, borderRadius: 6, alignItems: 'center' }
});
