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
  Modal,
  Share
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
      titleEn
      titleHi
      instructor
      startTime
      durationMins
      videoCallUrl
      replayUrl
      centerId
      seriesTitle
      batchName
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

const CREATE_LIVE_CLASS_MUTATION = gql`
  mutation CreateLiveClass($titleEn: String!, $titleHi: String!, $instructor: String!, $startTime: String!, $durationMins: Int!, $videoCallUrl: String!, $seriesTitle: String, $batchName: String, $centerId: ID) {
    createLiveClass(titleEn: $titleEn, titleHi: $titleHi, instructor: $instructor, startTime: $startTime, durationMins: $durationMins, videoCallUrl: $videoCallUrl, seriesTitle: $seriesTitle, batchName: $batchName, centerId: $centerId) {
      id
    }
  }
`;

const UPDATE_LIVE_CLASS_MUTATION = gql`
  mutation UpdateLiveClass($id: ID!, $titleEn: String, $titleHi: String, $instructor: String, $startTime: String, $durationMins: Int, $videoCallUrl: String, $seriesTitle: String, $batchName: String, $replayUrl: String) {
    updateLiveClass(id: $id, titleEn: $titleEn, titleHi: $titleHi, instructor: $instructor, startTime: $startTime, durationMins: $durationMins, videoCallUrl: $videoCallUrl, seriesTitle: $seriesTitle, batchName: $batchName, replayUrl: $replayUrl) {
      id
    }
  }
`;

const DELETE_LIVE_CLASS_MUTATION = gql`
  mutation DeleteLiveClass($id: ID!) {
    deleteLiveClass(id: $id)
  }
`;

const SEND_LIVE_CLASS_REMINDER_MUTATION = gql`
  mutation SendLiveClassReminder($classId: ID!) {
    sendLiveClassReminder(classId: $classId)
  }
`;

const MANAGE_CONTENT_QUERY = gql`
  query ManageContent {
    manageContent {
      id
      slug
      contentType
      status
      medicalReviewed
      reviewedBy
      feedback
      translations {
        id
        language
        title
        summary
        body
      }
    }
  }
`;

const APPROVE_MEDICAL_CONTENT_MUTATION = gql`
  mutation ApproveMedicalContent($id: ID!, $feedback: String) {
    approveMedicalContent(id: $id, feedback: $feedback) {
      id
      status
      medicalReviewed
      reviewedBy
      feedback
    }
  }
`;

const FLAG_MEDICAL_CONTENT_MUTATION = gql`
  mutation FlagMedicalContent($id: ID!, $feedback: String) {
    flagMedicalContent(id: $id, feedback: $feedback) {
      id
      status
      medicalReviewed
      reviewedBy
      feedback
    }
  }
`;

const GET_CONTENT_PERFORMANCE_ANALYTICS_QUERY = gql`
  query GetContentPerformanceAnalytics {
    getContentPerformanceAnalytics {
      id
      slug
      contentType
      title
      totalViews
      uniqueViewers
      completionCount
      completionRate
      saveCount
      avgProgress
      dropOffRate
    }
  }
`;

