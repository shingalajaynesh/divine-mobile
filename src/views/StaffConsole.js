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
  Share,
  Switch
} from 'react-native';
import { useQuery, useMutation, gql } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, spacing, radius } from '../theme/theme.js';
import { 
  GET_COUNSELING_LEADS_QUERY, 
  GET_COUNSELING_LEAD_DETAILS_QUERY, 
  GET_COUNSELING_DASHBOARD_STATS_QUERY, 
  CREATE_COUNSELING_LEAD_MUTATION, 
  UPDATE_COUNSELING_LEAD_STATUS_MUTATION, 
  ASSIGN_COUNSELING_LEAD_MUTATION, 
  SCHEDULE_COUNSELING_CALL_MUTATION, 
  LOG_COUNSELING_CALL_OUTCOME_MUTATION, 
  CONVERT_LEAD_TO_MEMBER_MUTATION,
  GET_NOTIFICATION_DELIVERIES_REPORT_QUERY,
  GET_CAMPAIGN_PERFORMANCE_QUERY,
  CREATE_NOTIFICATION_CAMPAIGN_MUTATION,
  TRIGGER_CAMPAIGN_DISPATCHED_MUTATION,
  GET_REMINDER_RULES_QUERY,
  CREATE_REMINDER_RULE_MUTATION,
  UPDATE_REMINDER_RULE_MUTATION,
  DELETE_REMINDER_RULE_MUTATION,
  RUN_REMINDER_RULES_ENGINE_MUTATION,
  GET_SPECIAL_EVENTS_QUERY,
  GET_EVENT_ATTENDEES_QUERY,
  CREATE_SPECIAL_EVENT_MUTATION,
  UPDATE_SPECIAL_EVENT_MUTATION,
  DELETE_SPECIAL_EVENT_MUTATION,
  CHECK_IN_TO_EVENT_MUTATION,
  GET_REFERRALS_REPORT_QUERY,
  CONVERT_REFERRAL_MUTATION,
  GET_TESTIMONIALS_QUERY,
  MODERATE_TESTIMONIAL_MUTATION,
  GET_AMBASSADOR_APPLICATIONS_QUERY,
  MODERATE_AMBASSADOR_APPLICATION_MUTATION,
  CREATE_PRODUCT_MUTATION,
  UPDATE_PRODUCT_MUTATION,
  DELETE_PRODUCT_MUTATION,
  GET_ADMIN_INVOICES_QUERY,
  GET_COUPONS_QUERY,
  GET_PLANS_QUERY,
  CREATE_SUBSCRIPTION_PLAN_MUTATION,
  DELETE_SUBSCRIPTION_PLAN_MUTATION,
  CREATE_COUPON_MUTATION,
  DELETE_COUPON_MUTATION,
  SIMULATE_RENEWALS_MUTATION,
  GET_FINANCIAL_REPORT_QUERY,
  GET_FINANCIAL_TRANSACTIONS_QUERY,
  RECONCILE_TRANSACTION_MUTATION,
  REFUND_TRANSACTION_MUTATION,
  GET_REPORT_TEMPLATES_QUERY,
  GET_REPORT_DATA_QUERY,
  CREATE_REPORT_TEMPLATE_MUTATION,
  DELETE_REPORT_TEMPLATE_MUTATION,
  SHARE_REPORT_TEMPLATE_MUTATION,
  CREATE_REPORT_SCHEDULE_MUTATION,
  DELETE_REPORT_SCHEDULE_MUTATION,
  GET_REPORT_SCHEDULES_QUERY,
  PROCESS_SCHEDULED_REPORTS_MUTATION,
  GET_SYSTEM_SETTINGS_QUERY,
  UPDATE_SYSTEM_SETTING_MUTATION,
  GET_FEATURE_FLAGS_QUERY,
  UPDATE_FEATURE_FLAG_MUTATION,
  GET_LOCALE_STRINGS_QUERY,
  UPSERT_LOCALE_STRING_MUTATION,
  GET_SERVER_DIAGNOSTICS_QUERY,
  GET_SYSTEM_METRICS_HISTORY_QUERY,
  EXPORT_SYSTEM_LOGS_QUERY
} from '../graphql/operations.js';

const GET_ADMIN_PRODUCTS_QUERY = gql`
  query GetAdminProducts($centerId: ID) {
    getProducts(centerId: $centerId) {
      id
      title
      description
      price
      imageUrl
      inventoryCount
      category
      centerId
      center {
        id
        name
      }
    }
  }
`;

const GET_ADMIN_ORDERS_QUERY = gql`
  query GetAdminOrders {
    getAdminOrders {
      id
      totalAmount
      status
      createdAt
      carrier
      trackingNumber
      estimatedDeliveryDate
      shippedAt
      deliveredAt
      user {
        displayName
      }
      address {
        fullName
        addressLine1
        city
        phone
      }
      items {
        id
        quantity
        price
        product {
          title
        }
      }
      returnRequest {
        id
        reason
        status
        adminNotes
      }
    }
  }
`;

const UPDATE_ORDER_TRACKING_MUTATION = gql`
  mutation UpdateOrderTracking($orderId: ID!, $carrier: String!, $trackingNumber: String!, $estimatedDeliveryDate: String) {
    updateOrderTracking(orderId: $orderId, carrier: $carrier, trackingNumber: $trackingNumber, estimatedDeliveryDate: $estimatedDeliveryDate) {
      id
      carrier
      trackingNumber
      estimatedDeliveryDate
    }
  }
`;

const UPDATE_ORDER_STATUS_MUTATION = gql`
  mutation UpdateOrderStatus($orderId: ID!, $status: String!) {
    updateOrderStatus(orderId: $orderId, status: $status) {
      id
      status
    }
  }
`;

