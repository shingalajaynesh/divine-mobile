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
  FlatList,
  Modal
} from 'react-native';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, spacing, radius } from '../theme/theme.js';

const GET_CRM_USERS_QUERY = gql`
  query GetCrmUsers {
    getCrmUsers {
      id
      displayName
      email
      phone
      pregnancyStartDate
      pregnancyDay
      role {
        roleType
      }
    }
  }
`;

const GET_CRM_NOTES_QUERY = gql`
  query GetCrmNotes($userId: ID!) {
    getCrmNotes(userId: $userId) {
      id
      note
      createdAt
      author {
        displayName
      }
    }
  }
`;

const ADD_CRM_NOTE_MUTATION = gql`
  mutation AddCrmNote($userId: ID!, $note: String!) {
    addCrmNote(userId: $userId, note: $note) {
      id
      note
    }
  }
`;

// NEW operations for Tasks, Classes, and Attendance
const GET_STAFF_TASKS_QUERY = gql`
  query GetStaffTasks {
    getStaffTasks {
      id
      title
      description
      dueDate
      completed
      createdAt
      user {
        id
        displayName
        emailAddress
      }
    }
  }
`;

const CREATE_STAFF_TASK_MUTATION = gql`
  mutation CreateStaffTask($userId: ID, $title: String!, $description: String, $dueDate: String) {
    createStaffTask(userId: $userId, title: $title, description: $description, dueDate: $dueDate) {
      id
      title
      completed
    }
  }
`;

const TOGGLE_STAFF_TASK_MUTATION = gql`
  mutation ToggleStaffTask($id: ID!) {
    toggleStaffTask(id: $id) {
      id
      completed
    }
  }
`;

const DELETE_STAFF_TASK_MUTATION = gql`
  mutation DeleteStaffTask($id: ID!) {
    deleteStaffTask(id: $id)
  }
`;

const GET_LIVE_CLASSES_QUERY = gql`
  query GetLiveClasses {
    getLiveClassesDetailed {
      id
      title
      instructor
      startTime
      durationMins
    }
  }
`;

const GET_CLASS_BOOKINGS_QUERY = gql`
  query GetClassBookings($classId: ID!) {
    getLiveClassBookings(classId: $classId) {
      userId
      liveClassId
      attended
      user {
        id
        displayName
        emailAddress
        mobileNo
      }
    }
  }
`;

const RECORD_ATTENDANCE_MUTATION = gql`
  mutation RecordClassAttendance($classId: ID!, $userId: ID!, $attended: Boolean!) {
    recordClassAttendance(classId: $classId, userId: $userId, attended: $attended) {
      userId
      liveClassId
      attended
    }
  }
`;