export default function MobileStaffConsole({ user }) {
  const isHi = user?.language === 'hi';
  const [activeTab, setActiveTab] = useState('crm'); // 'crm' | 'followups' | 'tasks' | 'attendance' | 'review'
  
  // Search & Profile states
  const [crmSearch, setCrmSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newNote, setNewNote] = useState('');

  // Task creation states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  // Medical Review states
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
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

  const [createLiveClass, { loading: creatingLiveClass }] = useMutation(CREATE_LIVE_CLASS_MUTATION, {
    onCompleted: () => {
      liveClassesQuery.refetch();
      setIsClassModalOpen(false);
      resetClassForm();
      Alert.alert('Success', isHi ? 'लाइव क्लास जोड़ी गई!' : 'Live class created!');
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [updateLiveClass, { loading: updatingLiveClass }] = useMutation(UPDATE_LIVE_CLASS_MUTATION, {
    onCompleted: () => {
      liveClassesQuery.refetch();
      setIsClassModalOpen(false);
      resetClassForm();
      Alert.alert('Success', isHi ? 'लाइव क्लास अपडेट की गई!' : 'Live class updated!');
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [deleteLiveClass] = useMutation(DELETE_LIVE_CLASS_MUTATION, {
    onCompleted: () => {
      liveClassesQuery.refetch();
      Alert.alert('Success', isHi ? 'लाइव क्लास हटाई गई!' : 'Live class deleted!');
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [sendLiveClassReminder, { loading: sendingReminder }] = useMutation(SEND_LIVE_CLASS_REMINDER_MUTATION, {
    onCompleted: () => {
      Alert.alert('Success', isHi ? 'रिमाइंडर सफलतापूर्वक भेजे गए!' : 'Reminders dispatched!');
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [classTitleEn, setClassTitleEn] = useState('');
  const [classTitleHi, setClassTitleHi] = useState('');
  const [classInstructor, setClassInstructor] = useState('');
  const [classStartTime, setClassStartTime] = useState('');
  const [classDurationMins, setClassDurationMins] = useState('60');
  const [classVideoCallUrl, setClassVideoCallUrl] = useState('');
  const [classReplayUrl, setClassReplayUrl] = useState('');
  const [classSeriesTitle, setClassSeriesTitle] = useState('');
  const [classBatchName, setClassBatchName] = useState('');

  const resetClassForm = () => {
    setEditingClass(null);
    setClassTitleEn('');
    setClassTitleHi('');
    setClassInstructor('');
    setClassStartTime('');
    setClassDurationMins('60');
    setClassVideoCallUrl('');
    setClassReplayUrl('');
    setClassSeriesTitle('');
    setClassBatchName('');
  };

  const handleEditClass = (c) => {
    setEditingClass(c);
    setClassTitleEn(c.titleEn || '');
    setClassTitleHi(c.titleHi || '');
    setClassInstructor(c.instructor || '');
    const date = new Date(c.startTime);
    const tzoffset = date.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
    setClassStartTime(localISOTime);
    setClassDurationMins(String(c.durationMins || 60));
    setClassVideoCallUrl(c.videoCallUrl || '');
    setClassReplayUrl(c.replayUrl || '');
    setClassSeriesTitle(c.seriesTitle || '');
    setClassBatchName(c.batchName || '');
    setIsClassModalOpen(true);
  };

  const manageContentQuery = useQuery(MANAGE_CONTENT_QUERY, { skip: activeTab !== 'review' });
  const performanceQuery = useQuery(GET_CONTENT_PERFORMANCE_ANALYTICS_QUERY, { skip: activeTab !== 'analytics' });
  const [approveContent, { loading: approvingContent }] = useMutation(APPROVE_MEDICAL_CONTENT_MUTATION, {
    onCompleted: () => {
      manageContentQuery.refetch();
      setSelectedReviewItem(null);
      setReviewFeedback('');
      Alert.alert('Success', 'Content approved.');
    },
    onError: (err) => Alert.alert('Error', err.message)
  });
  const [flagContent, { loading: flaggingContent }] = useMutation(FLAG_MEDICAL_CONTENT_MUTATION, {
    onCompleted: () => {
      manageContentQuery.refetch();
      setSelectedReviewItem(null);
      setReviewFeedback('');
      Alert.alert('Success', 'Content flagged/rejected.');
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
          { id: 'attendance', icon: 'calendar', label: isHi ? 'उपस्थिति' : 'Attendance' },
          { id: 'review', icon: 'shield-checkmark', label: isHi ? 'सत्यापन' : 'Medical' },
          { id: 'analytics', icon: 'analytics', label: isHi ? 'विश्लेषण' : 'Analytics' }
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

        {/* 4. ATTENDANCE & SCHEDULING TAB */}
        {activeTab === 'attendance' && (
          <View>
            <TouchableOpacity 
              style={[s.addTaskBtn, { marginBottom: 12, backgroundColor: colors.maroon }]}
              onPress={() => { resetClassForm(); setIsClassModalOpen(true); }}
            >
              <Text style={s.addTaskBtnText}>+ Schedule New Class</Text>
            </TouchableOpacity>

            <Text style={s.sectionTitle}>{isHi ? 'कक्षाएं सूची' : 'Scheduled Classes'}</Text>
            {liveClasses.length === 0 ? (
              <Text style={s.emptyText}>{isHi ? 'कोई निर्धारित कक्षा नहीं है।' : 'No classes scheduled.'}</Text>
            ) : (
              liveClasses.map(c => {
                const title = isHi ? c.titleHi : c.titleEn;
                return (
                  <View key={c.id} style={[s.taskItem, { flexDirection: 'column', alignItems: 'stretch', gap: 6 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 13, color: colors.maroonDark }}>{title}</Text>
                      <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity onPress={() => handleEditClass(c)}>
                          <Ionicons name="create-outline" size={18} color={colors.ink} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                          Alert.alert(
                            'Delete Class',
                            'Are you sure you want to delete this live class session?',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Delete', style: 'destructive', onPress: () => deleteLiveClass({ variables: { id: c.id } }) }
                            ]
                          );
                        }}>
                          <Ionicons name="trash-outline" size={18} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={{ fontSize: 11, color: colors.muted }}>
                      Instructor: {c.instructor} · Starts: {new Date(c.startTime).toLocaleString()}
                    </Text>
                    {c.seriesTitle || c.batchName ? (
                      <View style={{ flexDirection: 'row', gap: 4 }}>
                        {c.seriesTitle && <View style={{ backgroundColor: '#FAF5FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}><Text style={{ color: '#553C9A', fontSize: 8 }}>{c.seriesTitle}</Text></View>}
                        {c.batchName && <View style={{ backgroundColor: '#EBF8FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}><Text style={{ color: '#2B6CB0', fontSize: 8 }}>{c.batchName}</Text></View>}
                      </View>
                    ) : null}

                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                      <TouchableOpacity 
                        style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: colors.softSaffron }}
                        onPress={() => {
                          setSelectedClass(c);
                          classBookingsQuery.refetch();
                        }}
                      >
                        <Text style={{ fontSize: 9, color: colors.accent, fontWeight: '800' }}>
                          {selectedClass?.id === c.id ? 'Viewing Roster' : 'View Roster'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: colors.success }}
                        onPress={() => sendLiveClassReminder({ variables: { classId: c.id } })}
                      >
                        <Text style={{ fontSize: 9, color: colors.paper, fontWeight: '800' }}>Send Reminder</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}

            {/* Attendance Roster view for selected class */}
            {selectedClass && (
              <View style={{ marginTop: spacing.md, padding: 12, borderRadius: 8, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line }}>
                <Text style={s.sectionTitle}>{isHi ? 'उपस्थिति सूची' : 'Attendee Roster'}</Text>
                <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 8 }}>Class: {isHi ? selectedClass.titleHi : selectedClass.titleEn}</Text>
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
            )}

            {/* Add / Edit Class Modal */}
            <Modal
              visible={isClassModalOpen}
              transparent
              animationType="slide"
              onRequestClose={() => { setIsClassModalOpen(false); resetClassForm(); }}
            >
              <View style={s.modalOverlay}>
                <ScrollView contentContainerStyle={[s.modalContent, { padding: 20, width: '90%' }]}>
                  <Text style={s.modalTitle}>{editingClass ? 'Edit Live Class' : 'Schedule Live Class'}</Text>
                  
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Class Title (English) *</Text>
                  <TextInput 
                    style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 8, marginTop: 4, fontSize: 12, color: colors.ink }}
                    value={classTitleEn}
                    onChangeText={setClassTitleEn}
                    placeholder="e.g. Prenatal Yoga"
                  />

                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Class Title (Hindi) *</Text>
                  <TextInput 
                    style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 8, marginTop: 4, fontSize: 12, color: colors.ink }}
                    value={classTitleHi}
                    onChangeText={setClassTitleHi}
                    placeholder="e.g. गर्भावस्था योग"
                  />

                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Instructor *</Text>
                  <TextInput 
                    style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 8, marginTop: 4, fontSize: 12, color: colors.ink }}
                    value={classInstructor}
                    onChangeText={setClassInstructor}
                    placeholder="e.g. Dr. Priya Sharma"
                  />

                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Start Time (YYYY-MM-DDTHH:MM) *</Text>
                  <TextInput 
                    style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 8, marginTop: 4, fontSize: 12, color: colors.ink }}
                    value={classStartTime}
                    onChangeText={setClassStartTime}
                    placeholder="e.g. 2026-07-08T18:00"
                  />

                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Duration (Minutes) *</Text>
                  <TextInput 
                    style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 8, marginTop: 4, fontSize: 12, color: colors.ink }}
                    value={classDurationMins}
                    onChangeText={setClassDurationMins}
                    keyboardType="numeric"
                  />

                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Video Call URL *</Text>
                  <TextInput 
                    style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 8, marginTop: 4, fontSize: 12, color: colors.ink }}
                    value={classVideoCallUrl}
                    onChangeText={setClassVideoCallUrl}
                    placeholder="e.g. https://meet.google.com/abc"
                  />

                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Series Title (Optional)</Text>
                  <TextInput 
                    style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 8, marginTop: 4, fontSize: 12, color: colors.ink }}
                    value={classSeriesTitle}
                    onChangeText={setClassSeriesTitle}
                    placeholder="e.g. Yoga Series"
                  />

                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Batch Segment (Optional)</Text>
                  <TextInput 
                    style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 8, marginTop: 4, fontSize: 12, color: colors.ink }}
                    value={classBatchName}
                    onChangeText={setClassBatchName}
                    placeholder="e.g. Premium Morning"
                  />

                  {editingClass && (
                    <>
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Replay URL (Optional)</Text>
                      <TextInput 
                        style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 8, marginTop: 4, fontSize: 12, color: colors.ink }}
                        value={classReplayUrl}
                        onChangeText={setClassReplayUrl}
                        placeholder="e.g. https://youtube.com/..."
                      />
                    </>
                  )}

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                    <TouchableOpacity 
                      style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: colors.maroon, alignItems: 'center' }}
                      onPress={() => {
                        if (!classTitleEn || !classTitleHi || !classInstructor || !classStartTime || !classVideoCallUrl) {
                          Alert.alert('Required Fields', 'Please fill in all fields.');
                          return;
                        }
                        const vars = {
                          titleEn: classTitleEn,
                          titleHi: classTitleHi,
                          instructor: classInstructor,
                          startTime: new Date(classStartTime).toISOString(),
                          durationMins: parseInt(classDurationMins),
                          videoCallUrl: classVideoCallUrl,
                          seriesTitle: classSeriesTitle || null,
                          batchName: classBatchName || null
                        };
                        if (editingClass) {
                          updateLiveClass({ variables: { id: editingClass.id, ...vars, replayUrl: classReplayUrl || null } });
                        } else {
                          createLiveClass({ variables: vars });
                        }
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={{ flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.line, alignItems: 'center' }}
                      onPress={() => { setIsClassModalOpen(false); resetClassForm(); }}
                    >
                      <Text style={{ color: colors.muted, fontWeight: 'bold', fontSize: 12 }}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </Modal>
          </View>
        )}

        {/* 5. MEDICAL REVIEW TAB */}
        {activeTab === 'review' && (
          <View>
            <Text style={s.sectionTitle}>{isHi ? 'चिकित्सीय सत्यापन कतार' : 'Medical verification queue'}</Text>
            {manageContentQuery.loading ? (
              <ActivityIndicator color={colors.maroon} style={{ marginVertical: 30 }} />
            ) : (manageContentQuery.data?.manageContent || []).length === 0 ? (
              <Text style={s.emptyText}>{isHi ? 'कोई सामग्री नहीं मिली।' : 'No content items found.'}</Text>
            ) : (
              (manageContentQuery.data?.manageContent || []).map(item => {
                const translation = item.translations?.find(t => t.language === 'en') || item.translations?.[0];
                return (
                  <View key={item.id} style={s.attendanceRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.userTileName}>{translation?.title || item.slug}</Text>
                      <Text style={s.userTileSub}>{item.contentType.toUpperCase()} · Status: {item.status.toUpperCase()}</Text>
                    </View>
                    <TouchableOpacity 
                      style={[
                        s.miniBtn, 
                        { backgroundColor: item.status === 'review' ? colors.maroon : colors.muted }
                      ]} 
                      onPress={() => {
                        setSelectedReviewItem(item);
                        setReviewFeedback(item.feedback || '');
                      }}
                    >
                      <Text style={s.miniBtnText}>
                        {item.status === 'review' ? (isHi ? 'सत्यापन करें' : 'Review') : (isHi ? 'विवरण' : 'Inspect')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}

            {/* Clinical Review Modal */}
            <Modal
              visible={!!selectedReviewItem}
              transparent
              animationType="slide"
              onRequestClose={() => setSelectedReviewItem(null)}
            >
              <View style={s.modalOverlay}>
                <View style={s.modalContent}>
                  <ScrollView>
                    <Text style={s.modalTitle}>Clinical & Medical Review</Text>
                    
                    {selectedReviewItem && (
                      <View style={{ gap: 10 }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Resource Key: <Text style={{ fontWeight: 'normal' }}>{selectedReviewItem.slug}</Text></Text>
                        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Type: <Text style={{ fontWeight: 'normal' }}>{selectedReviewItem.contentType.toUpperCase()}</Text></Text>
                        <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Status: <Text style={{ fontWeight: 'normal' }}>{selectedReviewItem.status.toUpperCase()}</Text></Text>
                        
                        <Divider />
                        
                        <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>Translations:</Text>
                        {(selectedReviewItem.translations || []).map(t => (
                          <View key={t.id || t.language} style={{ padding: 8, backgroundColor: colors.canvas, borderRadius: 6, marginBottom: 6 }}>
                            <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.maroon }}>[{t.language.toUpperCase()}] {t.title}</Text>
                            {t.summary && <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>Summary: {t.summary}</Text>}
                            {t.body && <Text style={{ fontSize: 10, color: colors.ink, marginTop: 4 }}>{t.body}</Text>}
                          </View>
                        ))}

                        {selectedReviewItem.reviewedBy && (
                          <Text style={{ fontSize: 10, color: colors.muted }}>Reviewed By: {selectedReviewItem.reviewedBy}</Text>
                        )}

                        {selectedReviewItem.status !== 'review' && selectedReviewItem.feedback ? (
                          <View style={{ padding: 8, backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 6 }}>
                            <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#B45309' }}>Clinical Notes:</Text>
                            <Text style={{ fontSize: 11, fontStyle: 'italic', color: '#78350F' }}>"{selectedReviewItem.feedback}"</Text>
                          </View>
                        ) : null}

                        {selectedReviewItem.status === 'review' ? (
                          <View style={{ gap: 4 }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Enter Verification Notes:</Text>
                            <TextInput
                              style={[s.textArea, { height: 70 }]}
                              placeholder="Clinical assessment safety details, comments..."
                              value={reviewFeedback}
                              onChangeText={setReviewFeedback}
                              multiline
                            />
                          </View>
                        ) : null}

                        <Divider />

                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
                          <TouchableOpacity 
                            style={[s.miniBtn, { backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.line }]} 
                            onPress={() => setSelectedReviewItem(null)}
                          >
                            <Text style={[s.miniBtnText, { color: colors.ink }]}>{isHi ? 'बंद करें' : 'Close'}</Text>
                          </TouchableOpacity>

                          {selectedReviewItem.status === 'review' ? (
                            <>
                              <TouchableOpacity 
                                style={[s.miniBtn, { backgroundColor: colors.error }]} 
                                onPress={() => flagContent({ variables: { id: selectedReviewItem.id, feedback: reviewFeedback } })}
                                disabled={flaggingContent}
                              >
                                <Text style={s.miniBtnText}>{isHi ? 'अस्वीकार करें' : 'Flag / Reject'}</Text>
                              </TouchableOpacity>
                              <TouchableOpacity 
                                style={[s.miniBtn, { backgroundColor: colors.success }]} 
                                onPress={() => approveContent({ variables: { id: selectedReviewItem.id, feedback: reviewFeedback } })}
                                disabled={approvingContent}
                              >
                                <Text style={s.miniBtnText}>{isHi ? 'स्वीकृत करें' : 'Approve'}</Text>
                              </TouchableOpacity>
                            </>
                          ) : null}

                          {selectedReviewItem.status === 'approved' ? (
                            <TouchableOpacity 
                              style={[s.miniBtn, { backgroundColor: colors.error }]} 
                              onPress={() => flagContent({ variables: { id: selectedReviewItem.id, feedback: 'Revoked by clinical user' } })}
                              disabled={flaggingContent}
                            >
                              <Text style={s.miniBtnText}>{isHi ? 'रद्द करें' : 'Revoke Approval'}</Text>
                            </TouchableOpacity>
                          ) : null}
                        </View>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </View>
            </Modal>
          </View>
        )}

        {/* 6. CONTENT ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <View>
            <Text style={s.sectionTitle}>{isHi ? 'सामग्री प्रदर्शन विश्लेषण' : 'Content Performance Analytics'}</Text>
            
            {performanceQuery.loading ? (
              <ActivityIndicator color={colors.maroon} style={{ marginVertical: 30 }} />
            ) : (
              <View style={{ gap: 12 }}>
                {/* Stats Overview */}
                <View style={[s.createTaskCard, { padding: 12, gap: 6 }]}>
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    {isHi ? 'कुल सामग्री मदें:' : 'Total items:'} <Text style={{ fontWeight: 'bold', color: colors.maroon }}>{performanceQuery.data?.getContentPerformanceAnalytics?.length || 0}</Text>
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    {isHi ? 'कुल व्यूज़ संख्या:' : 'Total views:'} <Text style={{ fontWeight: 'bold', color: colors.maroon }}>{(performanceQuery.data?.getContentPerformanceAnalytics || []).reduce((sum, item) => sum + item.totalViews, 0)}</Text>
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted }} numberOfLines={1}>
                    {isHi ? 'शीर्ष प्रदर्शन:' : 'Top performer:'} <Text style={{ fontWeight: 'bold', color: colors.maroon }}>{performanceQuery.data?.getContentPerformanceAnalytics?.[0]?.title || 'None'}</Text>
                  </Text>

                  <TouchableOpacity 
                    style={[s.addTaskBtn, { marginTop: 8, backgroundColor: colors.success }]}
                    onPress={async () => {
                      const reports = performanceQuery.data?.getContentPerformanceAnalytics || [];
                      const headers = "Title,Slug,Content Type,Total Views,Unique Viewers,Completion Rate (%),Saves Count,Avg Progress (%),Drop-off Rate (%)\n";
                      const rows = reports.map(r => `"${r.title.replace(/"/g, '""')}",${r.slug},${r.contentType},${r.totalViews},${r.uniqueViewers},${r.completionRate},${r.saveCount},${r.avgProgress},${r.dropOffRate}`).join("\n");
                      try {
                        await Share.share({
                          message: headers + rows,
                          title: 'Content Performance Report'
                        });
                      } catch (err) {
                        Alert.alert('Error', err.message);
                      }
                    }}
                  >
                    <Text style={s.addTaskBtnText}>{isHi ? 'CSV शेयर करें' : 'Export & Share CSV'}</Text>
                  </TouchableOpacity>
                </View>

                {/* List of reports */}
                {(performanceQuery.data?.getContentPerformanceAnalytics || []).map((item) => (
                  <View key={item.id} style={[s.taskItem, { flexDirection: 'column', alignItems: 'stretch', gap: 6 }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[s.taskTitle, { flex: 1, marginRight: 8 }]} numberOfLines={1}>{item.title}</Text>
                      <View style={[s.alertBadge, { backgroundColor: colors.softSaffron, marginTop: 0 }]}>
                        <Text style={[s.alertBadgeText, { color: colors.accent }]}>{item.contentType.toUpperCase()}</Text>
                      </View>
                    </View>
                    
                    <Text style={{ fontSize: 10, color: colors.muted }}>
                      Slug: {item.slug}
                    </Text>

                    <Divider style={{ marginVertical: 4 }} />

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 11, color: colors.ink }}>Views: <Text style={{ fontWeight: 'bold' }}>{item.totalViews}</Text> ({item.uniqueViewers} users)</Text>
                      <Text style={{ fontSize: 11, color: colors.ink }}>Saves: <Text style={{ fontWeight: 'bold' }}>{item.saveCount}</Text></Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                      <Text style={{ fontSize: 11, color: colors.success }}>Comp: <Text style={{ fontWeight: 'bold' }}>{item.completionRate}%</Text></Text>
                      <Text style={{ fontSize: 11, color: item.dropOffRate > 50 ? colors.error : colors.muted }}>Drop: <Text style={{ fontWeight: 'bold' }}>{item.dropOffRate}%</Text></Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
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