const REVIEW_ORDER_RETURN_MUTATION = gql`
  mutation ReviewOrderReturn($orderReturnId: ID!, $status: String!, $adminNotes: String) {
    reviewOrderReturn(orderReturnId: $orderReturnId, status: $status, adminNotes: $adminNotes) {
      id
      status
    }
  }
`;

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
      latestVitals {
        id
        weight
        systolicBp
        diastolicBp
        kickCount
        bloodSugar
        symptoms
        mood
        loggedAt
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
  const crmTabs = ['crm', 'followups', 'tasks'];
  const taskTabs = ['tasks', 'followups'];
  
  // Counseling Pipeline states
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [filterAssignedToMe, setFilterAssignedToMe] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isScheduleCallModalOpen, setIsScheduleCallModalOpen] = useState(false);
  const [isLogCallModalOpen, setIsLogCallModalOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

  // Add lead form fields
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadSource, setLeadSource] = useState('web');

  // Schedule call form fields
  const [callScheduledAt, setCallScheduledAt] = useState('');

  // Log call form fields
  const [activeCallId, setActiveCallId] = useState(null);
  const [callStatus, setCallStatus] = useState('completed');
  const [callDuration, setCallDuration] = useState('15');
  const [callOutcome, setCallOutcome] = useState('interested');
  const [callNotes, setCallNotes] = useState('');

  // Convert lead fields
  const [convertCenterId, setConvertCenterId] = useState('center-100');

  // Counseling hooks
  const leadsQuery = useQuery(GET_COUNSELING_LEADS_QUERY, {
    variables: { 
      status: leadStatusFilter === 'all' ? null : leadStatusFilter, 
      assignedToMe: filterAssignedToMe ? true : null 
    },
    skip: activeTab !== 'leads'
  });

  const leadDetailsQuery = useQuery(GET_COUNSELING_LEAD_DETAILS_QUERY, {
    variables: { id: selectedLeadId },
    skip: !selectedLeadId
  });

  const statsQuery = useQuery(GET_COUNSELING_DASHBOARD_STATS_QUERY, {
    skip: activeTab !== 'leads'
  });

  // Campaign Console states & hooks
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignBody, setCampaignBody] = useState('');
  const [campaignChannels, setCampaignChannels] = useState(['in_app']);
  const [campaignCohortType, setCampaignCohortType] = useState('all');
  const [campaignCenterId, setCampaignCenterId] = useState('center-100');
  const [campaignScheduledAt, setCampaignScheduledAt] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);

  const deliveriesReport = useQuery(GET_NOTIFICATION_DELIVERIES_REPORT_QUERY, {
    variables: { limit: 20 },
    skip: activeTab !== 'campaigns',
    pollInterval: 15000
  });

  const performanceQuery = useQuery(GET_CAMPAIGN_PERFORMANCE_QUERY, {
    variables: { notificationId: selectedCampaignId || '' },
    skip: !selectedCampaignId || activeTab !== 'campaigns'
  });

  const [createCampaign] = useMutation(CREATE_NOTIFICATION_CAMPAIGN_MUTATION, {
    onCompleted: () => {
      Alert.alert(isHi ? 'सफलता' : 'Success', isHi ? 'अभियान सफलतापूर्वक बनाया गया!' : 'Notification campaign scheduled/created successfully!');
      setCampaignTitle('');
      setCampaignBody('');
      deliveriesReport.refetch();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [triggerDispatch] = useMutation(TRIGGER_CAMPAIGN_DISPATCHED_MUTATION, {
    onCompleted: () => {
      Alert.alert(isHi ? 'सफलता' : 'Success', isHi ? 'अभियान डिलीवरी शुरू कर दी गई है!' : 'Campaign delivery dispatch triggered successfully!');
      deliveriesReport.refetch();
      if (selectedCampaignId) performanceQuery.refetch();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  // Reminder Rules states & hooks
  const reminderRulesQuery = useQuery(GET_REMINDER_RULES_QUERY, {
    skip: activeTab !== 'reminderRules'
  });

  const [createReminderRule] = useMutation(CREATE_REMINDER_RULE_MUTATION, {
    onCompleted: () => {
      Alert.alert(isHi ? 'सफलता' : 'Success', isHi ? 'रिमाइंडर नियम सफलतापूर्वक बनाया गया!' : 'Reminder rule created successfully!');
      reminderRulesQuery.refetch();
      setIsRuleModalOpen(false);
      resetRuleForm();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [updateReminderRule] = useMutation(UPDATE_REMINDER_RULE_MUTATION, {
    onCompleted: () => {
      Alert.alert(isHi ? 'सफलता' : 'Success', isHi ? 'रिमाइंडर नियम सफलतापूर्वक अपडेट किया गया!' : 'Reminder rule updated successfully!');
      reminderRulesQuery.refetch();
      setIsRuleModalOpen(false);
      resetRuleForm();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [deleteReminderRule] = useMutation(DELETE_REMINDER_RULE_MUTATION, {
    onCompleted: () => {
      Alert.alert(isHi ? 'सफलता' : 'Success', isHi ? 'रिमाइंडर नियम हटा दिया गया!' : 'Reminder rule deleted successfully!');
      reminderRulesQuery.refetch();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [runReminderRulesEngine, { loading: runningRulesEngine }] = useMutation(RUN_REMINDER_RULES_ENGINE_MUTATION, {
    onCompleted: (res) => {
      const { rulesProcessed, notificationsDispatched } = res.runReminderRulesEngine;
      Alert.alert(
        isHi ? 'इंजन पूरा हुआ' : 'Engine Completed',
        isHi 
          ? `नियम स्कैन किए गए: ${rulesProcessed}, रिमाइंडर भेजे गए: ${notificationsDispatched}!` 
          : `Rules processed: ${rulesProcessed}, notifications dispatched: ${notificationsDispatched}!`
      );
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  // State for Reminder Rule Form
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [ruleName, setRuleName] = useState('');
  const [ruleType, setRuleType] = useState('content');
  const [ruleTriggerCondition, setRuleTriggerCondition] = useState('{"hoursSinceActivity": 12}');
  const [ruleTemplateTitle, setRuleTemplateTitle] = useState('');
  const [ruleTemplateBody, setRuleTemplateBody] = useState('');
  const [ruleChannels, setRuleChannels] = useState(['in_app']);
  const [ruleEnabled, setRuleEnabled] = useState(true);

  const resetRuleForm = () => {
    setEditingRuleId(null);
    setRuleName('');
    setRuleType('content');
    setRuleTriggerCondition('{"hoursSinceActivity": 12}');
    setRuleTemplateTitle('');
    setRuleTemplateBody('');
    setRuleChannels(['in_app']);
    setRuleEnabled(true);
  };

  // Special Events states & hooks
  const specialEventsQuery = useQuery(GET_SPECIAL_EVENTS_QUERY, {
    skip: activeTab !== 'specialEvents'
  });

  const [selectedEventId, setSelectedEventId] = useState(null);

  const eventAttendeesQuery = useQuery(GET_EVENT_ATTENDEES_QUERY, {
    variables: { eventId: selectedEventId },
    skip: !selectedEventId
  });

  const [createSpecialEvent] = useMutation(CREATE_SPECIAL_EVENT_MUTATION, {
    onCompleted: () => {
      Alert.alert(isHi ? 'सफलता' : 'Success', isHi ? 'इवेंट सफलतापूर्वक बनाया गया!' : 'Event created successfully!');
      specialEventsQuery.refetch();
      setIsEventModalOpen(false);
      resetEventForm();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [updateSpecialEvent] = useMutation(UPDATE_SPECIAL_EVENT_MUTATION, {
    onCompleted: () => {
      Alert.alert(isHi ? 'सफलता' : 'Success', isHi ? 'इवेंट सफलतापूर्वक अपडेट किया गया!' : 'Event updated successfully!');
      specialEventsQuery.refetch();
      setIsEventModalOpen(false);
      resetEventForm();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [deleteSpecialEvent] = useMutation(DELETE_SPECIAL_EVENT_MUTATION, {
    onCompleted: () => {
      Alert.alert(isHi ? 'सफलता' : 'Success', isHi ? 'इवेंट हटा दिया गया!' : 'Event deleted successfully!');
      specialEventsQuery.refetch();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [checkInUser] = useMutation(CHECK_IN_TO_EVENT_MUTATION, {
    onCompleted: () => {
      Alert.alert(isHi ? 'सफलता' : 'Success', isHi ? 'उपस्थिति दर्ज की गई!' : 'Attendee checked in successfully!');
      if (selectedEventId) eventAttendeesQuery.refetch();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  // State for Special Event Form
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventTypeField, setEventTypeField] = useState('workshop');
  const [eventDateStr, setEventDateStr] = useState('');
  const [eventDurationMinutes, setEventDurationMinutes] = useState('60');
  const [eventSpeakerName, setEventSpeakerName] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventMaxRegistrations, setEventMaxRegistrations] = useState('50');
  const [eventReplayUrl, setEventReplayUrl] = useState('');

  const resetEventForm = () => {
    setEditingEventId(null);
    setEventTitle('');
    setEventDescription('');
    setEventTypeField('workshop');
    setEventDateStr('');
    setEventDurationMinutes('60');
    setEventSpeakerName('');
    setEventLocation('');
    setEventMaxRegistrations('50');
    setEventReplayUrl('');
  };

  // Referrals & Testimonials states & hooks
  const referralsReportQuery = useQuery(GET_REFERRALS_REPORT_QUERY, {
    skip: activeTab !== 'referrals'
  });

  const testimonialsQuery = useQuery(GET_TESTIMONIALS_QUERY, {
    variables: { statusFilter: null },
    skip: activeTab !== 'referrals'
  });

  const ambassadorAppsQuery = useQuery(GET_AMBASSADOR_APPLICATIONS_QUERY, {
    skip: activeTab !== 'referrals'
  });

  const [convertReferral] = useMutation(CONVERT_REFERRAL_MUTATION, {
    onCompleted: () => {
      Alert.alert('Success', isHi ? 'रेफ़रल सफलतापूर्वक परिवर्तित किया गया!' : 'Referral converted successfully!');
      referralsReportQuery.refetch();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [moderateTestimonial] = useMutation(MODERATE_TESTIMONIAL_MUTATION, {
    onCompleted: () => {
      Alert.alert('Success', isHi ? 'समीक्षा को अपडेट किया गया!' : 'Testimonial updated successfully!');
      testimonialsQuery.refetch();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [moderateAmbassadorApp] = useMutation(MODERATE_AMBASSADOR_APPLICATION_MUTATION, {
    onCompleted: () => {
      Alert.alert('Success', isHi ? 'राजदूत आवेदन अपडेट किया गया!' : 'Ambassador application status updated!');
      ambassadorAppsQuery.refetch();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  // Store & Catalog states & hooks
  const [selectedStoreCenterId, setSelectedStoreCenterId] = useState(null);

  const adminProductsQuery = useQuery(GET_ADMIN_PRODUCTS_QUERY, {
    variables: { centerId: selectedStoreCenterId },
    skip: activeTab !== 'store'
  });

  const adminOrdersQuery = useQuery(GET_ADMIN_ORDERS_QUERY, {
    skip: activeTab !== 'store'
  });

  const [createProduct] = useMutation(CREATE_PRODUCT_MUTATION, {
    onCompleted: () => {
      Alert.alert('Success', isHi ? 'उत्पाद सफलतापूर्वक बनाया गया!' : 'Product created successfully!');
      adminProductsQuery.refetch();
      setIsProductModalOpen(false);
      resetProductForm();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [updateProduct] = useMutation(UPDATE_PRODUCT_MUTATION, {
    onCompleted: () => {
      Alert.alert('Success', isHi ? 'उत्पाद अपडेट किया गया!' : 'Product updated successfully!');
      adminProductsQuery.refetch();
      setIsProductModalOpen(false);
      resetProductForm();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [deleteProduct] = useMutation(DELETE_PRODUCT_MUTATION, {
    onCompleted: () => {
      Alert.alert('Success', isHi ? 'उत्पाद हटा दिया गया!' : 'Product deleted successfully!');
      adminProductsQuery.refetch();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [updateOrderTracking] = useMutation(UPDATE_ORDER_TRACKING_MUTATION, {
    onCompleted: () => {
      Alert.alert('Success', isHi ? 'ट्रैकिंग अपडेट की गई!' : 'Order tracking updated successfully!');
      adminOrdersQuery.refetch();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS_MUTATION, {
    onCompleted: () => {
      Alert.alert('Success', isHi ? 'ऑर्डर की स्थिति अपडेट की गई!' : 'Order status updated successfully!');
      adminOrdersQuery.refetch();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [reviewOrderReturn] = useMutation(REVIEW_ORDER_RETURN_MUTATION, {
    onCompleted: () => {
      Alert.alert('Success', isHi ? 'रिटर्न अनुरोध की समीक्षा पूर्ण!' : 'Order return request reviewed successfully!');
      adminOrdersQuery.refetch();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  // State for Product Form
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productTitle, setProductTitle] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('0.0');
  const [productImageUrl, setProductImageUrl] = useState('');
  const [productInventoryCount, setProductInventoryCount] = useState('10');
  const [productCategory, setProductCategory] = useState('kit');
  const [productCenterId, setProductCenterId] = useState(null);

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductTitle('');
    setProductDescription('');
    setProductPrice('0.0');
    setProductImageUrl('');
    setProductInventoryCount('10');
    setProductCategory('kit');
    setProductCenterId(null);
  };

  // Subscription plans, coupons, invoices & renewals hooks
  const plansQuery = useQuery(GET_PLANS_QUERY, {
    skip: activeTab !== 'billing'
  });

  const couponsQuery = useQuery(GET_COUPONS_QUERY, {
    skip: activeTab !== 'billing'
  });

  const adminInvoicesQuery = useQuery(GET_ADMIN_INVOICES_QUERY, {
    skip: activeTab !== 'billing'
  });

  const [createSubscriptionPlan] = useMutation(CREATE_SUBSCRIPTION_PLAN_MUTATION, {
    onCompleted: () => {
      Alert.alert('Success', isHi ? 'योजना सफलतापूर्वक बनाई गई!' : 'Subscription plan created successfully!');
      plansQuery.refetch();
      setIsPlanModalOpen(false);
      resetPlanForm();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [deleteSubscriptionPlan] = useMutation(DELETE_SUBSCRIPTION_PLAN_MUTATION, {
    onCompleted: () => {
      Alert.alert('Success', isHi ? 'योजना हटा दी गई!' : 'Subscription plan deleted!');
      plansQuery.refetch();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [createCoupon] = useMutation(CREATE_COUPON_MUTATION, {
    onCompleted: () => {
      Alert.alert('Success', isHi ? 'कूपन कोड सफलतापूर्वक बनाया गया!' : 'Promo coupon created successfully!');
      couponsQuery.refetch();
      setIsCouponModalOpen(false);
      resetCouponForm();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [deleteCoupon] = useMutation(DELETE_COUPON_MUTATION, {
    onCompleted: () => {
      Alert.alert('Success', isHi ? 'कूपन कोड हटा दिया गया!' : 'Promo coupon deleted!');
      couponsQuery.refetch();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [simulateRenewals, { loading: isRenewing }] = useMutation(SIMULATE_RENEWALS_MUTATION, {
    onCompleted: (res) => {
      const count = res?.simulateRenewals?.length || 0;
      Alert.alert('Success', isHi ? `${count} सदस्य सदस्यताएँ नवीनीकृत की गईं!` : `Successfully renewed ${count} member subscriptions!`);
      adminInvoicesQuery.refetch();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  // State for Plan Form
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planPrice, setPlanPrice] = useState('0.0');
  const [planBillingPeriod, setPlanBillingPeriod] = useState('monthly');
  const [planTrialDays, setPlanTrialDays] = useState('7');
  const [planFeatures, setPlanFeatures] = useState('');

  const resetPlanForm = () => {
    setPlanName('');
    setPlanDescription('');
    setPlanPrice('0.0');
    setPlanBillingPeriod('monthly');
    setPlanTrialDays('7');
    setPlanFeatures('');
  };

  // State for Coupon Form
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountPercent, setCouponDiscountPercent] = useState('');
  const [couponDiscountAmount, setCouponDiscountAmount] = useState('');
  const [couponValidFrom, setCouponValidFrom] = useState('');
  const [couponValidUntil, setCouponValidUntil] = useState('');
  const [couponMaxRedemptions, setCouponMaxRedemptions] = useState('');

  const resetCouponForm = () => {
    setCouponCode('');
    setCouponDiscountPercent('');
    setCouponDiscountAmount('');
    setCouponValidFrom('');
    setCouponValidUntil('');
    setCouponMaxRedemptions('');
  };

  // Active Billing Inner Sub-Tab state
  const [activeBillingSubTab, setActiveBillingSubTab] = useState('plans'); // 'plans' | 'coupons' | 'invoices'

  // Financial reporting states & hooks
  const [financeCenterId, setFinanceCenterId] = useState(null);

  const financialReportQuery = useQuery(GET_FINANCIAL_REPORT_QUERY, {
    variables: { centerId: financeCenterId },
    skip: activeTab !== 'finance'
  });

  const financialTransactionsQuery = useQuery(GET_FINANCIAL_TRANSACTIONS_QUERY, {
    variables: { centerId: financeCenterId },
    skip: activeTab !== 'finance'
  });

  const [reconcileTransaction] = useMutation(RECONCILE_TRANSACTION_MUTATION, {
    onCompleted: () => {
      Alert.alert('Success', isHi ? 'लेनदेन का मिलान सफल रहा!' : 'Transaction reconciled successfully!');
      financialReportQuery.refetch();
      financialTransactionsQuery.refetch();
      setIsReconcileModalOpen(false);
      setReconciliationNotes('');
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [refundTransaction] = useMutation(REFUND_TRANSACTION_MUTATION, {
    onCompleted: () => {
      Alert.alert('Success', isHi ? 'धनवापसी सफलतापूर्वक दर्ज की गई!' : 'Refund recorded successfully!');
      financialReportQuery.refetch();
      financialTransactionsQuery.refetch();
      setIsRefundModalOpen(false);
      setRefundAmount('');
      setRefundReason('');
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  // Modal forms states for finance
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState(null);
  const [reconciliationNotes, setReconciliationNotes] = useState('');

  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  // Report Builder & Scheduling states & hooks
  const [reportRoleFilter, setReportRoleFilter] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [customReportFilters, setCustomReportFilters] = useState('');

  const reportTemplatesQuery = useQuery(GET_REPORT_TEMPLATES_QUERY, {
    variables: {
      role: reportRoleFilter || null
    },
    skip: activeTab !== 'reports'
  });

  const reportDataQuery = useQuery(GET_REPORT_DATA_QUERY, {
    variables: {
      templateId: selectedTemplateId || '',
      filters: customReportFilters || null
    },
    skip: !selectedTemplateId || activeTab !== 'reports'
  });

  const reportSchedulesQuery = useQuery(GET_REPORT_SCHEDULES_QUERY, {
    skip: activeTab !== 'reports'
  });

  const [createReportTemplate] = useMutation(CREATE_REPORT_TEMPLATE_MUTATION, {
    onCompleted: () => {
      Alert.alert('Success', isHi ? 'रिपोर्ट टेम्प्लेट बनाया गया!' : 'Report template created successfully!');
      reportTemplatesQuery.refetch();
      setIsReportModalOpen(false);
      resetReportForm();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [deleteReportTemplate] = useMutation(DELETE_REPORT_TEMPLATE_MUTATION, {
    onCompleted: () => {
      Alert.alert('Success', isHi ? 'रिपोर्ट टेम्प्लेट हटाया गया!' : 'Report template deleted!');
      reportTemplatesQuery.refetch();
      setSelectedTemplateId(null);
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [createReportSchedule] = useMutation(CREATE_REPORT_SCHEDULE_MUTATION, {
    onCompleted: () => {
      Alert.alert('Success', isHi ? 'रिपोर्ट शेड्यूल बनाया गया!' : 'Report schedule created successfully!');
      reportSchedulesQuery.refetch();
      setIsScheduleModalOpen(false);
      setScheduleFrequency('weekly');
      setScheduleEmails('');
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [deleteReportSchedule] = useMutation(DELETE_REPORT_SCHEDULE_MUTATION, {
    onCompleted: () => {
      Alert.alert('Success', isHi ? 'रिपोर्ट शेड्यूल हटाया गया!' : 'Report schedule deleted!');
      reportSchedulesQuery.refetch();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [shareReportTemplate] = useMutation(SHARE_REPORT_TEMPLATE_MUTATION, {
    onCompleted: () => {
      Alert.alert('Success', isHi ? 'रिपोर्ट एक्सेस साझा किया गया!' : 'Report shared successfully!');
      reportTemplatesQuery.refetch();
      setIsShareModalOpen(false);
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [processScheduledReports] = useMutation(PROCESS_SCHEDULED_REPORTS_MUTATION, {
    onCompleted: (res) => {
      const dispatched = JSON.parse(res.processScheduledReports || '[]');
      Alert.alert('Success', isHi ? `${dispatched.length} शेड्यूल की गई रिपोर्ट भेजी गईं!` : `${dispatched.length} scheduled reports processed!`);
      reportSchedulesQuery.refetch();
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  // Report Modal states
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportRole, setReportRole] = useState('PLATFORM');
  const [reportFiltersText, setReportFiltersText] = useState('{}');
  const [reportWidgetsText, setReportWidgetsText] = useState('[]');

  // Share & Schedule Modal states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareRolesText, setShareRolesText] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState('weekly');
  const [scheduleEmails, setScheduleEmails] = useState('');

  const resetReportForm = () => {
    setReportTitle('');
    setReportDescription('');
    setReportRole('PLATFORM');
    setReportFiltersText('{}');
    setReportWidgetsText('[]');
  };

  // Mobile Platform configuration states & hooks
  const [editingSetting, setEditingSetting] = useState(null);
  const [settingValueInput, setSettingValueInput] = useState('');
  const [editingFlag, setEditingFlag] = useState(null);
  const [flagRulesInput, setFlagRulesInput] = useState('');

  const systemSettingsQuery = useQuery(GET_SYSTEM_SETTINGS_QUERY, {
    skip: activeTab !== 'platform'
  });
  const featureFlagsQuery = useQuery(GET_FEATURE_FLAGS_QUERY, {
    skip: activeTab !== 'platform'
  });

  const [updateSystemSetting] = useMutation(UPDATE_SYSTEM_SETTING_MUTATION, {
    onCompleted: () => {
      Alert.alert('Success', isHi ? 'सिस्टम सेटिंग अपडेट की गई!' : 'System setting updated successfully!');
      systemSettingsQuery.refetch();
      setEditingSetting(null);
      setSettingValueInput('');
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [updateFeatureFlag] = useMutation(UPDATE_FEATURE_FLAG_MUTATION, {
    onCompleted: () => {
      Alert.alert('Success', isHi ? 'फीचर फ़्लैग अपडेट किया गया!' : 'Feature flag updated successfully!');
      featureFlagsQuery.refetch();
      setEditingFlag(null);
      setFlagRulesInput('');
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  // Mobile System Health states & hooks
  const [selectedMetricType, setSelectedMetricType] = useState('cpu');

  const serverDiagnosticsQuery = useQuery(GET_SERVER_DIAGNOSTICS_QUERY, {
    pollInterval: 5000,
    skip: activeTab !== 'health'
  });

  const systemMetricsHistoryQuery = useQuery(GET_SYSTEM_METRICS_HISTORY_QUERY, {
    variables: { metricType: selectedMetricType },
    skip: activeTab !== 'health'
  });

  const exportSystemLogsQuery = useQuery(EXPORT_SYSTEM_LOGS_QUERY, {
    variables: { limit: 150 },
    skip: true
  });

  const [createLead] = useMutation(CREATE_COUNSELING_LEAD_MUTATION, {
    onCompleted: () => {
      leadsQuery.refetch();
      statsQuery.refetch();
      setIsAddLeadModalOpen(false);
      setLeadName('');
      setLeadPhone('');
      setLeadEmail('');
      setLeadSource('web');
      Alert.alert('Success', "Lead created successfully!");
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [updateLeadStatus] = useMutation(UPDATE_COUNSELING_LEAD_STATUS_MUTATION, {
    onCompleted: () => {
      leadsQuery.refetch();
      statsQuery.refetch();
      if (selectedLeadId) leadDetailsQuery.refetch();
      Alert.alert('Success', "Lead status updated.");
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [assignLead] = useMutation(ASSIGN_COUNSELING_LEAD_MUTATION, {
    onCompleted: () => {
      leadsQuery.refetch();
      if (selectedLeadId) leadDetailsQuery.refetch();
      Alert.alert('Success', "Lead assigned.");
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [scheduleCall] = useMutation(SCHEDULE_COUNSELING_CALL_MUTATION, {
    onCompleted: () => {
      leadsQuery.refetch();
      statsQuery.refetch();
      if (selectedLeadId) leadDetailsQuery.refetch();
      setIsScheduleCallModalOpen(false);
      setCallScheduledAt('');
      Alert.alert('Success', "Call scheduled successfully!");
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [logCallOutcome] = useMutation(LOG_COUNSELING_CALL_OUTCOME_MUTATION, {
    onCompleted: () => {
      leadsQuery.refetch();
      statsQuery.refetch();
      if (selectedLeadId) leadDetailsQuery.refetch();
      setIsLogCallModalOpen(false);
      setCallNotes('');
      Alert.alert('Success', "Call outcome logged successfully!");
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

  const [convertLeadToMember, { loading: convertingLead }] = useMutation(CONVERT_LEAD_TO_MEMBER_MUTATION, {
    onCompleted: (res) => {
      leadsQuery.refetch();
      statsQuery.refetch();
      if (selectedLeadId) leadDetailsQuery.refetch();
      setIsConvertModalOpen(false);
      Alert.alert('Success', `Successfully converted: ${res.convertLeadToMember?.displayName}!`);
    },
    onError: (err) => Alert.alert('Error', err.message)
  });

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
  const crmUsersQuery = useQuery(GET_CRM_USERS_QUERY, {
    skip: !crmTabs.includes(activeTab),
    fetchPolicy: 'cache-and-network'
  });
  const notesQuery = useQuery(GET_CRM_NOTES_QUERY, {
    variables: { userId: selectedUser?.id },
    skip: !selectedUser
  });
  const staffTasksQuery = useQuery(GET_STAFF_TASKS_QUERY, {
    skip: !taskTabs.includes(activeTab),
    fetchPolicy: 'cache-and-network'
  });
  const liveClassesQuery = useQuery(GET_LIVE_CLASSES_QUERY, {
    skip: activeTab !== 'attendance',
    fetchPolicy: 'cache-first'
  });
  const classBookingsQuery = useQuery(GET_CLASS_BOOKINGS_QUERY, {
    variables: { classId: selectedClass?.id },
    skip: !selectedClass || activeTab !== 'attendance'
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
  const contentPerformanceQuery = useQuery(GET_CONTENT_PERFORMANCE_ANALYTICS_QUERY, { skip: activeTab !== 'analytics' });
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

  // Follow-up Queue algorithm: Highlight mothers near third trimester or with pending followups or vital alerts
  const mothersQueue = mothersOnly.map(m => {
    const pendingTasksCount = staffTasks.filter(t => t.user?.id === m.id && !t.completed).length;
    
    // Check for abnormal vitals alerts
    const vitals = m.latestVitals;
    let vitalsAlert = null;
    if (vitals) {
      if (vitals.systolicBp >= 140 || vitals.diastolicBp >= 90) {
        vitalsAlert = `High BP Alert: ${vitals.systolicBp}/${vitals.diastolicBp} mmHg`;
      } else if (vitals.kickCount !== null && vitals.kickCount < 10) {
        vitalsAlert = `Low Kicks Alert: ${vitals.kickCount} counts in 2h`;
      } else if (vitals.bloodSugar >= 140) {
        vitalsAlert = `High Blood Sugar: ${vitals.bloodSugar} mg/dL`;
      } else {
        try {
          const symptomsList = JSON.parse(vitals.symptoms || '[]');
          const severe = symptomsList.filter(s => ['Bleeding', 'Swelling', 'Severe Headache', 'Blurred Vision', 'Severe Abdominal Pain'].includes(s));
          if (severe.length > 0) {
            vitalsAlert = `Severe Symptoms: ${severe.join(', ')}`;
          }
        } catch {}
      }
    }

    const isHighPriority = pendingTasksCount > 0 || m.pregnancyDay > 220 || !!vitalsAlert;
    return { ...m, pendingTasksCount, vitalsAlert, isHighPriority };
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
          { id: 'leads', icon: 'funnel', label: isHi ? 'लीड्स' : 'Leads' },
          { id: 'followups', icon: 'warning', label: isHi ? 'अनुवर्ती' : 'Followups' },
          { id: 'campaigns', icon: 'megaphone', label: isHi ? 'अभियान' : 'Campaigns' },
          { id: 'reminderRules', icon: 'settings', label: isHi ? 'नियम' : 'Rules' },
          { id: 'specialEvents', icon: 'ticket', label: isHi ? 'इवेंट' : 'Events' },
          { id: 'referrals', icon: 'gift', label: isHi ? 'रेफ़रल' : 'Referrals' },
          { id: 'store', icon: 'cart', label: isHi ? 'दुकान' : 'Store' },
          { id: 'billing', icon: 'card', label: isHi ? 'बिलिंग' : 'Billing' },
          { id: 'finance', icon: 'cash', label: isHi ? 'वित्तीय' : 'Finance' },
          { id: 'tasks', icon: 'checkbox', label: isHi ? 'कार्य' : 'Tasks' },
          { id: 'attendance', icon: 'calendar', label: isHi ? 'उपस्थिति' : 'Attendance' },
          { id: 'review', icon: 'shield-checkmark', label: isHi ? 'सत्यापन' : 'Medical' },
          { id: 'reports', icon: 'analytics', label: isHi ? 'रिपोर्ट्स' : 'Reports' },
          { id: 'platform', icon: 'options', label: isHi ? 'सेटअप' : 'Settings' },
          { id: 'health', icon: 'pulse', label: isHi ? 'स्वास्थ्य' : 'Diagnostics' }
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

        {/* 1.5 COUNSELING PIPELINE TAB */}
        {activeTab === 'leads' && (
          <View style={{ gap: 16 }}>
            {/* Stats Row */}
            {statsQuery.data?.getCounselingDashboardStats && (
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                <View style={[s.card, { flex: 1, minWidth: 100, padding: 12 }]}>
                  <Text style={{ fontSize: 9, color: colors.muted }}>Total Leads</Text>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.maroon }}>
                    {statsQuery.data.getCounselingDashboardStats.totalLeadsCount}
                  </Text>
                </View>
                <View style={[s.card, { flex: 1, minWidth: 100, padding: 12 }]}>
                  <Text style={{ fontSize: 9, color: colors.muted }}>Converted</Text>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#16a34a' }}>
                    {statsQuery.data.getCounselingDashboardStats.convertedLeadsCount}
                  </Text>
                </View>
                <View style={[s.card, { flex: 1, minWidth: 100, padding: 12 }]}>
                  <Text style={{ fontSize: 9, color: colors.muted }}>Rate</Text>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.maroon }}>
                    {statsQuery.data.getCounselingDashboardStats.conversionRate.toFixed(0)}%
                  </Text>
                </View>
              </View>
            )}

            {/* Actions Bar */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <TouchableOpacity 
                style={[s.miniBtn, { backgroundColor: colors.maroon, height: 36, paddingHorizontal: 12 }]}
                onPress={() => setIsAddLeadModalOpen(true)}
              >
                <Text style={{ color: colors.paper, fontSize: 11, fontWeight: 'bold' }}>+ Add Lead</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[s.chip, filterAssignedToMe && s.chipActive]} 
                onPress={() => setFilterAssignedToMe(!filterAssignedToMe)}
              >
                <Text style={[s.chipText, filterAssignedToMe && s.chipTextActive]}>Assigned to me</Text>
              </TouchableOpacity>
            </View>

            {/* Stage filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {[['all', 'All'], ['new', 'New'], ['contacted', 'Contacted'], ['scheduled', 'Scheduled'], ['converted', 'Converted']].map(([code, label]) => (
                <TouchableOpacity 
                  key={code} 
                  style={[s.chip, leadStatusFilter === code && s.chipActive]} 
                  onPress={() => setLeadStatusFilter(code)}
                >
                  <Text style={[s.chipText, leadStatusFilter === code && s.chipTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Leads List */}
            {leadsQuery.loading ? (
              <ActivityIndicator color={colors.maroon} />
            ) : leadsQuery.data?.getCounselingLeads?.length === 0 ? (
              <Text style={s.emptyText}>No leads found in this stage.</Text>
            ) : (
              leadsQuery.data.getCounselingLeads.map(lead => (
                <TouchableOpacity key={lead.id} style={s.userTile} onPress={() => setSelectedLeadId(lead.id)}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.userTileName}>{lead.name}</Text>
                    <Text style={s.userTileSub}>{lead.phone} · Source: {lead.source}</Text>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                      <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: lead.status === 'converted' ? '#DCFCE7' : '#FEF3C7' }}>
                        <Text style={{ fontSize: 8, color: lead.status === 'converted' ? '#15803D' : '#D97706', fontWeight: 'bold' }}>
                          {lead.status.toUpperCase()}
                        </Text>
                      </View>
                      {lead.counselor && (
                        <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: '#E0F2FE' }}>
                          <Text style={{ fontSize: 8, color: '#0369A1', fontWeight: 'bold' }}>{lead.counselor.displayName}</Text>
                        </View>
                      )}
                    </View>
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
                  <View style={{ flex: 1 }}>
                    <Text style={s.userTileName}>{m.displayName}</Text>
                    <Text style={s.userTileSub}>Pregnancy Day: {m.pregnancyDay || 'Not set'}</Text>
                    {m.vitalsAlert && (
                      <Text style={{ fontSize: 10, color: colors.error, fontWeight: 'bold', marginTop: 4 }}>
                        🚨 {m.vitalsAlert}
                      </Text>
                    )}
                    {m.isHighPriority && !m.vitalsAlert && (
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

        {/* 3.5 CAMPAIGNS TAB */}
        {activeTab === 'campaigns' && (
          <View style={{ gap: spacing.md }}>
            <View style={s.alertBanner}>
              <Ionicons name="megaphone-outline" size={20} color={colors.maroon} />
              <View style={{ flex: 1 }}>
                <Text style={s.alertBannerText}>
                  {isHi ? 'अभियान और प्रसारण केंद्र' : 'Campaigns & Announcements'}
                </Text>
                <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                  {isHi ? 'सभी माताओं को इन-ऐप, पुश या व्हाट्सएप संदेश भेजें' : 'Broadcast to all mothers or center cohorts.'}
                </Text>
              </View>
            </View>

            {/* Campaign Form Card */}
            <View style={s.createTaskCard}>
              <Text style={s.cardHeading}>{isHi ? 'नया अभियान लॉन्च करें' : 'Launch New Campaign'}</Text>
              
              <TextInput
                style={s.inputField}
                placeholder={isHi ? 'अभियान शीर्षक...' : 'Campaign Title...'}
                value={campaignTitle}
                onChangeText={setCampaignTitle}
              />
              
              <TextInput
                style={[s.inputField, { height: 60, textAlignVertical: 'top' }]}
                placeholder={isHi ? 'संदेश का विवरण...' : 'Message Body...'}
                value={campaignBody}
                onChangeText={setCampaignBody}
                multiline
              />

              <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.maroonDark, marginVertical: 4 }}>
                {isHi ? 'चैनल चुनें:' : 'Channels:'}
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {['in_app', 'push', 'email', 'whatsapp'].map(ch => {
                  const isSel = campaignChannels.includes(ch);
                  return (
                    <TouchableOpacity 
                      key={ch} 
                      style={[s.chip, isSel && s.chipActive]} 
                      onPress={() => {
                        if (isSel) {
                          setCampaignChannels(campaignChannels.filter(c => c !== ch));
                        } else {
                          setCampaignChannels([...campaignChannels, ch]);
                        }
                      }}
                    >
                      <Text style={[s.chipText, isSel && s.chipTextActive]}>{ch.toUpperCase()}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.maroonDark, marginVertical: 4 }}>
                {isHi ? 'लक्ष्य समूह:' : 'Target Cohort:'}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                {[
                  { id: 'all', label: isHi ? 'सभी माताएं' : 'All Mothers' },
                  { id: 'center', label: isHi ? 'सेंटर' : 'Center' }
                ].map(coh => (
                  <TouchableOpacity 
                    key={coh.id} 
                    style={[s.chip, campaignCohortType === coh.id && s.chipActive]}
                    onPress={() => setCampaignCohortType(coh.id)}
                  >
                    <Text style={[s.chipText, campaignCohortType === coh.id && s.chipTextActive]}>{coh.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {campaignCohortType === 'center' && (
                <TextInput
                  style={s.inputField}
                  placeholder="e.g. center-100"
                  value={campaignCenterId}
                  onChangeText={setCampaignCenterId}
                />
              )}

              <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.maroonDark, marginVertical: 4 }}>
                {isHi ? 'शेड्यूल समय (वैकल्पिक):' : 'Schedule Delivery (Optional):'}
              </Text>
              <TextInput
                style={s.inputField}
                placeholder="YYYY-MM-DD HH:mm"
                value={campaignScheduledAt}
                onChangeText={setCampaignScheduledAt}
              />

              <TouchableOpacity 
                style={[s.addTaskBtn, { backgroundColor: '#be123c', marginTop: 8 }]}
                onPress={() => {
                  createCampaign({
                    variables: {
                      title: campaignTitle,
                      body: campaignBody,
                      channels: campaignChannels,
                      centerId: campaignCohortType === 'center' ? campaignCenterId : null,
                      scheduledAt: campaignScheduledAt || null,
                      targetUserIds: null
                    }
                  });
                }}
              >
                <Text style={s.addTaskBtnText}>{isHi ? '🚀 अभियान शुरू करें' : '🚀 Launch Campaign'}</Text>
              </TouchableOpacity>
            </View>

            {/* Deliveries List */}
            <Text style={s.sectionTitle}>{isHi ? 'सक्रिय वितरण लॉग' : 'Active Delivery Log'}</Text>
            {deliveriesReport.loading ? (
              <ActivityIndicator color={colors.maroon} />
            ) : (deliveriesReport.data?.getNotificationDeliveriesReport || []).length === 0 ? (
              <Text style={s.emptyText}>{isHi ? 'कोई अभियान वितरण लॉग नहीं।' : 'No delivery logs found.'}</Text>
            ) : (
              (deliveriesReport.data?.getNotificationDeliveriesReport || []).map(item => (
                <View key={item.id} style={[s.followupTile, { flexDirection: 'column', alignItems: 'stretch', gap: 6 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 13, color: colors.ink }}>{item.notification?.title}</Text>
                    <View style={{ backgroundColor: colors.softMaroon, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                      <Text style={{ fontSize: 8, color: colors.maroon, fontWeight: 'bold' }}>{item.channel.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 11, color: colors.muted }}>{item.notification?.body}</Text>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <Text style={{ fontSize: 10, color: colors.muted }}>
                      Status: <Text style={{ fontWeight: 'bold', color: item.status === 'delivered' ? '#16a34a' : '#d97706' }}>{item.status.toUpperCase()}</Text>
                    </Text>
                    
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {item.status === 'queued' && (
                        <TouchableOpacity 
                          style={[s.miniBtn, { backgroundColor: colors.success }]}
                          onPress={() => triggerDispatch({ variables: { notificationId: item.notificationId } })}
                        >
                          <Text style={s.miniBtnText}>{isHi ? 'भेजें' : 'Dispatch'}</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity 
                        style={[s.miniBtn, { backgroundColor: colors.muted }]}
                        onPress={() => {
                          setSelectedCampaignId(item.notificationId);
                        }}
                      >
                        <Text style={s.miniBtnText}>Stats</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}

            {/* Campaign Performance Modal */}
            {selectedCampaignId && performanceQuery.data?.getCampaignPerformance && (
              <Modal
                visible={!!selectedCampaignId}
                transparent
                animationType="slide"
                onRequestClose={() => setSelectedCampaignId(null)}
              >
                <View style={s.modalOverlay}>
                  <View style={[s.modalContent, { maxHeight: '85%' }]}>
                    <Text style={s.modalTitle}>📊 Campaign Analytics</Text>
                    
                    <View style={{ gap: 8, paddingVertical: 10 }}>
                      <Text style={{ fontSize: 12, color: colors.ink }}>Total Targeted: <Text style={{ fontWeight: 'bold' }}>{performanceQuery.data.getCampaignPerformance.totalTargeted}</Text></Text>
                      <Text style={{ fontSize: 12, color: '#16a34a' }}>Delivered Count: <Text style={{ fontWeight: 'bold' }}>{performanceQuery.data.getCampaignPerformance.deliveredCount}</Text></Text>
                      <Text style={{ fontSize: 12, color: '#d97706' }}>Pending Queue: <Text style={{ fontWeight: 'bold' }}>{performanceQuery.data.getCampaignPerformance.pendingCount}</Text></Text>
                      <Text style={{ fontSize: 12, color: '#dc2626' }}>Failed: <Text style={{ fontWeight: 'bold' }}>{performanceQuery.data.getCampaignPerformance.failedCount}</Text></Text>
                    </View>

                    <Divider />
                    
                    <Text style={[s.sectionTitle, { fontSize: 12 }]}>Breakdown by Channel:</Text>
                    {performanceQuery.data.getCampaignPerformance.channelBreakdown.map(ch => (
                      <View key={ch.channel} style={{ marginVertical: 6 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                          <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink }}>{ch.channel.toUpperCase()}</Text>
                          <Text style={{ fontSize: 10, color: colors.muted }}>{ch.delivered} / {ch.sent} delivered</Text>
                        </View>
                        <View style={{ height: 6, backgroundColor: colors.line, borderRadius: 3, overflow: 'hidden' }}>
                          <View style={{ height: '100%', backgroundColor: '#16a34a', width: `${ch.sent > 0 ? (ch.delivered / ch.sent) * 100 : 0}%` }} />
                        </View>
                      </View>
                    ))}

                    <TouchableOpacity 
                      style={[s.saveBtn, { marginTop: 16, backgroundColor: colors.maroon }]} 
                      onPress={() => setSelectedCampaignId(null)}
                    >
                      <Text style={s.saveBtnText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}
          </View>
        )}

        {/* 3.6 REMINDER RULES TAB */}
        {activeTab === 'reminderRules' && (
          <View style={{ gap: spacing.md }}>
            <View style={s.alertBanner}>
              <Ionicons name="settings-outline" size={20} color={colors.maroon} />
              <View style={{ flex: 1 }}>
                <Text style={s.alertBannerText}>
                  {isHi ? 'रिमाइंडर नियम इंजन' : 'Reminder Rules Engine'}
                </Text>
                <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                  {isHi ? 'सामग्री, कक्षाओं और कल्याण के लिए स्वचालित नियम प्रबंधित करें' : 'Manage automated alert triggers.'}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity 
                style={[s.addTaskBtn, { flex: 1, backgroundColor: colors.maroon }]}
                onPress={() => { resetRuleForm(); setIsRuleModalOpen(true); }}
              >
                <Text style={s.addTaskBtnText}>+ Add Custom Rule</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[s.addTaskBtn, { flex: 1, backgroundColor: '#be123c' }]}
                onPress={() => runReminderRulesEngine()}
                disabled={runningRulesEngine}
              >
                <Text style={s.addTaskBtnText}>⚙️ {isHi ? 'इंजन चलाएं' : 'Run Rules'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.sectionTitle}>{isHi ? 'सक्रिय नियमों की सूची' : 'Reminder Rules Catalog'}</Text>
            {reminderRulesQuery.loading ? (
              <ActivityIndicator color={colors.maroon} />
            ) : (reminderRulesQuery.data?.getReminderRules || []).length === 0 ? (
              <Text style={s.emptyText}>{isHi ? 'कोई नियम नहीं मिला।' : 'No reminder rules found.'}</Text>
            ) : (
              (reminderRulesQuery.data?.getReminderRules || []).map(item => (
                <View key={item.id} style={[s.followupTile, { flexDirection: 'column', alignItems: 'stretch', gap: 6 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 13, color: colors.ink }}>{item.name}</Text>
                    <View style={{ backgroundColor: item.enabled ? '#DEF7EC' : '#F3F4F6', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                      <Text style={{ fontSize: 8, color: item.enabled ? '#03543F' : '#374151', fontWeight: 'bold' }}>
                        {item.enabled ? 'ACTIVE' : 'DISABLED'}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ fontSize: 11, color: colors.muted }}>Type: {item.ruleType.toUpperCase()}</Text>
                  <Text style={{ fontSize: 11, color: colors.muted }}>Cond: <Text style={{ fontStyle: 'italic' }}>{item.triggerCondition}</Text></Text>
                  <Text style={{ fontSize: 11, color: colors.ink, fontWeight: 'bold' }}>Template: "{item.templateTitle}"</Text>

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, alignSelf: 'flex-end' }}>
                    <TouchableOpacity 
                      style={[s.miniBtn, { backgroundColor: colors.muted }]}
                      onPress={() => {
                        setEditingRuleId(item.id);
                        setRuleName(item.name);
                        setRuleType(item.ruleType);
                        setRuleTriggerCondition(item.triggerCondition);
                        setRuleTemplateTitle(item.templateTitle);
                        setRuleTemplateBody(item.templateBody);
                        setRuleChannels(item.channels);
                        setRuleEnabled(item.enabled);
                        setIsRuleModalOpen(true);
                      }}
                    >
                      <Text style={s.miniBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[s.miniBtn, { backgroundColor: colors.error }]}
                      onPress={() => {
                        Alert.alert(
                          'Delete Rule',
                          'Are you sure you want to delete this rule?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => deleteReminderRule({ variables: { id: item.id } }) }
                          ]
                        );
                      }}
                    >
                      <Text style={s.miniBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            {/* Create/Edit Rule Modal */}
            <Modal
              visible={isRuleModalOpen}
              transparent
              animationType="slide"
              onRequestClose={() => setIsRuleModalOpen(false)}
            >
              <View style={s.modalOverlay}>
                <ScrollView contentContainerStyle={[s.modalContent, { padding: 20, width: '90%' }]}>
                  <Text style={s.modalTitle}>{editingRuleId ? 'Edit Reminder Rule' : 'Create Reminder Rule'}</Text>
                  
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Rule Title / Name *</Text>
                  <TextInput 
                    style={s.modalInput} 
                    value={ruleName} 
                    onChangeText={setRuleName} 
                    placeholder="e.g. Inactivity Alert" 
                  />

                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Rule Type *</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 6 }}>
                    {['content', 'classes', 'wellness', 'plans', 'reactivation'].map(t => (
                      <TouchableOpacity 
                        key={t}
                        style={[s.chip, ruleType === t && s.chipActive]}
                        onPress={() => setRuleType(t)}
                      >
                        <Text style={[s.chipText, ruleType === t && s.chipTextActive]}>{t.toUpperCase()}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Trigger Condition JSON *</Text>
                  <TextInput 
                    style={s.modalInput} 
                    value={ruleTriggerCondition} 
                    onChangeText={setRuleTriggerCondition} 
                    placeholder='e.g. {"hoursSinceActivity": 12}' 
                  />

                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Template Title *</Text>
                  <TextInput 
                    style={s.modalInput} 
                    value={ruleTemplateTitle} 
                    onChangeText={setRuleTemplateTitle} 
                    placeholder="Title" 
                  />

                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Template Body *</Text>
                  <TextInput 
                    style={[s.modalInput, { height: 50, textAlignVertical: 'top' }]} 
                    value={ruleTemplateBody} 
                    onChangeText={setRuleTemplateBody} 
                    placeholder="Body text" 
                    multiline
                  />

                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Channels *</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 6 }}>
                    {['in_app', 'push', 'email', 'whatsapp'].map(ch => {
                      const isSel = ruleChannels.includes(ch);
                      return (
                        <TouchableOpacity 
                          key={ch}
                          style={[s.chip, isSel && s.chipActive]}
                          onPress={() => {
                            if (isSel) {
                              setRuleChannels(ruleChannels.filter(c => c !== ch));
                            } else {
                              setRuleChannels([...ruleChannels, ch]);
                            }
                          }}
                        >
                          <Text style={[s.chipText, isSel && s.chipTextActive]}>{ch.toUpperCase()}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <TouchableOpacity 
                    style={[s.chip, ruleEnabled && s.chipActive, { marginTop: 10, alignSelf: 'flex-start' }]}
                    onPress={() => setRuleEnabled(!ruleEnabled)}
                  >
                    <Text style={[s.chipText, ruleEnabled && s.chipTextActive]}>
                      {ruleEnabled ? 'ENABLED & ACTIVE' : 'DISABLED'}
                    </Text>
                  </TouchableOpacity>

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                    <TouchableOpacity 
                      style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: colors.maroon, alignItems: 'center' }}
                      onPress={() => {
                        const vars = {
                          name: ruleName,
                          ruleType,
                          triggerConditionJson: ruleTriggerCondition,
                          templateTitle: ruleTemplateTitle,
                          templateBody: ruleTemplateBody,
                          channels: ruleChannels,
                          enabled: ruleEnabled
                        };
                        if (editingRuleId) {
                          updateReminderRule({ variables: { id: editingRuleId, ...vars } });
                        } else {
                          createReminderRule({ variables: vars });
                        }
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={{ flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.line, alignItems: 'center' }}
                      onPress={() => setIsRuleModalOpen(false)}
                    >
                      <Text style={{ color: colors.muted, fontWeight: 'bold', fontSize: 12 }}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </Modal>
          </View>
        )}

        {/* 3.7 SPECIAL EVENTS TAB */}
        {activeTab === 'specialEvents' && (
          <View style={{ gap: spacing.md }}>
            <View style={s.alertBanner}>
              <Ionicons name="ticket-outline" size={20} color={colors.maroon} />
              <View style={{ flex: 1 }}>
                <Text style={s.alertBannerText}>
                  {isHi ? 'कार्यशाला एवं संगोष्ठी प्रबंधक' : 'Workshops & Seminars'}
                </Text>
                <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                  {isHi ? 'विशेष कार्यक्रम, कार्यशालाएं और उपस्थिति सूची प्रबंधित करें' : 'Schedule events and verify guest check-ins.'}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[s.addTaskBtn, { backgroundColor: colors.maroon }]}
              onPress={() => { resetEventForm(); setIsEventModalOpen(true); }}
            >
              <Text style={s.addTaskBtnText}>+ Schedule Special Event</Text>
            </TouchableOpacity>

            {selectedEventId ? (
              <View style={s.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={s.sectionTitle}>{isHi ? 'पंजीकृत अतिथि' : 'Guest Attendees'}</Text>
                  <TouchableOpacity onPress={() => setSelectedEventId(null)}>
                    <Text style={{ fontSize: 12, color: colors.maroon, fontWeight: 'bold' }}>Close</Text>
                  </TouchableOpacity>
                </View>

                {eventAttendeesQuery.loading ? (
                  <ActivityIndicator color={colors.maroon} />
                ) : (eventAttendeesQuery.data?.getEventAttendees || []).length === 0 ? (
                  <Text style={s.emptyText}>{isHi ? 'कोई अतिथि पंजीकृत नहीं।' : 'No registered guests found.'}</Text>
                ) : (
                  (eventAttendeesQuery.data?.getEventAttendees || []).map(att => (
                    <View key={att.id} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 12, color: colors.ink }}>{att.user?.displayName}</Text>
                        <Text style={{ fontSize: 10, color: colors.muted }}>{att.user?.emailAddress} | {att.user?.mobileNo}</Text>
                        {att.feedbackRating && (
                          <Text style={{ fontSize: 10, color: '#d97706', marginTop: 2 }}>★ {att.feedbackRating}/5: "{att.feedbackText || ''}"</Text>
                        )}
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: att.checkedIn ? '#16a34a' : '#d97706' }}>
                          {att.checkedIn ? 'ATTENDED' : 'REGISTERED'}
                        </Text>
                        {!att.checkedIn && (
                          <TouchableOpacity 
                            style={[s.miniBtn, { backgroundColor: colors.success }]}
                            onPress={() => checkInUser({ variables: { registrationId: att.id } })}
                          >
                            <Text style={s.miniBtnText}>Check-in</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </View>
            ) : (
              <View>
                <Text style={s.sectionTitle}>{isHi ? 'अनुसूचित कार्यक्रम' : 'Scheduled Events'}</Text>
                {specialEventsQuery.loading ? (
                  <ActivityIndicator color={colors.maroon} />
                ) : (specialEventsQuery.data?.getSpecialEvents || []).length === 0 ? (
                  <Text style={s.emptyText}>{isHi ? 'कोई अनुसूचित कार्यक्रम नहीं।' : 'No scheduled events found.'}</Text>
                ) : (
                  (specialEventsQuery.data?.getSpecialEvents || []).map(event => (
                    <View key={event.id} style={[s.followupTile, { flexDirection: 'column', alignItems: 'stretch', gap: 6 }]}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 13, color: colors.ink }}>{event.title}</Text>
                        <View style={{ backgroundColor: colors.softMaroon, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={{ fontSize: 8, color: colors.maroon, fontWeight: 'bold' }}>{event.eventType.toUpperCase()}</Text>
                        </View>
                      </View>

                      <Text style={{ fontSize: 11, color: colors.muted }}>{event.description}</Text>
                      <Text style={{ fontSize: 10, color: colors.muted }}>
                        Date: {new Date(event.eventDate).toLocaleDateString()} at {new Date(event.eventDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({event.durationMinutes} mins)
                      </Text>
                      <Text style={{ fontSize: 10, color: colors.ink }}>Location: {event.location || 'N/A'}</Text>
                      {event.replayUrl && <Text style={{ fontSize: 10, color: '#be123c' }}>🎥 Replay Available</Text>}

                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, alignSelf: 'flex-end' }}>
                        <TouchableOpacity 
                          style={[s.miniBtn, { backgroundColor: colors.maroon }]}
                          onPress={() => setSelectedEventId(event.id)}
                        >
                          <Text style={s.miniBtnText}>Guests</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[s.miniBtn, { backgroundColor: colors.muted }]}
                          onPress={() => {
                            setEditingEventId(event.id);
                            setEventTitle(event.title);
                            setEventDescription(event.description);
                            setEventTypeField(event.eventType);
                            setEventDateStr(new Date(event.eventDate).toISOString().substring(0, 16));
                            setEventDurationMinutes(String(event.durationMinutes));
                            setEventSpeakerName(event.speakerName || '');
                            setEventLocation(event.location || '');
                            setEventMaxRegistrations(String(event.maxRegistrations || 50));
                            setEventReplayUrl(event.replayUrl || '');
                            setIsEventModalOpen(true);
                          }}
                        >
                          <Text style={s.miniBtnText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[s.miniBtn, { backgroundColor: colors.error }]}
                          onPress={() => {
                            Alert.alert(
                              'Delete Event',
                              'Are you sure you want to delete this event?',
                              [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Delete', style: 'destructive', onPress: () => deleteSpecialEvent({ variables: { id: event.id } }) }
                              ]
                            );
                          }}
                        >
                          <Text style={s.miniBtnText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* Create/Edit Special Event Modal */}
            <Modal
              visible={isEventModalOpen}
              transparent
              animationType="slide"
              onRequestClose={() => setIsEventModalOpen(false)}
            >
              <View style={s.modalOverlay}>
                <ScrollView contentContainerStyle={[s.modalContent, { padding: 20, width: '90%' }]}>
                  <Text style={s.modalTitle}>{editingEventId ? 'Edit Event details' : 'Schedule Event'}</Text>
                  
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Event Title *</Text>
                  <TextInput 
                    style={s.modalInput} 
                    value={eventTitle} 
                    onChangeText={setEventTitle} 
                    placeholder="e.g. Meditation Seminar" 
                  />

                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Description *</Text>
                  <TextInput 
                    style={[s.modalInput, { height: 50, textAlignVertical: 'top' }]} 
                    value={eventDescription} 
                    onChangeText={setEventDescription} 
                    placeholder="Event details..." 
                    multiline
                  />

                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Event Type *</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 6 }}>
                    {['workshop', 'seminar', 'event'].map(t => (
                      <TouchableOpacity 
                        key={t}
                        style={[s.chip, eventTypeField === t && s.chipActive]}
                        onPress={() => setEventTypeField(t)}
                      >
                        <Text style={[s.chipText, eventTypeField === t && s.chipTextActive]}>{t.toUpperCase()}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Start Date & Time * (YYYY-MM-DD HH:MM)</Text>
                  <TextInput 
                    style={s.modalInput} 
                    value={eventDateStr} 
                    onChangeText={setEventDateStr} 
                    placeholder="e.g. 2026-07-15 10:00" 
                  />

                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Duration (mins) *</Text>
                  <TextInput 
                    style={s.modalInput} 
                    value={eventDurationMinutes} 
                    onChangeText={eventDurationMinutes => setEventDurationMinutes(eventDurationMinutes)} 
                    keyboardType="numeric"
                  />

                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Speaker Name</Text>
                  <TextInput 
                    style={s.modalInput} 
                    value={eventSpeakerName} 
                    onChangeText={setEventSpeakerName} 
                    placeholder="e.g. Dr. Verma" 
                  />

                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Location / Zoom Link</Text>
                  <TextInput 
                    style={s.modalInput} 
                    value={eventLocation} 
                    onChangeText={setEventLocation} 
                    placeholder="Zoom Link or Address" 
                  />

                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Seat Limit</Text>
                  <TextInput 
                    style={s.modalInput} 
                    value={eventMaxRegistrations} 
                    onChangeText={eventMaxRegistrations => setEventMaxRegistrations(eventMaxRegistrations)} 
                    keyboardType="numeric"
                  />

                  {editingEventId && (
                    <View style={{ width: '100%' }}>
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Replay URL</Text>
                      <TextInput 
                        style={s.modalInput} 
                        value={eventReplayUrl} 
                        onChangeText={setEventReplayUrl} 
                        placeholder="Replay Video URL" 
                      />
                    </View>
                  )}

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                    <TouchableOpacity 
                      style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: colors.maroon, alignItems: 'center' }}
                      onPress={() => {
                        const vars = {
                          title: eventTitle,
                          description: eventDescription,
                          eventType: eventTypeField,
                          eventDate: eventDateStr,
                          durationMinutes: parseInt(eventDurationMinutes, 10),
                          speakerName: eventSpeakerName,
                          location: eventLocation,
                          maxRegistrations: eventMaxRegistrations ? parseInt(eventMaxRegistrations, 10) : null
                        };
                        if (editingEventId) {
                          updateSpecialEvent({ variables: { id: editingEventId, ...vars, replayUrl: eventReplayUrl } });
                        } else {
                          createSpecialEvent({ variables: vars });
                        }
                      }}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={{ flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.line, alignItems: 'center' }}
                      onPress={() => setIsEventModalOpen(false)}
                    >
                      <Text style={{ color: colors.muted, fontWeight: 'bold', fontSize: 12 }}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </Modal>
          </View>
        )}

        {/* 3.8 REFERRALS, REVIEWS & AMBASSADORS TAB */}
        {activeTab === 'referrals' && (
          <View style={{ gap: spacing.md }}>
            <View style={s.alertBanner}>
              <Ionicons name="gift-outline" size={20} color={colors.maroon} />
              <View style={{ flex: 1 }}>
                <Text style={s.alertBannerText}>
                  {isHi ? 'रेफ़रल एवं राजदूत प्रबंधक' : 'Referrals & Ambassadors'}
                </Text>
                <Text style={{ fontSize: 10, color: colors.muted, marginTop: 2 }}>
                  {isHi ? 'अतिथि रेफ़रल को पुरस्कृत करें और समीक्षाओं को मॉडरेट करें' : 'Moderate user reviews, award referral points, and evaluate ambassadors.'}
                </Text>
              </View>
            </View>

            {/* Referrals Section */}
            <View style={s.card}>
              <Text style={s.sectionTitle}>{isHi ? 'आमंत्रित सदस्य रेफ़रल' : 'Referred Contacts'}</Text>
              {referralsReportQuery.loading ? (
                <ActivityIndicator color={colors.maroon} />
              ) : (referralsReportQuery.data?.getReferralsReport || []).length === 0 ? (
                <Text style={s.emptyText}>{isHi ? 'कोई रेफ़रल प्राप्त नहीं।' : 'No referral records found.'}</Text>
              ) : (
                (referralsReportQuery.data?.getReferralsReport || []).map(ref => (
                  <View key={ref.id} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 12, color: colors.ink }}>{ref.refereeName}</Text>
                      <View style={{ backgroundColor: ref.status === 'converted' ? '#dcfce7' : '#ffedd5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ fontSize: 8, color: ref.status === 'converted' ? '#16a34a' : '#d97706', fontWeight: 'bold' }}>{ref.status.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 10, color: colors.muted }}>Contact: {ref.refereeEmail ? `${ref.refereeEmail} | ` : ''}{ref.refereePhone}</Text>
                    <Text style={{ fontSize: 10, color: colors.muted }}>Referred by: {ref.referrer?.displayName || 'Unknown'}</Text>
                    {ref.rewardPoints > 0 && <Text style={{ fontSize: 10, color: colors.maroon, fontWeight: 'bold' }}>Awarded: {ref.rewardPoints} pts</Text>}
                    
                    {ref.status === 'pending' && (
                      <TouchableOpacity 
                        style={[s.miniBtn, { backgroundColor: colors.maroon, alignSelf: 'flex-end', marginTop: 4 }]}
                        onPress={() => {
                          Alert.alert(
                            'Convert Referral',
                            'Mark as converted and award 100 points?',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Convert', onPress: () => convertReferral({ variables: { referralId: ref.id, pointsAwarded: 100 } }) }
                            ]
                          );
                        }}
                      >
                        <Text style={s.miniBtnText}>Convert & Reward</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
            </View>

            {/* Testimonials Moderation */}
            <View style={s.card}>
              <Text style={s.sectionTitle}>{isHi ? 'प्रशंसापत्र और समीक्षाएं' : 'Reviews & Testimonials'}</Text>
              {testimonialsQuery.loading ? (
                <ActivityIndicator color={colors.maroon} />
              ) : (testimonialsQuery.data?.getTestimonials || []).length === 0 ? (
                <Text style={s.emptyText}>{isHi ? 'कोई समीक्षा उपलब्ध नहीं।' : 'No reviews found.'}</Text>
              ) : (
                (testimonialsQuery.data?.getTestimonials || []).map(test => (
                  <View key={test.id} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 11, color: colors.ink }}>{test.user?.displayName}</Text>
                      <View style={{ flexDirection: 'row' }}>
                        {Array.from({ length: test.rating }).map((_, i) => (
                          <Text key={i} style={{ color: '#fbbf24', fontSize: 10 }}>★</Text>
                        ))}
                      </View>
                    </View>
                    <Text style={{ fontSize: 11, fontStyle: 'italic', marginVertical: 4, color: colors.muted }}>"{test.content}"</Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 8, fontWeight: 'bold', color: test.status === 'approved' ? '#16a34a' : test.status === 'rejected' ? '#dc2626' : '#d97706' }}>
                        {test.status.toUpperCase()}
                      </Text>
                      {test.status === 'pending' && (
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          <TouchableOpacity 
                            style={[s.miniBtn, { backgroundColor: colors.success }]}
                            onPress={() => moderateTestimonial({ variables: { id: test.id, status: 'approved' } })}
                          >
                            <Text style={s.miniBtnText}>Approve</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={[s.miniBtn, { backgroundColor: colors.error }]}
                            onPress={() => moderateTestimonial({ variables: { id: test.id, status: 'rejected' } })}
                          >
                            <Text style={s.miniBtnText}>Reject</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Ambassador Applications */}
            <View style={s.card}>
              <Text style={s.sectionTitle}>{isHi ? 'राजदूत आवेदन' : 'Ambassador Applications'}</Text>
              {ambassadorAppsQuery.loading ? (
                <ActivityIndicator color={colors.maroon} />
              ) : (ambassadorAppsQuery.data?.getAmbassadorApplications || []).length === 0 ? (
                <Text style={s.emptyText}>{isHi ? 'कोई राजदूत आवेदन नहीं।' : 'No ambassador applications.'}</Text>
              ) : (
                (ambassadorAppsQuery.data?.getAmbassadorApplications || []).map(app => {
                  let links = {};
                  try {
                    links = JSON.parse(app.socialLinks || '{}');
                  } catch {}
                  return (
                    <View key={app.id} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 12, color: colors.ink }}>{app.user?.displayName}</Text>
                      <Text style={{ fontSize: 10, color: colors.muted }}>Contact: {app.user?.emailAddress} | {app.user?.mobileNo}</Text>
                      <Text style={{ fontSize: 10, color: colors.muted }}>Reason: {app.reason}</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 4 }}>
                        {Object.entries(links).map(([platform, link]) => (
                          <Text key={platform} style={{ fontSize: 9, color: colors.maroon, textDecorationLine: 'underline' }}>{platform}</Text>
                        ))}
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 9, fontWeight: 'bold', color: app.status === 'approved' ? '#16a34a' : app.status === 'rejected' ? '#dc2626' : '#d97706' }}>
                          {app.status.toUpperCase()}
                        </Text>
                        {app.status === 'pending' && (
                          <View style={{ flexDirection: 'row', gap: 6 }}>
                            <TouchableOpacity 
                              style={[s.miniBtn, { backgroundColor: colors.success }]}
                              onPress={() => moderateAmbassadorApp({ variables: { id: app.id, status: 'approved' } })}
                            >
                              <Text style={s.miniBtnText}>Approve</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                              style={[s.miniBtn, { backgroundColor: colors.error }]}
                              onPress={() => moderateAmbassadorApp({ variables: { id: app.id, status: 'rejected' } })}
                            >
                              <Text style={s.miniBtnText}>Reject</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        )}
 
        {/* 3.9 STORE & INVENTORY CATALOG TAB */}
        {activeTab === 'store' && (
          <View style={s.card}>
            <Text style={s.cardTitle}>🏪 Store & Catalog Inventory</Text>
            
            {/* Center filter row */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink }}>Filter by Center Catalog:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginTop: 6 }}>
                <TouchableOpacity
                  style={[
                    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#cbd5e1', marginRight: 8 },
                    selectedStoreCenterId === null && { backgroundColor: colors.maroon, borderColor: colors.maroon }
                  ]}
                  onPress={() => setSelectedStoreCenterId(null)}
                >
                  <Text style={{ fontSize: 12, color: selectedStoreCenterId === null ? '#fff' : '#475569' }}>Global Catalog</Text>
                </TouchableOpacity>
                {centersQuery.data?.getCenters?.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#cbd5e1', marginRight: 8 },
                      selectedStoreCenterId === c.id && { backgroundColor: colors.maroon, borderColor: colors.maroon }
                    ]}
                    onPress={() => setSelectedStoreCenterId(c.id)}
                  >
                    <Text style={{ fontSize: 12, color: selectedStoreCenterId === c.id ? '#fff' : '#475569' }}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Create Product Button */}
            <TouchableOpacity
              style={[s.addTaskBtn, { backgroundColor: colors.maroon, marginBottom: 16 }]}
              onPress={() => {
                resetProductForm();
                setIsProductModalOpen(true);
              }}
            >
              <Text style={s.addTaskBtnText}>+ Add New Product</Text>
            </TouchableOpacity>

            <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 12, color: colors.ink }}>Product Items</Text>
            
            {adminProductsQuery.loading ? (
              <ActivityIndicator size="small" color={colors.maroon} />
            ) : (adminProductsQuery.data?.getProducts || []).length === 0 ? (
              <Text style={{ fontStyle: 'italic', color: colors.muted, marginVertical: 12 }}>No products configured.</Text>
            ) : (
              (adminProductsQuery.data?.getProducts || []).map(prod => (
                <View key={prod.id} style={{ borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.ink }}>{prod.title}</Text>
                  {prod.description ? (
                    <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{prod.description}</Text>
                  ) : null}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6, gap: 6 }}>
                    <View style={{ backgroundColor: '#e0f2fe', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                      <Text style={{ fontSize: 10, color: '#0369a1', fontWeight: 'bold' }}>{prod.category.toUpperCase()}</Text>
                    </View>
                    <View style={{ backgroundColor: '#f0fdf4', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                      <Text style={{ fontSize: 10, color: '#166534', fontWeight: 'bold' }}>₹{parseFloat(prod.price).toFixed(2)}</Text>
                    </View>
                    <View style={{ backgroundColor: prod.inventoryCount === 0 ? '#fee2e2' : '#fef3c7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                      <Text style={{ fontSize: 10, color: prod.inventoryCount === 0 ? '#991b1b' : '#92400e', fontWeight: 'bold' }}>{prod.inventoryCount} in stock</Text>
                    </View>
                    {prod.center ? (
                      <View style={{ backgroundColor: '#f3e8ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ fontSize: 10, color: '#6b21a8', fontWeight: 'bold' }}>{prod.center.name}</Text>
                      </View>
                    ) : (
                      <View style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ fontSize: 10, color: '#475569', fontWeight: 'bold' }}>GLOBAL</Text>
                      </View>
                    )}
                  </View>

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingProductId(prod.id);
                        setProductTitle(prod.title);
                        setProductDescription(prod.description || '');
                        setProductPrice(String(prod.price));
                        setProductImageUrl(prod.imageUrl || '');
                        setProductInventoryCount(String(prod.inventoryCount));
                        setProductCategory(prod.category);
                        setProductCenterId(prod.centerId || null);
                        setIsProductModalOpen(true);
                      }}
                      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, backgroundColor: '#f1f5f9' }}
                    >
                      <Text style={{ fontSize: 12, color: colors.slate }}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert('Delete Product', 'Are you sure you want to delete this store product?', [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: () => deleteProduct({ variables: { id: prod.id } }) }
                        ]);
                      }}
                      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, backgroundColor: '#fee2e2' }}
                    >
                      <Text style={{ fontSize: 12, color: '#ef4444' }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            <View style={{ height: 2, backgroundColor: '#f1f5f9', marginVertical: 20 }} />

            <Text style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 12, color: colors.ink }}>📦 Orders & Returns</Text>
            
            {adminOrdersQuery.loading ? (
              <ActivityIndicator size="small" color={colors.maroon} />
            ) : (adminOrdersQuery.data?.getAdminOrders || []).length === 0 ? (
              <Text style={{ fontStyle: 'italic', color: colors.muted, marginVertical: 12 }}>No orders placed yet.</Text>
            ) : (
              (adminOrdersQuery.data?.getAdminOrders || []).map(order => (
                <View key={order.id} style={{ borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingVertical: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.slate }}>Order #{order.id.substring(0, 8)}</Text>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.slate }}>₹{parseFloat(order.totalAmount).toFixed(2)}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>Customer: {order.user?.displayName}</Text>
                  <Text style={{ fontSize: 11, color: colors.muted }}>Address: {order.address?.fullName}, {order.address?.addressLine1}, {order.address?.city}</Text>

                  {/* Items list */}
                  <View style={{ marginVertical: 6, backgroundColor: '#f8fafc', padding: 8, borderRadius: 4 }}>
                    {order.items?.map(it => (
                      <Text key={it.id} style={{ fontSize: 11, color: '#475569' }}>• {it.product?.title} (x{it.quantity})</Text>
                    ))}
                  </View>

                  {/* Return Request handling */}
                  {order.returnRequest ? (
                    <View style={{ marginVertical: 6, backgroundColor: '#fffbeb', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#fef3c7' }}>
                      <Text style={{ fontSize: 12, color: '#b45309', fontWeight: 'bold' }}>Return request: "{order.returnRequest.reason}"</Text>
                      <Text style={{ fontSize: 12, color: '#b45309' }}>Status: {order.returnRequest.status.toUpperCase()}</Text>
                      {order.returnRequest.adminNotes && (
                        <Text style={{ fontSize: 12, color: '#b45309' }}>Notes: {order.returnRequest.adminNotes}</Text>
                      )}
                      {order.returnRequest.status === 'requested' && (
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                          <TouchableOpacity
                            onPress={() => reviewOrderReturn({
                              variables: {
                                orderReturnId: order.returnRequest.id,
                                status: 'approved',
                                adminNotes: 'Approved via mobile'
                              }
                            })}
                            style={{ backgroundColor: '#16a34a', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4 }}
                          >
                            <Text style={{ color: '#fff', fontSize: 11 }}>Approve return</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => reviewOrderReturn({
                              variables: {
                                orderReturnId: order.returnRequest.id,
                                status: 'rejected',
                                adminNotes: 'Rejected via mobile'
                              }
                            })}
                            style={{ backgroundColor: '#dc2626', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4 }}
                          >
                            <Text style={{ color: '#fff', fontSize: 11 }}>Reject</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ) : null}

                  {/* Status update chips */}
                  <View style={{ marginTop: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink }}>Update Fulfillment Status:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginTop: 4 }}>
                      {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(st => (
                        <TouchableOpacity
                          key={st}
                          style={[
                            { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#cbd5e1', marginRight: 6 },
                            order.status === st && { backgroundColor: colors.maroon, borderColor: colors.maroon }
                          ]}
                          onPress={() => updateOrderStatus({ variables: { orderId: order.id, status: st } })}
                        >
                          <Text style={{ fontSize: 10, color: order.status === st ? '#fff' : '#475569' }}>{st.toUpperCase()}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Tracking details */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, justifyContent: 'space-between' }}>
                    <View>
                      {order.trackingNumber ? (
                        <Text style={{ fontSize: 11, color: colors.muted }}>
                          Tracking: <Text style={{ fontWeight: 'bold' }}>{order.carrier?.toUpperCase()} - {order.trackingNumber}</Text>
                        </Text>
                      ) : (
                        <Text style={{ fontSize: 11, fontStyle: 'italic', color: colors.muted }}>No tracking number added yet</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        let carrierIn = order.carrier || 'BlueDart';
                        let numIn = order.trackingNumber || '';
                        Alert.prompt(
                          'Update Tracking Number',
                          `Enter tracking reference number:`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Save',
                              onPress: (val) => {
                                if (val && val.trim()) {
                                  updateOrderTracking({
                                    variables: {
                                      orderId: order.id,
                                      carrier: carrierIn,
                                      trackingNumber: val.trim(),
                                      estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString()
                                    }
                                  });
                                }
                              }
                            }
                          ],
                          'plain-text',
                          numIn
                        );
                      }}
                      style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, backgroundColor: '#f1f5f9' }}
                    >
                      <Text style={{ fontSize: 11, color: colors.maroon, fontWeight: 'bold' }}>
                        {order.trackingNumber ? 'Edit' : 'Add Tracking'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Create/Edit Product Modal */}
        <Modal
          visible={isProductModalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsProductModalOpen(false)}
        >
          <View style={s.modalOverlay}>
            <ScrollView contentContainerStyle={[s.modalContent, { padding: 20, width: '90%' }]}>
              <Text style={s.modalTitle}>{editingProductId ? 'Edit Product Item' : 'Create Product Item'}</Text>
              
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Product Title *</Text>
              <TextInput
                style={s.modalInput}
                value={productTitle}
                onChangeText={setProductTitle}
                placeholder="e.g. Premium Pregnancy Diet Booklet"
              />

              <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Description</Text>
              <TextInput
                style={[s.modalInput, { height: 60, textAlignVertical: 'top' }]}
                value={productDescription}
                onChangeText={setProductDescription}
                placeholder="Details..."
                multiline
              />

              <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Price (₹) *</Text>
              <TextInput
                style={s.modalInput}
                value={productPrice}
                onChangeText={productVal => setProductPrice(productVal)}
                keyboardType="numeric"
                placeholder="Price value"
              />

              <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Inventory Stock Count *</Text>
              <TextInput
                style={s.modalInput}
                value={productInventoryCount}
                onChangeText={stockVal => setProductInventoryCount(stockVal)}
                keyboardType="numeric"
                placeholder="e.g. 10"
              />

              <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Product Image URL</Text>
              <TextInput
                style={s.modalInput}
                value={productImageUrl}
                onChangeText={setProductImageUrl}
                placeholder="Image link"
              />

              <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Category Classification *</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 6 }}>
                {['kit', 'book', 'bundle'].map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[s.chip, productCategory === cat && s.chipActive]}
                    onPress={() => setProductCategory(cat)}
                  >
                    <Text style={[s.chipText, productCategory === cat && s.chipTextActive]}>{cat.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginTop: 8 }}>Center catalog restriction (Optional)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginTop: 6, marginBottom: 12 }}>
                <TouchableOpacity
                  style={[
                    s.chip,
                    productCenterId === null && s.chipActive
                  ]}
                  onPress={() => setProductCenterId(null)}
                >
                  <Text style={[s.chipText, productCenterId === null && s.chipTextActive]}>GLOBAL</Text>
                </TouchableOpacity>
                {centersQuery.data?.getCenters?.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      s.chip,
                      productCenterId === c.id && s.chipActive
                    ]}
                    onPress={() => setProductCenterId(c.id)}
                  >
                    <Text style={[s.chipText, productCenterId === c.id && s.chipTextActive]}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                <TouchableOpacity
                  onPress={() => setIsProductModalOpen(false)}
                  style={{ flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#f1f5f9', alignItems: 'center' }}
                >
                  <Text style={{ color: colors.slate, fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    const priceVal = parseFloat(productPrice);
                    const countVal = parseInt(productInventoryCount, 10);
                    if (!productTitle.trim()) {
                      Alert.alert('Error', 'Product Title is required');
                      return;
                    }
                    if (isNaN(priceVal) || priceVal < 0) {
                      Alert.alert('Error', 'Invalid price value');
                      return;
                    }
                    if (isNaN(countVal) || countVal < 0) {
                      Alert.alert('Error', 'Invalid inventory stock count');
                      return;
                    }
                    const vars = {
                      title: productTitle,
                      description: productDescription,
                      price: priceVal,
                      imageUrl: productImageUrl,
                      inventoryCount: countVal,
                      category: productCategory,
                      centerId: productCenterId || null
                    };
                    if (editingProductId) {
                      updateProduct({ variables: { id: editingProductId, ...vars } });
                    } else {
                      createProduct({ variables: vars });
                    }
                  }}
                  style={{ flex: 2, padding: 12, borderRadius: 8, backgroundColor: colors.maroon, alignItems: 'center' }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save Product</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* 3.10 PLANS & BILLING TAB */}
        {activeTab === 'billing' && (
          <View style={s.card}>
            <Text style={s.cardTitle}>💳 Plans, Coupons & Billing</Text>

            {/* Sub-tab navigation */}
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 16 }}>
              {[
                ['plans', 'Plans'],
                ['coupons', 'Coupons'],
                ['invoices', 'Invoices']
              ].map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#cbd5e1' },
                    activeBillingSubTab === key && { backgroundColor: colors.maroon, borderColor: colors.maroon }
                  ]}
                  onPress={() => setActiveBillingSubTab(key)}
                >
                  <Text style={{ fontSize: 12, color: activeBillingSubTab === key ? '#fff' : '#475569', fontWeight: 'bold' }}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sub-tab 1: Plans */}
            {activeBillingSubTab === 'plans' && (
              <View>
                <TouchableOpacity
                  style={[s.addTaskBtn, { backgroundColor: colors.maroon, marginBottom: 12 }]}
                  onPress={() => {
                    resetPlanForm();
                    setIsPlanModalOpen(true);
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>+ Create Subscription Plan</Text>
                </TouchableOpacity>

                {plansQuery.loading ? (
                  <ActivityIndicator color={colors.maroon} />
                ) : plansQuery.data?.getPlans?.length === 0 ? (
                  <Text style={s.emptyText}>No subscription plans defined.</Text>
                ) : (
                  plansQuery.data.getPlans.map(plan => {
                    let feats = plan.features || [];
                    if (typeof feats === 'string') {
                      try { feats = JSON.parse(feats); } catch {}
                    }
                    return (
                      <View key={plan.id} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 13, color: colors.ink }}>{plan.name}</Text>
                        {plan.description && <Text style={{ fontSize: 11, color: colors.muted, marginVertical: 2 }}>{plan.description}</Text>}
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.maroon }}>₹{parseFloat(plan.price).toFixed(2)} / {plan.billingPeriod.toUpperCase()}</Text>
                        <Text style={{ fontSize: 11, color: colors.muted }}>Trial Period: {plan.trialDays} Days</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                          {feats.map(f => (
                            <View key={f} style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: '#f3e8ff' }}>
                              <Text style={{ fontSize: 9, color: '#6b21a8' }}>{f.toUpperCase()}</Text>
                            </View>
                          ))}
                        </View>
                        <TouchableOpacity
                          style={{ alignSelf: 'flex-end', marginTop: 8 }}
                          onPress={() => {
                            Alert.alert(
                              'Delete Subscription Plan',
                              'Are you sure you want to delete this subscription plan?',
                              [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Delete', style: 'destructive', onPress: () => deleteSubscriptionPlan({ variables: { id: plan.id } }) }
                              ]
                            );
                          }}
                        >
                          <Text style={{ color: colors.error, fontSize: 11 }}>Delete Plan</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {/* Sub-tab 2: Coupons */}
            {activeBillingSubTab === 'coupons' && (
              <View>
                <TouchableOpacity
                  style={[s.addTaskBtn, { backgroundColor: colors.maroon, marginBottom: 12 }]}
                  onPress={() => {
                    resetCouponForm();
                    setIsCouponModalOpen(true);
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>+ Create Coupon Code</Text>
                </TouchableOpacity>

                {couponsQuery.loading ? (
                  <ActivityIndicator color={colors.maroon} />
                ) : couponsQuery.data?.getCoupons?.length === 0 ? (
                  <Text style={s.emptyText}>No promo coupons created.</Text>
                ) : (
                  couponsQuery.data.getCoupons.map(coupon => (
                    <View key={coupon.id} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line }}>
                      <Text style={{ fontWeight: 'bold', fontSize: 12, color: colors.ink }}>Code: {coupon.code}</Text>
                      <Text style={{ fontSize: 11, color: colors.success, fontWeight: 'bold' }}>
                        Discount: {coupon.discountPercent ? `${coupon.discountPercent}% OFF` : `₹${parseFloat(coupon.discountAmount).toFixed(2)} OFF`}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.muted }}>
                        Validity: {new Date(coupon.validFrom).toLocaleDateString()} to {new Date(coupon.validUntil).toLocaleDateString()}
                      </Text>
                      <Text style={{ fontSize: 11, color: colors.muted }}>
                        Redemptions: {coupon.redemptionsCount} / {coupon.maxRedemptions || 'unlimited'}
                      </Text>
                      <TouchableOpacity
                        style={{ alignSelf: 'flex-end', marginTop: 6 }}
                        onPress={() => {
                          Alert.alert(
                            'Delete Promo Coupon',
                            'Are you sure you want to delete this coupon?',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Delete', style: 'destructive', onPress: () => deleteCoupon({ variables: { id: coupon.id } }) }
                            ]
                          );
                        }}
                      >
                        <Text style={{ color: colors.error, fontSize: 11 }}>Delete Coupon</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* Sub-tab 3: Invoices */}
            {activeBillingSubTab === 'invoices' && (
              <View>
                <TouchableOpacity
                  style={[s.addTaskBtn, { backgroundColor: '#475569', marginBottom: 12 }]}
                  disabled={isRenewing}
                  onPress={() => simulateRenewals()}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>
                    {isRenewing ? 'Processing Sim...' : 'Simulate Renewal Run'}
                  </Text>
                </TouchableOpacity>

                {adminInvoicesQuery.loading ? (
                  <ActivityIndicator color={colors.maroon} />
                ) : adminInvoicesQuery.data?.getAdminInvoices?.length === 0 ? (
                  <Text style={s.emptyText}>No transaction invoices found.</Text>
                ) : (
                  adminInvoicesQuery.data.getAdminInvoices.map(invoice => (
                    <View key={invoice.id} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 12, color: colors.ink }}>{invoice.invoiceNumber}</Text>
                        <Text style={{ fontSize: 11, color: colors.muted }}>{new Date(invoice.billingDate).toLocaleDateString()}</Text>
                      </View>
                      <Text style={{ fontSize: 11, color: colors.ink, marginVertical: 2 }}>Customer: {invoice.user?.displayName}</Text>
                      {invoice.subscription?.plan && (
                        <Text style={{ fontSize: 11, color: colors.muted }}>Plan: {invoice.subscription.plan.name}</Text>
                      )}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 12, color: colors.ink }}>₹{parseFloat(invoice.amount).toFixed(2)}</Text>
                        <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: invoice.status === 'paid' ? '#dcfce7' : '#fee2e2' }}>
                          <Text style={{ fontSize: 8, color: invoice.status === 'paid' ? '#15803d' : '#b91c1c', fontWeight: 'bold' }}>
                            {invoice.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        )}

        {/* Create Plan Modal */}
        <Modal
          visible={isPlanModalOpen}
          onRequestClose={() => setIsPlanModalOpen(false)}
          animationType="slide"
        >
          <View style={{ flex: 1, padding: 20, backgroundColor: colors.paper }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.ink, marginBottom: 16 }}>Create Subscription Plan</Text>
            <ScrollView style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 8 }}>Plan Name:</Text>
              <TextInput value={planName} onChangeText={setPlanName} style={s.input} placeholder="e.g. Premium Bundle" />

              <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 8 }}>Description:</Text>
              <TextInput value={planDescription} onChangeText={setPlanDescription} style={[s.input, { height: 60 }]} multiline placeholder="Benefits info..." />

              <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 8 }}>Billing Price (₹):</Text>
              <TextInput value={planPrice} onChangeText={setPlanPrice} style={s.input} keyboardType="numeric" />

              <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 8 }}>Billing Period:</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginVertical: 4 }}>
                {['monthly', 'yearly'].map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[{ padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#cbd5e1' }, planBillingPeriod === p && { backgroundColor: colors.maroon }]}
                    onPress={() => setPlanBillingPeriod(p)}
                  >
                    <Text style={{ fontSize: 11, color: planBillingPeriod === p ? '#fff' : '#475569' }}>{p.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 8 }}>Free Trial Days:</Text>
              <TextInput value={planTrialDays} onChangeText={setPlanTrialDays} style={s.input} keyboardType="numeric" />

              <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 8 }}>Entitled Features (comma separated):</Text>
              <TextInput value={planFeatures} onChangeText={setPlanFeatures} style={s.input} placeholder="live_classes, diet_plans" />

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                <TouchableOpacity
                  onPress={() => setIsPlanModalOpen(false)}
                  style={{ flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.line, alignItems: 'center' }}
                >
                  <Text style={{ color: colors.ink }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    const featsList = planFeatures.split(',')
                                                .map(f => f.trim())
                                                .filter(Boolean);
                    createSubscriptionPlan({
                      variables: {
                        name: planName,
                        description: planDescription,
                        price: parseFloat(planPrice) || 0.0,
                        billingPeriod: planBillingPeriod,
                        trialDays: parseInt(planTrialDays, 10) || 7,
                        features: featsList
                      }
                    });
                  }}
                  style={{ flex: 2, padding: 12, borderRadius: 8, backgroundColor: colors.maroon, alignItems: 'center' }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Create Plan</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* Create Coupon Modal */}
        <Modal
          visible={isCouponModalOpen}
          onRequestClose={() => setIsCouponModalOpen(false)}
          animationType="slide"
        >
          <View style={{ flex: 1, padding: 20, backgroundColor: colors.paper }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.ink, marginBottom: 16 }}>Create Promo Coupon</Text>
            <ScrollView style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 8 }}>Coupon Code:</Text>
              <TextInput value={couponCode} onChangeText={setCouponCode} style={s.input} placeholder="e.g. WELCOME50" />

              <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 8 }}>Discount Percent (%) (Option 1):</Text>
              <TextInput value={couponDiscountPercent} onChangeText={text => { setCouponDiscountPercent(text); setCouponDiscountAmount(''); }} style={s.input} keyboardType="numeric" placeholder="e.g. 50" />

              <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 8 }}>Discount Amount (₹) (Option 2):</Text>
              <TextInput value={couponDiscountAmount} onChangeText={text => { setCouponDiscountAmount(text); setCouponDiscountPercent(''); }} style={s.input} keyboardType="numeric" placeholder="e.g. 150" />

              <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 8 }}>Valid From Date (YYYY-MM-DD):</Text>
              <TextInput value={couponValidFrom} onChangeText={setCouponValidFrom} style={s.input} placeholder="2026-07-01" />

              <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 8 }}>Valid Until Date (YYYY-MM-DD):</Text>
              <TextInput value={couponValidUntil} onChangeText={setCouponValidUntil} style={s.input} placeholder="2026-12-31" />

              <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 8 }}>Max Redemptions limit:</Text>
              <TextInput value={couponMaxRedemptions} onChangeText={setCouponMaxRedemptions} style={s.input} keyboardType="numeric" placeholder="e.g. 100" />

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                <TouchableOpacity
                  onPress={() => setIsCouponModalOpen(false)}
                  style={{ flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.line, alignItems: 'center' }}
                >
                  <Text style={{ color: colors.ink }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    createCoupon({
                      variables: {
                        code: couponCode,
                        discountPercent: couponDiscountPercent ? parseInt(couponDiscountPercent, 10) : null,
                        discountAmount: couponDiscountAmount ? parseFloat(couponDiscountAmount) : null,
                        validFrom: couponValidFrom,
                        validUntil: couponValidUntil,
                        maxRedemptions: couponMaxRedemptions ? parseInt(couponMaxRedemptions, 10) : null
                      }
                    });
                  }}
                  style={{ flex: 2, padding: 12, borderRadius: 8, backgroundColor: colors.maroon, alignItems: 'center' }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Create Coupon</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* 3.11 FINANCE & SETTLEMENTS TAB */}
        {activeTab === 'finance' && (
          <View style={s.card}>
            <Text style={s.cardTitle}>📊 Financial Settlements Ledger</Text>

            {/* Center filter row */}
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink }}>Filter by Center:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginTop: 4 }}>
                <TouchableOpacity
                  style={[
                    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#cbd5e1', marginRight: 8 },
                    financeCenterId === null && { backgroundColor: colors.maroon, borderColor: colors.maroon }
                  ]}
                  onPress={() => setFinanceCenterId(null)}
                >
                  <Text style={{ fontSize: 11, color: financeCenterId === null ? '#fff' : '#475569' }}>All Centers</Text>
                </TouchableOpacity>
                {centersQuery.data?.getCenters?.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[
                      { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#cbd5e1', marginRight: 8 },
                      financeCenterId === c.id && { backgroundColor: colors.maroon, borderColor: colors.maroon }
                    ]}
                    onPress={() => setFinanceCenterId(c.id)}
                  >
                    <Text style={{ fontSize: 11, color: financeCenterId === c.id ? '#fff' : '#475569' }}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* KPI statistics cards */}
            {financialReportQuery.loading ? (
              <ActivityIndicator color={colors.maroon} />
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                <View style={{ flex: 1, minWidth: 100, padding: 8, borderRadius: 8, backgroundColor: '#f8fafc' }}>
                  <Text style={{ fontSize: 9, color: colors.muted }}>Gross Revenue</Text>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.ink }}>₹{(financialReportQuery.data?.getFinancialReport?.totalRevenue || 0).toFixed(2)}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 100, padding: 8, borderRadius: 8, backgroundColor: '#fff1f2' }}>
                  <Text style={{ fontSize: 9, color: colors.muted }}>Refunds</Text>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#be123c' }}>₹{(financialReportQuery.data?.getFinancialReport?.totalRefunds || 0).toFixed(2)}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 100, padding: 8, borderRadius: 8, backgroundColor: '#f0fdf4' }}>
                  <Text style={{ fontSize: 9, color: colors.muted }}>Net Revenue</Text>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#15803d' }}>₹{(financialReportQuery.data?.getFinancialReport?.netRevenue || 0).toFixed(2)}</Text>
                </View>
                <View style={{ width: '100%', padding: 8, borderRadius: 8, backgroundColor: '#f5f3ff', marginTop: 4 }}>
                  <Text style={{ fontSize: 9, color: '#6b21a8', fontWeight: 'bold' }}>Settlement Allocations:</Text>
                  <Text style={{ fontSize: 11, color: '#6b21a8' }}>Center (70%): ₹{(financialReportQuery.data?.getFinancialReport?.totalCenterShare || 0).toFixed(2)}</Text>
                  <Text style={{ fontSize: 11, color: '#4c1d95' }}>Platform (30%): ₹{(financialReportQuery.data?.getFinancialReport?.totalPlatformShare || 0).toFixed(2)}</Text>
                </View>
              </View>
            )}

            {/* Transactions Ledger List */}
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.ink, marginBottom: 8 }}>Ledger Transactions:</Text>
            {financialTransactionsQuery.loading ? (
              <ActivityIndicator color={colors.maroon} />
            ) : financialTransactionsQuery.data?.getFinancialTransactions?.length === 0 ? (
              <Text style={s.emptyText}>No financial transactions recorded.</Text>
            ) : (
              financialTransactionsQuery.data.getFinancialTransactions.map(tx => (
                <View key={tx.id} style={{ padding: 10, borderRadius: 8, backgroundColor: '#fafafa', marginBottom: 8, borderWidth: 1, borderColor: colors.line, paddingBottom: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 11, color: colors.muted }}>{new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}</Text>
                    <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: tx.type === 'payment' ? '#dcfce7' : '#fee2e2' }}>
                      <Text style={{ fontSize: 8, color: tx.type === 'payment' ? '#15803d' : '#b91c1c', fontWeight: 'bold' }}>{tx.type.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={{ fontWeight: 'bold', fontSize: 12, color: colors.ink, marginTop: 4 }}>Customer: {tx.user?.displayName || 'Unknown'}</Text>
                  <Text style={{ fontSize: 11, color: colors.muted }}>Center: {tx.center?.name || 'Global Catalog'}</Text>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.maroon, marginTop: 2 }}>Amount: ₹{parseFloat(tx.amount).toFixed(2)}</Text>
                  <Text style={{ fontSize: 10, color: colors.muted }}>Ctr Share: ₹{parseFloat(tx.centerShare).toFixed(2)} | Platform Fee: ₹{parseFloat(tx.platformShare).toFixed(2)}</Text>

                  {/* Reconciled Info */}
                  <View style={{ marginTop: 6, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 6 }}>
                    {tx.reconciledAt ? (
                      <View>
                        <Text style={{ fontSize: 10, color: '#2563eb', fontWeight: 'bold' }}>✓ Reconciled on {new Date(tx.reconciledAt).toLocaleDateString()}</Text>
                        {tx.reconciliationNotes && <Text style={{ fontSize: 10, color: colors.muted }}>Notes: {tx.reconciliationNotes}</Text>}
                      </View>
                    ) : (
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 10, color: '#d97706', fontWeight: 'bold' }}>⚠️ Unreconciled</Text>
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          <TouchableOpacity
                            style={[s.miniBtn, { backgroundColor: '#475569' }]}
                            onPress={() => {
                              setSelectedTxId(tx.id);
                              setIsReconcileModalOpen(true);
                            }}
                          >
                            <Text style={s.miniBtnText}>Reconcile</Text>
                          </TouchableOpacity>
                          {tx.type === 'payment' && tx.status !== 'refunded' && (
                            <TouchableOpacity
                              style={[s.miniBtn, { backgroundColor: colors.error }]}
                              onPress={() => {
                                setSelectedPaymentId(tx.payment?.id || tx.paymentId);
                                setRefundAmount(tx.amount);
                                setIsRefundModalOpen(true);
                              }}
                            >
                              <Text style={s.miniBtnText}>Refund</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Reconcile Transaction Modal */}
        <Modal
          visible={isReconcileModalOpen}
          onRequestClose={() => setIsReconcileModalOpen(false)}
          animationType="slide"
        >
          <View style={{ flex: 1, padding: 20, backgroundColor: colors.paper }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.ink, marginBottom: 16 }}>Mark as Reconciled</Text>
            <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 8 }}>Reconciliation audit notes:</Text>
            <TextInput
              value={reconciliationNotes}
              onChangeText={setReconciliationNotes}
              style={[s.input, { height: 80 }]}
              multiline
              placeholder="e.g. Verified with bank statement..."
            />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
              <TouchableOpacity
                onPress={() => setIsReconcileModalOpen(false)}
                style={{ flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.line, alignItems: 'center' }}
              >
                <Text style={{ color: colors.ink }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  reconcileTransaction({
                    variables: {
                      transactionId: selectedTxId,
                      notes: reconciliationNotes
                    }
                  });
                }}
                style={{ flex: 2, padding: 12, borderRadius: 8, backgroundColor: colors.maroon, alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Reconcile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Refund Transaction Modal */}
        <Modal
          visible={isRefundModalOpen}
          onRequestClose={() => setIsRefundModalOpen(false)}
          animationType="slide"
        >
          <View style={{ flex: 1, padding: 20, backgroundColor: colors.paper }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.ink, marginBottom: 16 }}>Process Refund</Text>
            <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 8 }}>Refund Amount (₹):</Text>
            <TextInput
              value={refundAmount}
              onChangeText={setRefundAmount}
              style={s.input}
              keyboardType="numeric"
            />
            <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 8 }}>Reason for Refund:</Text>
            <TextInput
              value={refundReason}
              onChangeText={setRefundReason}
              style={[s.input, { height: 80 }]}
              multiline
              placeholder="e.g. Accidental double payment..."
            />
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
              <TouchableOpacity
                onPress={() => setIsRefundModalOpen(false)}
                style={{ flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.line, alignItems: 'center' }}
              >
                <Text style={{ color: colors.ink }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  refundTransaction({
                    variables: {
                      paymentId: selectedPaymentId,
                      refundAmount: parseFloat(refundAmount) || 0,
                      reason: refundReason
                    }
                  });
                }}
                style={{ flex: 2, padding: 12, borderRadius: 8, backgroundColor: colors.maroon, alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Process Refund</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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

        {/* 6. REPORT BUILDER & DASHBOARDS TAB */}
        {activeTab === 'reports' && (
          <View style={s.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={s.cardTitle}>📊 Report Builder</Text>
              <TouchableOpacity
                style={[s.miniBtn, { backgroundColor: colors.maroon, paddingHorizontal: 10 }]}
                onPress={() => setIsReportModalOpen(true)}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>+ Create</Text>
              </TouchableOpacity>
            </View>

            {/* Role Filter Chips */}
            <View style={{ marginBottom: 12 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                {['', 'MOTHER', 'PARTNER', 'CENTER', 'FRANCHISE', 'STAFF', 'PLATFORM'].map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: '#cbd5e1', marginRight: 6 },
                      reportRoleFilter === r && { backgroundColor: colors.maroon, borderColor: colors.maroon }
                    ]}
                    onPress={() => setReportRoleFilter(r)}
                  >
                    <Text style={{ fontSize: 10, color: reportRoleFilter === r ? '#fff' : '#475569' }}>
                      {r || 'All Roles'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* List of saved report templates */}
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.ink, marginBottom: 6 }}>Templates:</Text>
            {reportTemplatesQuery.loading ? (
              <ActivityIndicator color={colors.maroon} />
            ) : reportTemplatesQuery.data?.getReportTemplates?.length === 0 ? (
              <Text style={{ fontSize: 11, color: colors.muted, fontStyle: 'italic', marginBottom: 16 }}>No report templates found.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 150, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 10 }}>
                {reportTemplatesQuery.data.getReportTemplates.map(tpl => (
                  <TouchableOpacity
                    key={tpl.id}
                    style={[
                      { padding: 8, borderRadius: 6, marginBottom: 6, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' },
                      selectedTemplateId === tpl.id && { backgroundColor: '#fee2e2', borderColor: '#fca5a5' }
                    ]}
                    onPress={() => {
                      setSelectedTemplateId(tpl.id);
                      setCustomReportFilters(tpl.filters || '{}');
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.ink }}>{tpl.title}</Text>
                      <View style={{ paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3, backgroundColor: '#e0f2fe' }}>
                        <Text style={{ fontSize: 8, color: '#0369a1' }}>{tpl.role}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 9, color: colors.muted, marginTop: 2 }}>{tpl.description}</Text>
                    {tpl.sharedWithRoles && (
                      <Text style={{ fontSize: 8, color: colors.muted, marginTop: 4 }}>Shared with: <Text style={{ color: '#0369a1', fontWeight: 'bold' }}>{tpl.sharedWithRoles}</Text></Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Workspace details dashboard */}
            {selectedTemplateId ? (
              (() => {
                const activeTpl = reportTemplatesQuery.data?.getReportTemplates?.find(t => t.id === selectedTemplateId);
                const metrics = JSON.parse(reportDataQuery.data?.getReportData?.metrics || '{}');
                return (
                  <View style={{ borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.ink, flex: 1 }}>{activeTpl?.title}</Text>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <TouchableOpacity
                          style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: '#e2e8f0' }}
                          onPress={() => {
                            setShareRolesText(activeTpl?.sharedWithRoles || '');
                            setIsShareModalOpen(true);
                          }}
                        >
                          <Text style={{ fontSize: 9, fontWeight: 'bold' }}>Share</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, backgroundColor: '#e2e8f0' }}
                          onPress={() => {
                            setIsScheduleModalOpen(true);
                          }}
                        >
                          <Text style={{ fontSize: 9, fontWeight: 'bold' }}>Schedule</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={{ fontSize: 10, color: colors.muted, marginBottom: 12 }}>{activeTpl?.description}</Text>

                    {/* Filter parameters input */}
                    <View style={{ padding: 8, borderRadius: 6, backgroundColor: '#f1f5f9', marginBottom: 12 }}>
                      <Text style={{ fontSize: 9, fontWeight: 'bold', color: '#475569' }}>Filters JSON Parameters:</Text>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                        <TextInput
                          value={customReportFilters}
                          onChangeText={setCustomReportFilters}
                          style={{ flex: 1, height: 32, paddingHorizontal: 8, borderRadius: 4, backgroundColor: '#fff', fontSize: 11, borderWidth: 1, borderColor: '#cbd5e1' }}
                        />
                        <TouchableOpacity
                          style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4, backgroundColor: colors.maroon, justifyContent: 'center' }}
                          onPress={() => reportDataQuery.refetch({ templateId: selectedTemplateId, filters: customReportFilters })}
                        >
                          <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>Apply</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Dynamic dashboard statistics cards */}
                    {reportDataQuery.loading ? (
                      <ActivityIndicator color={colors.maroon} />
                    ) : (
                      <View style={{ gap: 8 }}>
                        {activeTpl?.role === 'MOTHER' && (
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                            <View style={{ flex: 1, minWidth: 90, padding: 8, borderRadius: 6, backgroundColor: '#fdf2f8' }}>
                              <Text style={{ fontSize: 8, color: colors.muted }}>Daily Logs</Text>
                              <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{metrics.vitalsCount || 0}</Text>
                            </View>
                            <View style={{ flex: 1, minWidth: 90, padding: 8, borderRadius: 6, backgroundColor: '#fdf2f8' }}>
                              <Text style={{ fontSize: 8, color: colors.muted }}>Bookmarks</Text>
                              <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{metrics.bookmarksCount || 0}</Text>
                            </View>
                            <View style={{ flex: 1, minWidth: 90, padding: 8, borderRadius: 6, backgroundColor: '#fdf2f8' }}>
                              <Text style={{ fontSize: 8, color: colors.muted }}>Worksheets</Text>
                              <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{metrics.progressCount || 0}</Text>
                            </View>
                          </View>
                        )}

                        {activeTpl?.role === 'PARTNER' && (
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                            <View style={{ flex: 1, minWidth: 120, padding: 8, borderRadius: 6, backgroundColor: '#f5f3ff' }}>
                              <Text style={{ fontSize: 8, color: colors.muted }}>Partner Activities</Text>
                              <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{metrics.partnerActivitiesCount || 0}</Text>
                            </View>
                            <View style={{ flex: 1, minWidth: 120, padding: 8, borderRadius: 6, backgroundColor: '#f5f3ff' }}>
                              <Text style={{ fontSize: 8, color: colors.muted }}>Sensory Tasks</Text>
                              <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{metrics.sensoryActivitiesCount || 0}</Text>
                            </View>
                          </View>
                        )}

                        {activeTpl?.role === 'CENTER' && (
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                            <View style={{ flex: 1, minWidth: 90, padding: 8, borderRadius: 6, backgroundColor: '#f0fdf4' }}>
                              <Text style={{ fontSize: 8, color: colors.muted }}>Active Mothers</Text>
                              <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{metrics.activeMothers || 0}</Text>
                            </View>
                            <View style={{ flex: 1, minWidth: 90, padding: 8, borderRadius: 6, backgroundColor: '#f0fdf4' }}>
                              <Text style={{ fontSize: 8, color: colors.muted }}>Appointments</Text>
                              <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{metrics.upcomingAppointments || 0}</Text>
                            </View>
                            <View style={{ width: '100%', padding: 8, borderRadius: 6, backgroundColor: '#f0fdf4' }}>
                              <Text style={{ fontSize: 8, color: colors.muted }}>Revenue Collected</Text>
                              <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.maroon }}>₹{parseFloat(metrics.localRevenue || 0).toFixed(2)}</Text>
                            </View>
                          </View>
                        )}

                        {activeTpl?.role === 'FRANCHISE' && (
                          <View style={{ gap: 6 }}>
                            <View style={{ padding: 8, borderRadius: 6, backgroundColor: '#ecfdf5' }}>
                              <Text style={{ fontSize: 8, color: colors.muted }}>Total Franchise Revenue</Text>
                              <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#047857' }}>₹{parseFloat(metrics.totalFranchiseRevenue || 0).toFixed(2)}</Text>
                            </View>
                            <View style={{ padding: 8, borderRadius: 6, backgroundColor: '#eff6ff' }}>
                              <Text style={{ fontSize: 8, color: colors.muted }}>Leads Conversion Rate</Text>
                              <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#1d4ed8' }}>{(metrics.leadsConversionRate || 0).toFixed(1)}%</Text>
                            </View>
                          </View>
                        )}

                        {activeTpl?.role === 'STAFF' && (
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                            <View style={{ flex: 1, minWidth: 120, padding: 8, borderRadius: 6, backgroundColor: '#fef3c7' }}>
                              <Text style={{ fontSize: 8, color: colors.muted }}>Tasks Completed</Text>
                              <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{metrics.tasksCompleted || 0}</Text>
                            </View>
                            <View style={{ flex: 1, minWidth: 120, padding: 8, borderRadius: 6, backgroundColor: '#fef3c7' }}>
                              <Text style={{ fontSize: 8, color: colors.muted }}>Open Tickets</Text>
                              <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{metrics.pendingTickets || 0}</Text>
                            </View>
                          </View>
                        )}

                        {activeTpl?.role === 'PLATFORM' && (
                          <View style={{ gap: 6 }}>
                            <View style={{ padding: 8, borderRadius: 6, backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e2e8f0' }}>
                              <Text style={{ fontSize: 8, color: colors.muted }}>Global Registered Accounts</Text>
                              <Text style={{ fontSize: 15, fontWeight: 'bold' }}>{metrics.totalUsers || 0}</Text>
                            </View>
                            <View style={{ padding: 8, borderRadius: 6, backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e2e8f0' }}>
                              <Text style={{ fontSize: 8, color: colors.muted }}>Premium User Share</Text>
                              <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.maroon }}>{(metrics.premiumConversionRatio || 0).toFixed(1)}%</Text>
                            </View>
                          </View>
                        )}

                        {/* Export & CSV Share triggers */}
                        <TouchableOpacity
                          style={[s.miniBtn, { backgroundColor: colors.success, marginTop: 8, alignSelf: 'flex-start' }]}
                          onPress={async () => {
                            const csv = 'Metric,Value\n' + Object.entries(metrics).map(([k, v]) => `"${k}","${typeof v === 'object' ? JSON.stringify(v).replace(/"/g, '""') : v}"`).join('\n');
                            try {
                              await Share.share({
                                message: csv,
                                title: `${activeTpl?.title} Export`
                              });
                            } catch (err) {
                              Alert.alert('Error', err.message);
                            }
                          }}
                        >
                          <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>Share CSV Data</Text>
                        </TouchableOpacity>

                        {/* Delete template button */}
                        <TouchableOpacity
                          style={{ alignSelf: 'flex-start', marginTop: 12 }}
                          onPress={() => {
                            Alert.alert('Delete', 'Are you sure you want to delete this template?', [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Delete', style: 'destructive', onPress: () => deleteReportTemplate({ variables: { id: selectedTemplateId } }) }
                            ]);
                          }}
                        >
                          <Text style={{ color: colors.error, fontSize: 11, fontWeight: 'bold' }}>Delete Report Template</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })()
            ) : (
              <Text style={{ fontSize: 11, color: colors.muted, textAlign: 'center', marginVertical: 20 }}>Select a template from the list above to view dashboard widgets.</Text>
            )}

            {/* Recurring Email Schedules list */}
            <View style={{ borderTopWidth: 1, borderTopColor: colors.line, marginTop: 20, paddingTop: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.ink }}>Scheduled Emails</Text>
                <TouchableOpacity
                  style={{ padding: 4, borderRadius: 4, backgroundColor: colors.maroon }}
                  onPress={() => processScheduledReports()}
                >
                  <Text style={{ color: '#fff', fontSize: 8, fontWeight: 'bold' }}>Trigger Cron</Text>
                </TouchableOpacity>
              </View>
              {reportSchedulesQuery.loading ? (
                <ActivityIndicator color={colors.maroon} />
              ) : reportSchedulesQuery.data?.getReportSchedules?.length === 0 ? (
                <Text style={{ fontSize: 10, color: colors.muted, fontStyle: 'italic' }}>No dispatches scheduled.</Text>
              ) : (
                reportSchedulesQuery.data.getReportSchedules.map(sched => (
                  <View key={sched.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{sched.template?.title}</Text>
                      <Text style={{ fontSize: 9, color: colors.muted }}>{sched.frequency} to: {sched.recipientEmails}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert('Delete', 'Delete report schedule?', [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: () => deleteReportSchedule({ variables: { id: sched.id } }) }
                        ]);
                      }}
                    >
                      <Text style={{ color: colors.error, fontSize: 10 }}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* 6.5 PLATFORM SETTINGS TAB */}
        {activeTab === 'platform' && (
          <View style={s.card}>
            <Text style={s.cardTitle}>⚙️ Platform Config & Setup</Text>

            {/* System Settings Section */}
            <Text style={{ fontSize: 13, fontWeight: 'bold', marginVertical: 10 }}>Global Parameters</Text>
            {systemSettingsQuery.loading ? (
              <ActivityIndicator color={colors.maroon} />
            ) : (
              systemSettingsQuery.data?.getSystemSettings?.map(setting => (
                <View key={setting.id} style={{ padding: 10, backgroundColor: '#f8fafc', borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0' }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{setting.key}</Text>
                  <Text style={{ fontSize: 12, color: colors.ink, marginVertical: 4 }}>Value: {setting.value}</Text>
                  <TouchableOpacity
                    style={[s.miniBtn, { alignSelf: 'flex-start', backgroundColor: colors.maroon }]}
                    onPress={() => {
                      setEditingSetting(setting);
                      setSettingValueInput(setting.value);
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 10 }}>Edit</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}

            {/* Feature Flags Section */}
            <Text style={{ fontSize: 13, fontWeight: 'bold', marginVertical: 10 }}>Feature Toggles</Text>
            {featureFlagsQuery.loading ? (
              <ActivityIndicator color={colors.maroon} />
            ) : (
              featureFlagsQuery.data?.getFeatureFlags?.map(flag => (
                <View key={flag.id} style={{ padding: 10, backgroundColor: '#fdf4ff', borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: '#f3e8ff' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={{ fontSize: 11, fontWeight: 'bold' }}>{flag.name}</Text>
                      <Text style={{ fontSize: 9, color: colors.muted }}>{flag.description}</Text>
                    </View>
                    <Switch
                      value={flag.isEnabled}
                      onValueChange={(val) => {
                        updateFeatureFlag({
                          variables: {
                            name: flag.name,
                            isEnabled: val,
                            rules: flag.rules
                          }
                        });
                      }}
                    />
                  </View>
                  <TouchableOpacity
                    style={[s.miniBtn, { alignSelf: 'flex-start', marginTop: 6 }]}
                    onPress={() => {
                      setEditingFlag(flag);
                      setFlagRulesInput(flag.rules || '{}');
                    }}
                  >
                    <Text style={{ fontSize: 10 }}>Rules JSON</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* 6.6 SYSTEM HEALTH DIAGNOSTICS */}
        {activeTab === 'health' && (
          <View style={s.card}>
            <Text style={s.cardTitle}>📈 System Resource Telemetry</Text>

            {serverDiagnosticsQuery.loading ? (
              <ActivityIndicator color={colors.maroon} />
            ) : (() => {
              const diag = serverDiagnosticsQuery.data?.getServerDiagnostics || {};
              return (
                <View style={{ gap: 10, marginVertical: 10 }}>
                  <View style={{ padding: 10, backgroundColor: '#f0fdf4', borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, color: colors.muted }}>CPU Load average</Text>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#16a34a' }}>{diag.cpuLoad ? `${(diag.cpuLoad * 100).toFixed(1)}%` : '0%'}</Text>
                  </View>

                  <View style={{ padding: 10, backgroundColor: '#eff6ff', borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, color: colors.muted }}>Heap Memory usage</Text>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#1d4ed8' }}>{diag.processMemory ? `${(diag.processMemory / (1024 * 1024)).toFixed(1)} MB` : '0 MB'}</Text>
                    <Text style={{ fontSize: 9, color: colors.muted }}>System Total: {diag.totalMem ? `${(diag.totalMem / (1024 * 1024 * 1024)).toFixed(1)} GB` : '0 GB'}</Text>
                  </View>

                  <View style={{ padding: 10, backgroundColor: '#fffbeb', borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, color: colors.muted }}>Uptime Uptime</Text>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#d97706' }}>
                      {(() => {
                        const secs = diag.uptimeSeconds || 0;
                        const h = Math.floor(secs / 3600);
                        const m = Math.floor((secs % 3600) / 60);
                        return `${h} hours ${m} mins`;
                      })()}
                    </Text>
                    <Text style={{ fontSize: 9, color: colors.muted }}>Active connections pool: {diag.activeDbConnections || 0}</Text>
                  </View>

                  <View style={{ padding: 10, backgroundColor: '#fdf2f8', borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, color: colors.muted }}>Exceptions Logged</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#be123c' }}>{diag.errorCount || 0} errors</Text>
                  </View>

                  {/* Logs Exporter trigger */}
                  <TouchableOpacity
                    style={[s.saveBtn, { backgroundColor: colors.maroon, marginTop: 10 }]}
                    onPress={async () => {
                      try {
                        const res = await exportSystemLogsQuery.refetch();
                        const logs = res.data?.exportSystemLogs || '';
                        if (!logs) {
                          Alert.alert('Info', 'No operations logs logged.');
                          return;
                        }
                        await Share.share({
                          message: logs,
                          title: 'System Audit Logs Export'
                        });
                      } catch (err) {
                        Alert.alert('Error', err.message);
                      }
                    }}
                  >
                    <Text style={s.saveBtnText}>Share Audit Logs Dump</Text>
                  </TouchableOpacity>
                </View>
              );
            })()}
          </View>
        )}

        {/* Edit Setting Modal */}
        <Modal
          visible={editingSetting !== null}
          onRequestClose={() => setEditingSetting(null)}
          animationType="fade"
          transparent
        >
          <View style={s.modalOverlay}>
            <View style={s.modalContent}>
              <Text style={s.modalTitle}>Edit Parameter Value</Text>
              <Text style={{ fontSize: 11, fontWeight: 'bold' }}>Key: {editingSetting?.key}</Text>
              <TextInput
                value={settingValueInput}
                onChangeText={setSettingValueInput}
                style={[s.input, { marginTop: 10 }]}
              />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <TouchableOpacity style={{ flex: 1, padding: 8, borderRadius: 6, borderWidth: 1, borderColor: colors.line, alignItems: 'center' }} onPress={() => setEditingSetting(null)}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, padding: 8, borderRadius: 6, backgroundColor: colors.maroon, alignItems: 'center' }} onPress={() => {
                  updateSystemSetting({
                    variables: {
                      key: editingSetting.key,
                      value: settingValueInput
                    }
                  });
                }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Edit Feature Flag Rules Modal */}
        <Modal
          visible={editingFlag !== null}
          onRequestClose={() => setEditingFlag(null)}
          animationType="fade"
          transparent
        >
          <View style={s.modalOverlay}>
            <View style={s.modalContent}>
              <Text style={s.modalTitle}>Edit Flag Cohorts Rules</Text>
              <Text style={{ fontSize: 11, fontWeight: 'bold' }}>Flag: {editingFlag?.name}</Text>
              <TextInput
                value={flagRulesInput}
                onChangeText={setFlagRulesInput}
                style={[s.input, { height: 80, marginTop: 10 }]}
                multiline
              />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <TouchableOpacity style={{ flex: 1, padding: 8, borderRadius: 6, borderWidth: 1, borderColor: colors.line, alignItems: 'center' }} onPress={() => setEditingFlag(null)}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, padding: 8, borderRadius: 6, backgroundColor: colors.maroon, alignItems: 'center' }} onPress={() => {
                  updateFeatureFlag({
                    variables: {
                      name: editingFlag.name,
                      isEnabled: editingFlag.isEnabled,
                      rules: flagRulesInput
                    }
                  });
                }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Create Report Template Modal */}
        <Modal
          visible={isReportModalOpen}
          onRequestClose={() => setIsReportModalOpen(false)}
          animationType="slide"
        >
          <ScrollView style={{ flex: 1, padding: 20, backgroundColor: colors.paper }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.ink, marginBottom: 16 }}>Create Report Template</Text>
            
            <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 8 }}>Template Title:</Text>
            <TextInput
              value={reportTitle}
              onChangeText={setReportTitle}
              style={s.input}
              placeholder="e.g. Center Weekly Activity"
            />

            <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 8 }}>Description:</Text>
            <TextInput
              value={reportDescription}
              onChangeText={setReportDescription}
              style={s.input}
              placeholder="e.g. Activity and vital trends details"
            />

            <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 8 }}>Role Scope:</Text>
            <View style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 8, marginVertical: 6, overflow: 'hidden' }}>
              <Picker
                selectedValue={reportRole}
                onValueChange={(itemValue) => setReportRole(itemValue)}
                style={{ height: 50, width: '100%' }}
              >
                <Picker.Item label="MOTHER" value="MOTHER" />
                <Picker.Item label="PARTNER" value="PARTNER" />
                <Picker.Item label="CENTER" value="CENTER" />
                <Picker.Item label="FRANCHISE" value="FRANCHISE" />
                <Picker.Item label="STAFF" value="STAFF" />
                <Picker.Item label="PLATFORM" value="PLATFORM" />
              </Picker>
            </View>

            <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 8 }}>Default Filters JSON:</Text>
            <TextInput
              value={reportFiltersText}
              onChangeText={setReportFiltersText}
              style={[s.input, { height: 60 }]}
              multiline
            />

            <Text style={{ fontSize: 11, fontWeight: 'bold', marginTop: 8 }}>Widgets Config JSON:</Text>
            <TextInput
              value={reportWidgetsText}
              onChangeText={setReportWidgetsText}
              style={[s.input, { height: 60 }]}
              multiline
            />

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 40 }}>
              <TouchableOpacity
                onPress={() => setIsReportModalOpen(false)}
                style={{ flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.line, alignItems: 'center' }}
              >
                <Text style={{ color: colors.ink }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  createReportTemplate({
                    variables: {
                      title: reportTitle,
                      description: reportDescription,
                      role: reportRole,
                      filters: reportFiltersText,
                      widgets: reportWidgetsText
                    }
                  });
                }}
                style={{ flex: 2, padding: 12, borderRadius: 8, backgroundColor: colors.maroon, alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Create Template</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Modal>

        {/* Share Dashboard Access Modal */}
        <Modal
          visible={isShareModalOpen}
          onRequestClose={() => setIsShareModalOpen(false)}
          animationType="fade"
          transparent
        >
          <View style={s.modalOverlay}>
            <View style={s.modalContent}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>Share Dashboard Access</Text>
              <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 6 }}>Allowed Roles (comma-separated):</Text>
              <TextInput
                value={shareRolesText}
                onChangeText={setShareRolesText}
                style={s.input}
                placeholder="e.g. CENTER, FRANCHISE"
              />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <TouchableOpacity style={{ flex: 1, padding: 8, borderRadius: 6, borderWidth: 1, borderColor: colors.line, alignItems: 'center' }} onPress={() => setIsShareModalOpen(false)}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, padding: 8, borderRadius: 6, backgroundColor: colors.maroon, alignItems: 'center' }} onPress={() => {
                  shareReportTemplate({
                    variables: {
                      templateId: selectedTemplateId,
                      roles: shareRolesText
                    }
                  });
                }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Configure Recurring Dispatch Modal */}
        <Modal
          visible={isScheduleModalOpen}
          onRequestClose={() => setIsScheduleModalOpen(false)}
          animationType="fade"
          transparent
        >
          <View style={s.modalOverlay}>
            <View style={s.modalContent}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>Configure Recurring Dispatch</Text>
              
              <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 6 }}>Frequency:</Text>
              <View style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 6, overflow: 'hidden', marginBottom: 12 }}>
                <Picker
                  selectedValue={scheduleFrequency}
                  onValueChange={(itemValue) => setScheduleFrequency(itemValue)}
                  style={{ height: 40, width: '100%' }}
                >
                  <Picker.Item label="Daily" value="daily" />
                  <Picker.Item label="Weekly" value="weekly" />
                  <Picker.Item label="Monthly" value="monthly" />
                </Picker>
              </View>

              <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 6 }}>Recipient Emails (comma-separated):</Text>
              <TextInput
                value={scheduleEmails}
                onChangeText={setScheduleEmails}
                style={s.input}
                placeholder="e.g. manager@care.com"
              />

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <TouchableOpacity style={{ flex: 1, padding: 8, borderRadius: 6, borderWidth: 1, borderColor: colors.line, alignItems: 'center' }} onPress={() => setIsScheduleModalOpen(false)}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, padding: 8, borderRadius: 6, backgroundColor: colors.maroon, alignItems: 'center' }} onPress={() => {
                  createReportSchedule({
                    variables: {
                      templateId: selectedTemplateId,
                      frequency: scheduleFrequency,
                      recipientEmails: scheduleEmails
                    }
                  });
                }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Schedule</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Counseling Leads details Modal */}
        <Modal
          visible={selectedLeadId !== null}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedLeadId(null)}
        >
          <View style={s.modalOverlay}>
            <View style={[s.modalContent, { maxHeight: '80%' }]}>
              {leadDetailsQuery.loading ? (
                <ActivityIndicator color={colors.maroon} />
              ) : leadDetailsQuery.data?.getCounselingLeadDetails ? (() => {
                const lead = leadDetailsQuery.data.getCounselingLeadDetails;
                return (
                  <ScrollView contentContainerStyle={{ gap: 12 }}>
                    <Text style={s.modalTitle}>🎯 Counseling Lead Profile</Text>
                    
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.maroon }}>Name: {lead.name}</Text>
                    <Text style={{ fontSize: 11, color: colors.ink }}>Phone: {lead.phone}</Text>
                    <Text style={{ fontSize: 11, color: colors.ink }}>Email: {lead.email || '-'}</Text>
                    <Text style={{ fontSize: 11, color: colors.ink }}>Source: {lead.source}</Text>
                    
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.muted }}>Current Stage:</Text>
                    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                      {['new', 'contacted', 'scheduled', 'converted', 'lost'].map(st => (
                        <TouchableOpacity 
                          key={st} 
                          style={[s.chip, lead.status === st && s.chipActive]}
                          onPress={() => updateLeadStatus({ variables: { id: lead.id, status: st } })}
                        >
                          <Text style={[s.chipText, lead.status === st && s.chipTextActive]}>{st}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Divider />

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TouchableOpacity 
                        style={[s.miniBtn, { flex: 1 }]}
                        onPress={() => setIsScheduleCallModalOpen(true)}
                        disabled={lead.status === 'converted'}
                      >
                        <Text style={s.miniBtnText}>📅 Schedule Call</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[s.miniBtn, { flex: 1, backgroundColor: '#be123c' }]}
                        onPress={() => setIsConvertModalOpen(true)}
                        disabled={lead.status === 'converted'}
                      >
                        <Text style={s.miniBtnText}>🚀 Convert Member</Text>
                      </TouchableOpacity>
                    </View>

                    <Divider />

                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.maroonDark }}>Calls logs history:</Text>
                    {lead.calls?.map(call => (
                      <View key={call.id} style={s.noteItem}>
                        <Text style={s.noteMeta}>Call: {new Date(call.scheduledAt).toLocaleDateString()} · {call.status.toUpperCase()}</Text>
                        {call.notes && <Text style={s.noteText}>"{call.notes}"</Text>}
                        {call.status === 'scheduled' && (
                          <TouchableOpacity 
                            style={[s.miniBtn, { alignSelf: 'flex-end', marginTop: 4, paddingHorizontal: 10 }]}
                            onPress={() => {
                              setActiveCallId(call.id);
                              setIsLogCallModalOpen(true);
                            }}
                          >
                            <Text style={s.miniBtnText}>Log Call Outcome</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </ScrollView>
                );
              })() : null}
              <TouchableOpacity style={{ padding: 10, alignItems: 'center' }} onPress={() => setSelectedLeadId(null)}>
                <Text style={{ color: colors.muted, fontWeight: 'bold', fontSize: 11 }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Add Lead Modal */}
        <Modal
          visible={isAddLeadModalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsAddLeadModalOpen(false)}
        >
          <View style={s.modalOverlay}>
            <View style={s.modalContent}>
              <Text style={s.modalTitle}>Add Counseling Lead</Text>
              <TextInput style={s.modalInput} placeholder="Name *" value={leadName} onChangeText={setLeadName} />
              <TextInput style={s.modalInput} placeholder="Phone *" value={leadPhone} onChangeText={setLeadPhone} />
              <TextInput style={s.modalInput} placeholder="Email" value={leadEmail} onChangeText={setLeadEmail} />
              <TextInput style={s.modalInput} placeholder="Source (e.g. web, inquiry)" value={leadSource} onChangeText={setLeadSource} />
              
              <TouchableOpacity style={[s.submitBtn, { backgroundColor: colors.maroon }]} onPress={() => createLead({ variables: { name: leadName, email: leadEmail || null, phone: leadPhone, source: leadSource } })}>
                <Text style={s.submitBtnText}>Add Lead</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ padding: 10, alignItems: 'center' }} onPress={() => setIsAddLeadModalOpen(false)}>
                <Text style={{ color: colors.muted, fontSize: 11 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Schedule Call Modal */}
        <Modal
          visible={isScheduleCallModalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsScheduleCallModalOpen(false)}
        >
          <View style={s.modalOverlay}>
            <View style={s.modalContent}>
              <Text style={s.modalTitle}>Schedule Call</Text>
              <TextInput style={s.modalInput} placeholder="datetime (e.g. 2026-07-15 14:00)" value={callScheduledAt} onChangeText={setCallScheduledAt} />
              <TouchableOpacity style={[s.submitBtn, { backgroundColor: colors.maroon }]} onPress={() => scheduleCall({ variables: { leadId: selectedLeadId, scheduledAt: callScheduledAt } })}>
                <Text style={s.submitBtnText}>Schedule Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ padding: 10, alignItems: 'center' }} onPress={() => setIsScheduleCallModalOpen(false)}>
                <Text style={{ color: colors.muted, fontSize: 11 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Log Outcome Modal */}
        <Modal
          visible={isLogCallModalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsLogCallModalOpen(false)}
        >
          <View style={s.modalOverlay}>
            <View style={s.modalContent}>
              <Text style={s.modalTitle}>Log Call outcome</Text>
              <TextInput style={s.modalInput} placeholder="Call status (completed, no_show)" value={callStatus} onChangeText={setCallStatus} />
              <TextInput style={s.modalInput} placeholder="Notes..." value={callNotes} onChangeText={setCallNotes} />
              
              <TouchableOpacity style={[s.submitBtn, { backgroundColor: colors.maroon }]} onPress={() => logCallOutcome({ variables: { callId: activeCallId, status: callStatus, durationMinutes: 15, outcome: callOutcome, notes: callNotes } })}>
                <Text style={s.submitBtnText}>Submit Outcome</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ padding: 10, alignItems: 'center' }} onPress={() => setIsLogCallModalOpen(false)}>
                <Text style={{ color: colors.muted, fontSize: 11 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Convert Lead Modal */}
        <Modal
          visible={isConvertModalOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsConvertModalOpen(false)}
        >
          <View style={s.modalOverlay}>
            <View style={s.modalContent}>
              <Text style={s.modalTitle}>Convert Lead to Member</Text>
              <TextInput style={s.modalInput} placeholder="Center ID (e.g. center-100)" value={convertCenterId} onChangeText={setConvertCenterId} />
              
              <TouchableOpacity style={[s.submitBtn, { backgroundColor: colors.maroon }]} onPress={() => convertLeadToMember({ variables: { leadId: selectedLeadId, centerId: convertCenterId } })}>
                <Text style={s.submitBtnText}>Register User</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ padding: 10, alignItems: 'center' }} onPress={() => setIsConvertModalOpen(false)}>
                <Text style={{ color: colors.muted, fontSize: 11 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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
  closeBtnText: { fontSize: 12, color: colors.ink, fontWeight: '700' },

  // Counseling Pipeline styles
  modalInput: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 12,
    color: colors.ink,
    backgroundColor: colors.canvas,
    marginBottom: 10
  },
  submitBtn: {
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  },
  submitBtnText: {
    color: colors.paper,
    fontSize: 12,
    fontWeight: 'bold'
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  chipActive: {
    backgroundColor: colors.maroon,
    borderColor: colors.maroon
  },
  chipText: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600'
  },
  chipTextActive: {
    color: colors.paper
  }
});