export default function MobileStaffConsole({ user }) {
  const isHi = user?.language === 'hi';
  const [activeTab, setActiveTab] = useState('crm'); // 'crm' | 'followups' | 'tasks' | 'attendance'
  
  // Search & Profile states
  const [crmSearch, setCrmSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newNote, setNewNote] = useState('');

  // Task creation states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [selectedMemberForTask, setSelectedMemberForTask] = useState(null);

  // Attendance states
  const [selectedClass, setSelectedClass] = useState(null);
  const [showClassSelector, setShowClassSelector] = useState(false);

  // Queries
  const crmUsersQuery = useQuery(GET_CRM_USERS_QUERY);
  const notesQuery = useQuery(GET_CRM_NOTES_QUERY, {
    variables: { userId: selectedUser?.id },
    skip: !selectedUser
  });
  const staffTasksQuery = useQuery(GET_STAFF_TASKS_QUERY);
  const liveClassesQuery = useQuery(GET_LIVE_CLASSES_QUERY);
  const classBookingsQuery = useQuery(GET_CLASS_BOOKINGS_QUERY, {
    variables: { classId: selectedClass?.id },
    skip: !selectedClass
  });

  // Mutations
  const [addCrmNote] = useMutation(ADD_CRM_NOTE_MUTATION, {
    onCompleted: () => {
      notesQuery.refetch();
      setNewNote('');
      Alert.alert('Success', isHi ? 'क्लिनिकल नोट सहेजा गया' : 'Clinical coaching note saved');
    }
  });

  const [createStaffTask, { loading: creatingTask }] = useMutation(CREATE_STAFF_TASK_MUTATION, {
    onCompleted: () => {
      staffTasksQuery.refetch();
      setNewTaskTitle('');
      setNewTaskDesc('');
      setSelectedMemberForTask(null);
      Alert.alert('Success', isHi ? 'कार्य बनाया गया!' : 'Task created successfully!');
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [toggleStaffTask] = useMutation(TOGGLE_STAFF_TASK_MUTATION, {
    onCompleted: () => staffTasksQuery.refetch()
  });

  const [deleteStaffTask] = useMutation(DELETE_STAFF_TASK_MUTATION, {
    onCompleted: () => {
      staffTasksQuery.refetch();
      Alert.alert('Success', isHi ? 'कार्य हटाया गया!' : 'Task removed!');
    }
  });

  const [recordClassAttendance] = useMutation(RECORD_ATTENDANCE_MUTATION, {
    onCompleted: () => {
      classBookingsQuery.refetch();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  // Actions
  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedUser) return;
    try {
      await addCrmNote({ variables: { userId: selectedUser.id, note: newNote.trim() } });
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) {
      Alert.alert('Error', isHi ? 'कृपया शीर्षक दर्ज करें' : 'Please type a title');
      return;
    }
    createStaffTask({
      variables: {
        userId: selectedMemberForTask?.id || null,
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim() || null,
        dueDate: null
      }
    });
  };

  // Filters
  const crmUsers = crmUsersQuery.data?.getCrmUsers || [];
  const crmNotes = notesQuery.data?.getCrmNotes || [];
  const staffTasks = staffTasksQuery.data?.getStaffTasks || [];
  const liveClasses = liveClassesQuery.data?.getLiveClassesDetailed || [];
  const classBookings = classBookingsQuery.data?.getLiveClassBookings || [];

  const filteredUsers = crmUsers.filter(u => {
    const q = crmSearch.toLowerCase();
    return u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const mothersOnly = crmUsers.filter(u => u.role?.roleType === 'MOTHER' || !u.role);

  // Follow-up Queue algorithm: Highlight mothers near third trimester or with pending followups
  const mothersQueue = mothersOnly.map(m => {
    const pendingTasksCount = staffTasks.filter(t => t.user?.id === m.id && !t.completed).length;
    const isHighPriority = pendingTasksCount > 0 || m.pregnancyDay > 220;
    return { ...m, pendingTasksCount, isHighPriority };
  });

  // Loading / Error
  const loading = crmUsersQuery.loading || staffTasksQuery.loading;

  if (selectedUser) {
    return (
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <View style={s.card}>
          <TouchableOpacity style={s.backBtn} onPress={() => setSelectedUser(null)}>
            <Ionicons name="arrow-back" size={16} color={colors.maroon} />
            <Text style={s.backText}>{isHi ? 'निर्देशिका पर वापस जाएँ' : 'Back to Directory'}</Text>
          </TouchableOpacity>

          <Text style={s.patientName}>{selectedUser.displayName}</Text>
          <Text style={{ fontSize: 11, color: colors.muted }}>{selectedUser.email} · Day {selectedUser.pregnancyDay || 'Not set'}</Text>

          <Divider />

          <Text style={s.sectionTitle}>{isHi ? 'कोचिंग नोट जोड़ें' : 'Add Coaching Note'}</Text>
          <TextInput 
            style={s.textArea} 
            placeholder={isHi ? 'सलाह या आहार समायोजन टाइप करें...' : 'Type clinical adjustments or tips...'}
            value={newNote}
            onChangeText={setNewNote}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity style={s.saveBtn} onPress={handleAddNote}>
            <Text style={s.saveBtnText}>{isHi ? 'नोट सहेजें' : 'Save Coaching Note'}</Text>
          </TouchableOpacity>

          <Divider />

          <Text style={s.sectionTitle}>{isHi ? 'पिछले क्लिनिकल नोट्स' : 'Past Clinical Notes'}</Text>
          {notesQuery.loading ? (
            <ActivityIndicator color={colors.maroon} />
          ) : crmNotes.length === 0 ? (
            <Text style={s.emptyText}>{isHi ? 'अभी कोई नोट नहीं सहेजा गया।' : 'No coaching notes registered yet.'}</Text>
          ) : (
            crmNotes.map(n => (
              <View key={n.id} style={s.noteItem}>
                <Text style={s.noteMeta}>{n.author?.displayName} · {new Date(n.createdAt).toLocaleDateString()}</Text>
                <Text style={s.noteText}>"{n.note}"</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={s.container}>
      {/* Tabs */}
      <View style={s.tabsHeader}>
        {[
          { id: 'crm', icon: 'people', label: isHi ? 'सदस्य' : 'Directory' },
          { id: 'followups', icon: 'warning', label: isHi ? 'अनुवर्ती' : 'Followups' },
          { id: 'tasks', icon: 'checkbox', label: isHi ? 'कार्य' : 'Tasks' },
          { id: 'attendance', icon: 'calendar', label: isHi ? 'उपस्थिति' : 'Attendance' }
        ].map(tab => (
          <TouchableOpacity 
            key={tab.id} 
            style={[s.tabButton, activeTab === tab.id && s.tabButtonActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons name={tab.icon} size={18} color={activeTab === tab.id ? colors.paper : colors.muted} />
            <Text style={[s.tabLabel, activeTab === tab.id && s.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.content}>
        
        {/* 1. DIRECTORY TAB */}
        {activeTab === 'crm' && (
          <View>
            <TextInput 
              style={s.input} 
              placeholder={isHi ? "नाम या ईमेल द्वारा खोजें..." : "Search directory by name or email..."}
              value={crmSearch}
              onChangeText={setCrmSearch}
            />

            {loading ? (
              <ActivityIndicator color={colors.maroon} style={{ marginVertical: 30 }} />
            ) : (
              filteredUsers.map(u => (
                <TouchableOpacity key={u.id} style={s.userTile} onPress={() => setSelectedUser(u)}>
                  <View>
                    <Text style={s.userTileName}>{u.displayName}</Text>
                    <Text style={s.userTileSub}>{u.email} · Day {u.pregnancyDay || 'Not set'}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* 2. FOLLOWUPS TAB */}
        {activeTab === 'followups' && (
          <View>
            <View style={s.alertBanner}>
              <Ionicons name="alert-circle" size={20} color={colors.maroon} />
              <Text style={s.alertBannerText}>
                {isHi ? "त्वरित क्लिनिकल अनुवर्ती कतार" : "Urgent Followup queues for mothers needing contact."}
              </Text>
            </View>

            {loading ? (
              <ActivityIndicator color={colors.maroon} />
            ) : (
              mothersQueue.map(m => (
                <View key={m.id} style={s.followupTile}>
                  <View>
                    <Text style={s.userTileName}>{m.displayName}</Text>
                    <Text style={s.userTileSub}>Pregnancy Day: {m.pregnancyDay || 'Not set'}</Text>
                    {m.isHighPriority && (
                      <View style={s.alertBadge}>
                        <Text style={s.alertBadgeText}>{isHi ? '🚨 ध्यान दें' : '🚨 High Priority'}</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity 
                      style={s.miniBtn} 
                      onPress={() => {
                        setSelectedMemberForTask(m);
                        setNewTaskTitle(`Follow up with ${m.displayName}`);
                        setActiveTab('tasks');
                      }}
                    >
                      <Text style={s.miniBtnText}>{isHi ? 'अनुसूची' : 'Schedule'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.miniBtn, { backgroundColor: colors.success }]} onPress={() => setSelectedUser(m)}>
                      <Text style={s.miniBtnText}>{isHi ? 'नोट' : 'Note'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* 3. TASKS TAB */}
        {activeTab === 'tasks' && (
          <View>
            {/* Create Task Card */}
            <View style={s.createTaskCard}>
              <Text style={s.cardHeading}>{isHi ? 'नया प्रशासनिक अनुस्मारक' : 'Create Staff Reminder'}</Text>
              
              <TextInput 
                placeholder={isHi ? 'शीर्षक दर्ज करें...' : 'Task title...'}
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                style={s.inputField}
              />
              <TextInput 
                placeholder={isHi ? 'विवरण दर्ज करें (वैकल्पिक)...' : 'Task description (optional)...'}
                value={newTaskDesc}
                onChangeText={setNewTaskDesc}
                style={[s.inputField, { height: 50, textAlignVertical: 'top' }]}
                multiline
              />
              
              {selectedMemberForTask && (
                <View style={s.assignedTag}>
                  <Text style={s.assignedTagText}>Assigned: {selectedMemberForTask.displayName}</Text>
                  <TouchableOpacity onPress={() => setSelectedMemberForTask(null)}>
                    <Ionicons name="close-circle" size={16} color={colors.maroon} />
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity 
                style={s.addTaskBtn}
                onPress={handleCreateTask}
                disabled={creatingTask}
              >
                {creatingTask ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={s.addTaskBtnText}>{isHi ? 'कार्य जोड़ें' : 'Create Task'}</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Tasks list */}
            <Text style={[s.sectionTitle, { marginTop: 12 }]}>{isHi ? 'कार्यों की सूची' : 'Task Checklist'}</Text>
            {staffTasks.length === 0 ? (
              <Text style={s.emptyText}>{isHi ? 'कोई लंबित कार्य नहीं है।' : 'No reminders set.'}</Text>
            ) : (
              staffTasks.map(t => (
                <View key={t.id} style={s.taskItem}>
                  <TouchableOpacity 
                    style={s.taskCheck} 
                    onPress={() => toggleStaffTask({ variables: { id: t.id } })}
                  >
                    <Ionicons 
                      name={t.completed ? "checkbox" : "square-outline"} 
                      size={20} 
                      color={t.completed ? colors.success : colors.muted} 
                    />
                  </TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.taskTitle, t.completed && s.taskCompleted]}>{t.title}</Text>
                    {t.description && <Text style={s.taskDesc}>{t.description}</Text>}
                    {t.user && (
                      <View style={s.userBadge}>
                        <Text style={s.userBadgeText}>{t.user.displayName}</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => deleteStaffTask({ variables: { id: t.id } })}>
                    <Ionicons name="trash-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* 4. ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <View>
            <TouchableOpacity 
              style={s.pickerButton} 
              onPress={() => setShowClassSelector(true)}
            >
              <Text style={s.pickerButtonText}>
                {selectedClass 
                  ? `${selectedClass.title} (${selectedClass.instructor})` 
                  : (isHi ? "लाइव कक्षा का चयन करें..." : "Select Class Session...")
                }
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.ink} />
            </TouchableOpacity>

            {selectedClass ? (
              <View style={{ marginTop: spacing.md }}>
                <Text style={s.sectionTitle}>{isHi ? 'उपस्थिति सूची' : 'Attendee Roster'}</Text>
                {classBookingsQuery.loading ? (
                  <ActivityIndicator color={colors.maroon} />
                ) : classBookings.length === 0 ? (
                  <Text style={s.emptyText}>{isHi ? 'कोई बुकिंग नहीं मिली।' : 'No members registered for this class.'}</Text>
                ) : (
                  classBookings.map(b => (
                    <View key={b.userId} style={s.attendanceRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={s.userTileName}>{b.user?.displayName || 'Attendee'}</Text>
                        <Text style={s.userTileSub}>{b.user?.emailAddress || ''}</Text>
                      </View>
                      <TouchableOpacity 
                        style={s.checkboxContainer}
                        onPress={() => {
                          recordClassAttendance({
                            variables: {
                              classId: selectedClass.id,
                              userId: b.userId,
                              attended: !b.attended
                            }
                          });
                        }}
                      >
                        <Ionicons 
                          name={b.attended ? "checkbox" : "square-outline"} 
                          size={22} 
                          color={b.attended ? colors.success : colors.muted} 
                        />
                        <Text style={s.checkboxLabel}>{isHi ? 'उपस्थित' : 'Present'}</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            ) : (
              <Text style={s.infoText}>
                {isHi ? "उपस्थिति रिकॉर्ड देखने के लिए कृपया एक कक्षा चुनें।" : "Please select a live class to view and mark attendance."}
              </Text>
            )}

            {/* Simple Modal Selector for Classes */}
            <Modal 
              visible={showClassSelector} 
              transparent 
              animationType="fade"
              onRequestClose={() => setShowClassSelector(false)}
            >
              <View style={s.modalOverlay}>
                <View style={s.modalContent}>
                  <Text style={s.modalTitle}>{isHi ? 'कक्षा चुनें' : 'Select Class'}</Text>
                  <FlatList 
                    data={liveClasses}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={s.classItem}
                        onPress={() => {
                          setSelectedClass(item);
                          setShowClassSelector(false);
                        }}
                      >
                        <Text style={s.classItemTitle}>{item.title}</Text>
                        <Text style={s.classItemSub}>{item.instructor} · {new Date(item.startTime).toLocaleDateString()}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity style={s.closeBtn} onPress={() => setShowClassSelector(false)}>
                    <Text style={s.closeBtnText}>{isHi ? 'बंद करें' : 'Close'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const Divider = () => <View style={s.divider} />;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.lg, paddingBottom: 60, gap: 12 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: spacing.md },
  
  card: { 
    padding: spacing.lg, 
    borderRadius: radius.lg, 
    backgroundColor: colors.paper, 
    borderWidth: 1, 
    borderColor: colors.line, 
    ...shadows.card 
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  backText: { color: colors.maroon, fontSize: 11, fontWeight: 'bold' },
  patientName: { fontSize: 18, fontWeight: '900', color: colors.maroonDark },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: colors.maroonDark, marginBottom: 8 },
  textArea: { 
    height: 70, 
    borderWidth: 1, 
    borderColor: colors.line, 
    borderRadius: 8, 
    padding: 8, 
    fontSize: 11, 
    backgroundColor: colors.canvas, 
    color: colors.ink, 
    textAlignVertical: 'top' 
  },
  saveBtn: { height: 36, borderRadius: 8, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveBtnText: { color: colors.paper, fontSize: 11, fontWeight: 'bold' },
  emptyText: { color: colors.muted, fontSize: 11, fontStyle: 'italic', marginVertical: 10, textAlign: 'center' },
  noteItem: { padding: 10, borderRadius: 8, backgroundColor: '#fdfdfd', borderWidth: 1, borderColor: colors.line, marginBottom: 8 },
  noteMeta: { fontSize: 9, fontWeight: 'bold', color: colors.muted },
  noteText: { fontSize: 11, color: colors.ink, marginTop: 2 },
  input: { height: 40, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 8, fontSize: 11, color: colors.ink, backgroundColor: colors.paper, marginBottom: 16 },
  userTile: { padding: 14, borderRadius: 12, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, ...shadows.card },
  userTileName: { fontSize: 13, fontWeight: 'bold', color: colors.ink },
  userTileSub: { fontSize: 11, color: colors.muted, marginTop: 2 },

  // Tabs
  tabsHeader: { 
    flexDirection: 'row', 
    backgroundColor: colors.paper, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.line,
    paddingVertical: spacing.xs
  },
  tabButton: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: spacing.sm, 
    gap: 4 
  },
  tabButtonActive: { 
    backgroundColor: colors.maroon,
    borderRadius: radius.xs
  },
  tabLabel: { fontSize: 9, color: colors.muted, fontWeight: '600' },
  tabLabelActive: { color: colors.paper, fontWeight: '700' },

  // Followups
  alertBanner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    backgroundColor: '#FFF5F5', 
    borderColor: '#FED7D7', 
    borderWidth: 1, 
    borderRadius: radius.md, 
    padding: spacing.md,
    marginBottom: spacing.md
  },
  alertBannerText: { fontSize: 12, color: colors.maroon, fontWeight: '600' },
  followupTile: { 
    padding: spacing.md, 
    borderRadius: radius.md, 
    backgroundColor: colors.paper, 
    borderWidth: 1, 
    borderColor: colors.line, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: spacing.sm, 
    ...shadows.card 
  },
  alertBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4, alignSelf: 'flex-start' },
  alertBadgeText: { fontSize: 9, color: '#EF4444', fontWeight: '800' },
  miniBtn: { backgroundColor: colors.maroon, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  miniBtnText: { fontSize: 10, color: colors.paper, fontWeight: '700' },

  // Tasks
  createTaskCard: { 
    padding: spacing.md, 
    backgroundColor: colors.paper, 
    borderRadius: radius.md, 
    borderWidth: 1, 
    borderColor: colors.line,
    marginBottom: spacing.lg,
    ...shadows.card
  },
  cardHeading: { fontSize: 14, fontWeight: '900', color: colors.maroonDark, marginBottom: spacing.sm },
  inputField: { borderWidth: 1, borderColor: colors.line, borderRadius: 6, padding: spacing.sm, fontSize: 12, color: colors.ink, marginBottom: 8, backgroundColor: colors.canvas },
  addTaskBtn: { backgroundColor: colors.maroon, borderRadius: 6, paddingVertical: spacing.sm, alignItems: 'center' },
  addTaskBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  assignedTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.softSaffron, padding: 6, borderRadius: 6, marginBottom: 8, alignSelf: 'flex-start' },
  assignedTagText: { fontSize: 10, color: colors.accent, fontWeight: '600' },
  taskItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: spacing.md, 
    backgroundColor: colors.paper, 
    borderRadius: radius.md, 
    borderWidth: 1, 
    borderColor: colors.line, 
    marginBottom: spacing.sm,
    ...shadows.card
  },
  taskCheck: { marginRight: spacing.md },
  taskTitle: { fontSize: 13, fontWeight: '700', color: colors.ink },
  taskCompleted: { textDecorationLine: 'line-through', color: colors.muted },
  taskDesc: { fontSize: 11, color: colors.muted, marginTop: 2 },
  userBadge: { backgroundColor: colors.softMaroon, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4, alignSelf: 'flex-start' },
  userBadgeText: { fontSize: 9, color: colors.maroon, fontWeight: '700' },

  // Attendance
  pickerButton: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: spacing.md, 
    backgroundColor: colors.paper, 
    borderRadius: radius.md, 
    borderWidth: 1, 
    borderColor: colors.line,
    ...shadows.card
  },
  pickerButtonText: { fontSize: 13, color: colors.ink, fontWeight: '600' },
  infoText: { fontSize: 12, color: colors.muted, textAlign: 'center', marginVertical: spacing.xl },
  attendanceRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.paper,
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkboxLabel: { fontSize: 12, color: colors.ink, fontWeight: '600' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: spacing.xl },
  modalContent: { backgroundColor: colors.paper, borderRadius: radius.lg, padding: spacing.lg, maxHeight: '80%' },
  modalTitle: { fontSize: 16, fontWeight: '900', color: colors.maroonDark, marginBottom: spacing.md, textAlign: 'center' },
  classItem: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.line },
  classItemTitle: { fontSize: 13, fontWeight: '700', color: colors.ink },
  classItemSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  closeBtn: { marginTop: spacing.md, backgroundColor: colors.canvas, paddingVertical: spacing.sm, borderRadius: 6, alignItems: 'center' },
  closeBtnText: { fontSize: 12, color: colors.ink, fontWeight: '700' }
});
