import { gql } from '@apollo/client';

export const PROGRAM_CATALOG_QUERY = gql`
  query ProgramCatalog {
    programCatalog {
      id slug name summary language journeyStage isPremium
      modules { id title description unlockDay lessons { id slug title summary lessonType durationMins releaseDay activities { id slug title instructions quotient activityType estimatedMins points } } }
    }
  }
`;

export const MY_PROGRAM_ENROLLMENTS_QUERY = gql`
  query MyProgramEnrollments { myProgramEnrollments { id status program { id slug name } activityProgress { id activityId status } } }
`;

export const ENROLL_IN_PROGRAM_MUTATION = gql`
  mutation EnrollInProgram($programId: ID!) { enrollInProgram(programId: $programId) { id status program { id name } } }
`;

export const UPDATE_ACTIVITY_PROGRESS_MUTATION = gql`
  mutation UpdateActivityProgress($activityId: ID!, $input: ActivityProgressInput!) {
    updateActivityProgress(activityId: $activityId, input: $input) {
      id
      activityId
      status
    }
  }
`;
export const CONTENT_FEED_QUERY = gql`
  query ContentFeed($language: String, $contentType: String) { contentFeed(language: $language, contentType: $contentType) { id slug contentType visibility category { slug name } coverAsset { url kind altText } translation { language title summary body } } }
`;

export const SEARCH_CONTENT_QUERY = gql`
  query SearchContent($query: String!, $language: String, $contentType: String) {
    searchContent(query: $query, language: $language, contentType: $contentType) {
      id slug contentType visibility
      category { id slug name }
      translation { id language title summary body }
    }
  }
`;

export const RECENT_CONTENT_SEARCHES_QUERY = gql`
  query RecentContentSearches { recentContentSearches { id query resultCount searchedAt } }
`;

export const SAVED_CONTENT_QUERY = gql`
  query SavedContent($kind: String, $language: String) {
    savedContent(kind: $kind, language: $language) {
      id slug contentType visibility
      category { id slug name }
      translation { id language title summary body }
    }
  }
`;

export const SET_CONTENT_BOOKMARK_MUTATION = gql`
  mutation SetContentBookmark($input: ContentBookmarkInput!) { setContentBookmark(input: $input) { contentItemId kind saved } }
`;

export const CLEAR_RECENT_CONTENT_SEARCHES_MUTATION = gql`
  mutation ClearRecentContentSearches { clearRecentContentSearches }
`;

export const GET_RECOMMENDED_CONTENT_FEED_QUERY = gql`
  query GetRecommendedContentFeed($language: String, $limit: Int) {
    recommendedContentFeed(language: $language, limit: $limit) {
      id slug contentType visibility trimester1Safe trimester2Safe trimester3Safe completed
      category { slug name }
      coverAsset { url kind altText }
      translation { language title summary body }
    }
  }
`;

export const GET_MY_LEARNING_PATHS_QUERY = gql`
  query GetMyLearningPaths($language: String) {
    myLearningPaths(language: $language) {
      id title description icon progressPercent
      items {
        id slug contentType visibility trimester1Safe trimester2Safe trimester3Safe completed
        category { slug name }
        coverAsset { url kind altText }
        translation { language title summary body }
      }
    }
  }
`;

export const GET_CONTENT_PERFORMANCE_ANALYTICS_QUERY = gql`
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

export const NOTIFICATION_CENTRE_QUERY = gql`
  query NotificationCentre {
    myNotifications { unreadCount items { id kind title body actionUrl status readAt createdAt } }
    myNotificationPreferences { id pushEnabled emailEnabled whatsappEnabled marketingAllowed quietStart quietEnd timezone }
    myReminderSchedules { id reminderType label localTime daysOfWeek channel enabled }
  }
`;
export const SET_NOTIFICATION_STATUS_MUTATION = gql`mutation SetNotificationStatus($id: ID!, $status: String!) { setNotificationStatus(id: $id, status: $status) { id status readAt } }`;
export const MARK_ALL_NOTIFICATIONS_READ_MUTATION = gql`mutation MarkAllNotificationsRead { markAllNotificationsRead }`;
export const UPDATE_NOTIFICATION_PREFERENCES_MUTATION = gql`mutation UpdateNotificationPreferences($input: NotificationPreferenceInput!) { updateNotificationPreferences(input: $input) { id pushEnabled emailEnabled whatsappEnabled marketingAllowed quietStart quietEnd timezone } }`;
export const SAVE_REMINDER_SCHEDULE_MUTATION = gql`mutation SaveReminderSchedule($input: ReminderScheduleInput!) { saveReminderSchedule(input: $input) { id reminderType label localTime daysOfWeek channel enabled } }`;
export const DELETE_REMINDER_SCHEDULE_MUTATION = gql`mutation DeleteReminderSchedule($id: ID!) { deleteReminderSchedule(id: $id) }`;

export const ME_QUERY = gql`
  query GetMe {
    me {
      id
      displayName
      emailAddress
      lmpDate
      dueDate
      currentWeek
      currentTrimester
      pregnancyDay
      language
      subscriptionStatus
      shareVitalsWithPartner
      shareReportsWithPartner
      partner {
        id
        emailAddress
        displayName
      }
      center {
        name
      }
      role {
        roleType
      }
    }
  }
`;

export const SAVE_ONBOARDING_MUTATION = gql`
  mutation SaveOnboarding($lmpDate: String, $dueDate: String, $language: String!) {
    saveOnboarding(lmpDate: $lmpDate, dueDate: $dueDate, language: $language) {
      id
      lmpDate
      dueDate
      language
      currentWeek
      currentTrimester
      pregnancyDay
    }
  }
`;

export const GET_DAILY_CONTENT_QUERY = gql`
  query GetDailyContent($dayNumber: Int!) {
    getDailyContent(dayNumber: $dayNumber) {
      id
      dayNumber
      category
      title
      body
      mediaUrl
    }
  }
`;

export const GET_CONTENT_LIBRARY_QUERY = gql`
  query GetContentLibrary($category: String!) {
    getContentLibrary(category: $category) {
      id
      dayNumber
      category
      title
      body
      mediaUrl
    }
  }
`;

export const GET_BABY_DEVELOPMENT_QUERY = gql`
  query GetBabyDevelopment($weekNumber: Int!) {
    getBabyDevelopment(weekNumber: $weekNumber) {
      id
      weekNumber
      size
      weight
      milestone
      imageUrl
    }
  }
`;

export const GET_FORUM_POSTS_QUERY = gql`
  query GetForumPosts($category: String, $groupId: ID) {
    getForumPosts(category: $category, groupId: $groupId) {
      id
      title
      content
      category
      likesCount
      isLiked
      reactionsCount
      reactionStats {
        type
        count
      }
      userReaction
      createdAt
      user {
        displayName
      }
      group {
        id
        name
      }
      comments {
        id
        content
        reported
        reportedReason
        createdAt
        user {
          displayName
        }
      }
    }
  }
`;

export const GET_FORUM_GROUPS_QUERY = gql`
  query GetForumGroups {
    getForumGroups {
      id
      name
      description
      coverUrl
      isPrivate
      createdAt
    }
  }
`;

export const CREATE_FORUM_GROUP_MUTATION = gql`
  mutation CreateForumGroup($name: String!, $description: String, $coverUrl: String, $isPrivate: Boolean!) {
    createForumGroup(name: $name, description: $description, coverUrl: $coverUrl, isPrivate: $isPrivate) {
      id
      name
      description
    }
  }
`;

export const ADD_FORUM_POST_MUTATION = gql`
  mutation AddForumPost($title: String!, $content: String!, $category: String, $groupId: ID) {
    addForumPost(title: $title, content: $content, category: $category, groupId: $groupId) {
      id
      title
      content
      category
    }
  }
`;

export const ADD_FORUM_COMMENT_MUTATION = gql`
  mutation AddForumComment($postId: ID!, $content: String!) {
    addForumComment(postId: $postId, content: $content) {
      id
      content
    }
  }
`;

export const TOGGLE_POST_LIKE_MUTATION = gql`
  mutation TogglePostLike($postId: ID!) {
    togglePostLike(postId: $postId) {
      id
      likesCount
      isLiked
    }
  }
`;

export const REACT_TO_POST_MUTATION = gql`
  mutation ReactToPost($postId: ID!, $reactionType: String!) {
    reactToPost(postId: $postId, reactionType: $reactionType) {
      id
      reactionsCount
      reactionStats {
        type
        count
      }
      userReaction
    }
  }
`;

export const REPORT_POST_MUTATION = gql`
  mutation ReportPost($postId: ID!, $reason: String) {
    reportPost(postId: $postId, reason: $reason) {
      id
      reported
      reportsCount
    }
  }
`;

export const REPORT_COMMENT_MUTATION = gql`
  mutation ReportComment($commentId: ID!, $reason: String) {
    reportComment(commentId: $commentId, reason: $reason) {
      id
      reported
      reportsCount
    }
  }
`;

export const GET_MODERATION_QUEUE_QUERY = gql`
  query GetModerationQueue {
    getModerationQueue {
      flaggedPosts {
        id
        title
        content
        category
        reportsCount
        reportedReason
        createdAt
        user {
          displayName
        }
      }
      flaggedComments {
        id
        content
        reportsCount
        reportedReason
        createdAt
        user {
          displayName
        }
      }
    }
  }
`;

export const MODERATE_POST_MUTATION = gql`
  mutation ModeratePost($postId: ID!, $action: String!) {
    moderatePost(postId: $postId, action: $action)
  }
`;

export const MODERATE_COMMENT_MUTATION = gql`
  mutation ModerateComment($commentId: ID!, $action: String!) {
    moderateComment(commentId: $commentId, action: $action)
  }
`;

export const GET_LIVE_CLASSES_QUERY = gql`
  query GetLiveClasses {
    getLiveClasses {
      id
      title
      instructor
      startTime
      durationMins
      videoCallUrl
      isBooked
    }
  }
`;

export const BOOK_LIVE_CLASS_MUTATION = gql`
  mutation BookLiveClass($classId: ID!) {
    bookLiveClass(classId: $classId) {
      id
      isBooked
    }
  }
`;

export const CREATE_STRIPE_CHECKOUT_MUTATION = gql`
  mutation CreateStripeCheckout($plan: String!) {
    createStripeCheckout(plan: $plan)
  }
`;

export const MY_DAILY_PROGRESS_QUERY = gql`
  query MyDailyProgress($dayNumber: Int!) {
    myDailyProgress(dayNumber: $dayNumber) {
      id
      dayNumber
      pqCompleted
      iqCompleted
      eqCompleted
      sqCompleted
      notes
      completedAt
    }
  }
`;

export const MY_TIMELINE_OVERVIEW_QUERY = gql`
  query MyTimelineOverview($dayNumber: Int) {
    myTimelineOverview(dayNumber: $dayNumber) {
      currentDay
      currentWeek
      currentTrimester
      selectedDay
      selectedWeek
      selectedMonth
      selectedTrimester
      weekStartDay
      weekEndDay
      isLocked
      unlockDate
      completedCount
      progressPercent
      days {
        dayNumber
        locked
        completed
        pqCompleted
        iqCompleted
        eqCompleted
        sqCompleted
      }
      selectedProgress {
        id
        dayNumber
        pqCompleted
        iqCompleted
        eqCompleted
        sqCompleted
        pqDurationMins
        iqDurationMins
        eqDurationMins
        sqDurationMins
        pqEvidence
        iqEvidence
        eqEvidence
        sqEvidence
        pqNotes
        iqNotes
        eqNotes
        sqNotes
        notes
        completedAt
      }
    }
  }
`;

export const MY_DAILY_PROGRESS_RANGE_QUERY = gql`
  query MyDailyProgressRange($startDay: Int!, $endDay: Int!) {
    myDailyProgressRange(startDay: $startDay, endDay: $endDay) {
      id
      dayNumber
      pqCompleted
      iqCompleted
      eqCompleted
      sqCompleted
      pqDurationMins
      iqDurationMins
      eqDurationMins
      sqDurationMins
      pqEvidence
      iqEvidence
      eqEvidence
      sqEvidence
      pqNotes
      iqNotes
      eqNotes
      sqNotes
      notes
      completedAt
    }
  }
`;

export const TOGGLE_DAILY_ACTIVITY_MUTATION = gql`
  mutation ToggleDailyActivity($dayNumber: Int!, $quotient: String!) {
    toggleDailyActivity(dayNumber: $dayNumber, quotient: $quotient) {
      id
      dayNumber
      pqCompleted
      iqCompleted
      eqCompleted
      sqCompleted
      notes
      completedAt
    }
  }
`;

export const SAVE_DAILY_ACTIVITY_DETAILS_MUTATION = gql`
  mutation SaveDailyActivityDetails($input: DailyActivityDetailsInput!) {
    saveDailyActivityDetails(input: $input) {
      id
      dayNumber
      pqCompleted
      iqCompleted
      eqCompleted
      sqCompleted
      pqDurationMins
      iqDurationMins
      eqDurationMins
      sqDurationMins
      pqEvidence
      iqEvidence
      eqEvidence
      sqEvidence
      pqNotes
      iqNotes
      eqNotes
      sqNotes
      notes
      completedAt
    }
  }
`;

export const GET_DAILY_QUIZ_QUERY = gql`
  query GetDailyQuiz($dayNumber: Int!) {
    getDailyQuiz(dayNumber: $dayNumber) {
      id
      dayNumber
      questionText
      options
      correctOptionIndex
      explanation
    }
  }
`;

export const GET_MY_QUIZ_ATTEMPT_QUERY = gql`
  query GetMyQuizAttempt($dayNumber: Int!) {
    getMyQuizAttempt(dayNumber: $dayNumber) {
      id
      userId
      dayNumber
      selectedOptionIndex
      isCorrect
      attemptedAt
    }
  }
`;

export const SUBMIT_QUIZ_ANSWER_MUTATION = gql`
  mutation SubmitQuizAnswer($dayNumber: Int!, $selectedOptionIndex: Int!) {
    submitQuizAnswer(dayNumber: $dayNumber, selectedOptionIndex: $selectedOptionIndex) {
      id
      userId
      dayNumber
      selectedOptionIndex
      isCorrect
      attemptedAt
    }
  }
`;

export const GET_PARTNER_ACTIVITY_QUERY = gql`
  query GetPartnerActivity($dayNumber: Int!) {
    getPartnerActivity(dayNumber: $dayNumber) {
      id
      dayNumber
      title
      description
    }
  }
`;

export const GET_MY_PARTNER_ACTIVITY_LOG_QUERY = gql`
  query GetMyPartnerActivityLog($dayNumber: Int!) {
    getMyPartnerActivityLog(dayNumber: $dayNumber) {
      id
      userId
      dayNumber
      partnerAcknowledged
      completedAt
    }
  }
`;

export const ACKNOWLEDGE_PARTNER_ACTIVITY_MUTATION = gql`
  mutation AcknowledgePartnerActivity($dayNumber: Int!) {
    acknowledgePartnerActivity(dayNumber: $dayNumber) {
      id
      userId
      dayNumber
      partnerAcknowledged
      completedAt
    }
  }
`;

export const GET_SENSORY_ACTIVITY_QUERY = gql`
  query GetSensoryActivity($dayNumber: Int!) {
    getSensoryActivity(dayNumber: $dayNumber) {
      id
      dayNumber
      senseType
      title
      description
    }
  }
`;

export const GET_MY_SENSORY_ACTIVITY_LOG_QUERY = gql`
  query GetMySensoryActivityLog($dayNumber: Int!) {
    getMySensoryActivityLog(dayNumber: $dayNumber) {
      id
      userId
      dayNumber
      completed
      completedAt
    }
  }
`;

export const TOGGLE_SENSORY_ACTIVITY_MUTATION = gql`
  mutation ToggleSensoryActivity($dayNumber: Int!) {
    toggleSensoryActivity(dayNumber: $dayNumber) {
      id
      userId
      dayNumber
      completed
      completedAt
    }
  }
`;

export const GET_CONTENT_VIEW_HISTORY_QUERY = gql`
  query GetContentViewHistory($contentItemId: ID, $dailyContentId: ID) {
    getContentViewHistory(contentItemId: $contentItemId, dailyContentId: $dailyContentId) {
      id
      contentItemId
      dailyContentId
      lastPositionSeconds
      progressPercent
      completed
      viewedAt
    }
  }
`;

export const RECORD_CONTENT_VIEW_MUTATION = gql`
  mutation RecordContentView($input: ContentViewInput!) {
    recordContentView(input: $input) {
      id
      contentItemId
      dailyContentId
      lastPositionSeconds
      progressPercent
      completed
      viewedAt
    }
  }
`;

export const GET_MY_PLAYLISTS_QUERY = gql`
  query GetMyPlaylists {
    getMyPlaylists {
      id
      userId
      name
      description
      items {
        id
        sortOrder
        contentItem {
          id
          slug
          contentType
          translation {
            title
            body
          }
        }
      }
    }
  }
`;

export const CREATE_PLAYLIST_MUTATION = gql`
  mutation CreatePlaylist($name: String!, $description: String) {
    createPlaylist(name: $name, description: $description) {
      id
      userId
      name
      description
    }
  }
`;

export const ADD_PLAYLIST_ITEM_MUTATION = gql`
  mutation AddPlaylistItem($playlistId: ID!, $contentItemId: ID!) {
    addPlaylistItem(playlistId: $playlistId, contentItemId: $contentItemId) {
      id
      playlistId
      sortOrder
    }
  }
`;

export const REMOVE_PLAYLIST_ITEM_MUTATION = gql`
  mutation RemovePlaylistItem($playlistId: ID!, $contentItemId: ID!) {
    removePlaylistItem(playlistId: $playlistId, contentItemId: $contentItemId)
  }
`;

export const GET_DIET_PREFERENCE_QUERY = gql`
  query GetDietPreference {
    getDietPreference {
      userId
      dietType
      allergens
      notes
    }
  }
`;

export const GET_MY_MEAL_PLANS_QUERY = gql`
  query GetMyMealPlans($dayNumber: Int!) {
    getMyMealPlans(dayNumber: $dayNumber) {
      id
      userId
      dayNumber
      mealType
      contentItemId
      customMealName
      completed
    }
  }
`;

export const GET_SHOPPING_LIST_QUERY = gql`
  query GetShoppingList {
    getShoppingList {
      id
      userId
      ingredientName
      quantity
      purchased
    }
  }
`;

export const UPDATE_DIET_PREFERENCE_MUTATION = gql`
  mutation UpdateDietPreference($input: UpdateDietPreferenceInput!) {
    updateDietPreference(input: $input) {
      userId
      dietType
      allergens
      notes
    }
  }
`;

export const TOGGLE_MEAL_PLAN_MUTATION = gql`
  mutation ToggleMealPlan($mealPlanId: ID!, $completed: Boolean!) {
    toggleMealPlan(mealPlanId: $mealPlanId, completed: $completed) {
      id
      completed
    }
  }
`;

export const ADD_SHOPPING_ITEM_MUTATION = gql`
  mutation AddShoppingListItem($input: AddShoppingItemInput!) {
    addShoppingListItem(input: $input) {
      id
      ingredientName
      quantity
      purchased
    }
  }
`;

export const TOGGLE_SHOPPING_ITEM_MUTATION = gql`
  mutation ToggleShoppingListItem($itemId: ID!, $purchased: Boolean!) {
    toggleShoppingListItem(itemId: $itemId, purchased: $purchased) {
      id
      purchased
    }
  }
`;

export const CLEAR_PURCHASED_SHOPPING_LIST_MUTATION = gql`
  mutation ClearPurchasedShoppingList {
    clearPurchasedShoppingList
  }
`;

export const GET_LIVE_CLASSES_DETAILED_QUERY = gql`
  query GetLiveClassesDetailed {
    getLiveClassesDetailed {
      id
      titleEn
      titleHi
      title
      instructor
      startTime
      durationMins
      videoCallUrl
      replayUrl
      isBooked
      booked
      attended
      feedbackScore
      feedbackNotes
      centerId
      seriesTitle
      batchName
    }
  }
`;

export const BOOK_LIVE_CLASS_DETAILED_MUTATION = gql`
  mutation BookLiveClassDetailed($liveClassId: ID!) {
    bookLiveClassDetailed(liveClassId: $liveClassId) {
      userId
      liveClassId
      attended
    }
  }
`;

export const SUBMIT_LIVE_CLASS_FEEDBACK_MUTATION = gql`
  mutation SubmitLiveClassFeedback($input: SubmitLiveClassFeedbackInput!) {
    submitLiveClassFeedback(input: $input) {
      userId
      liveClassId
      attended
      feedbackScore
      feedbackNotes
    }
  }
`;

export const GET_PRESCRIPTION_SUMMARY_QUERY = gql`
  query GetPrescriptionSummary {
    getPrescriptionSummary {
      id
      scheduleSlot
      videoCallUrl
      status
      caseNotes
      followUpTasks
      expert {
        id
        displayName
      }
    }
  }
`;

export const SUBMIT_CASE_NOTES_MUTATION = gql`
  mutation SubmitCaseNotes($input: SubmitCaseNotesInput!) {
    submitCaseNotes(input: $input) {
      id
      caseNotes
      followUpTasks
      prescriptions
      documents
      followUpDate
    }
  }
`;

export const SUBMIT_INTAKE_FORM_MUTATION = gql`
  mutation SubmitIntakeForm($bookingId: ID!, $symptoms: [String!]!, $gestationalWeeks: Int!, $concerns: String!, $medicalHistory: String) {
    submitIntakeForm(bookingId: $bookingId, symptoms: $symptoms, gestationalWeeks: $gestationalWeeks, concerns: $concerns, medicalHistory: $medicalHistory) {
      id
      intakeForm
    }
  }
`;

export const GET_WELLNESS_DATA_QUERY = gql`
  query GetWellnessData {
    getMyVitals {
      id
      weight
      systolicBp
      diastolicBp
      kickCount
      bloodSugar
      symptoms
      loggedAt
    }
    getAppointments {
      id
      title
      doctorName
      appointmentDate
      notes
    }
    getMedicineReminders {
      id
      name
      dosage
      timeOfDay
      active
    }
    getHospitalBagItems {
      id
      itemName
      packed
      category
    }
  }
`;

export const LOG_VITALS_MUTATION = gql`
  mutation LogVitalsAndSymptoms($input: LogVitalsAndSymptomsInput!) {
    logVitalsAndSymptoms(input: $input) {
      id
      weight
      loggedAt
    }
  }
`;

export const ADD_APPOINTMENT_MUTATION = gql`
  mutation AddAppointment($input: AddAppointmentInput!) {
    addAppointment(input: $input) {
      id
      title
      appointmentDate
    }
  }
`;

export const DELETE_APPOINTMENT_MUTATION = gql`
  mutation DeleteAppointment($id: ID!) {
    deleteAppointment(id: $id)
  }
`;

export const ADD_MEDICINE_MUTATION = gql`
  mutation AddMedicineReminder($input: AddMedicineInput!) {
    addMedicineReminder(input: $input) {
      id
      name
      timeOfDay
    }
  }
`;

export const TOGGLE_MEDICINE_MUTATION = gql`
  mutation ToggleMedicineReminder($id: ID!, $active: Boolean!) {
    toggleMedicineReminder(id: $id, active: $active) {
      id
      active
    }
  }
`;

export const DELETE_MEDICINE_MUTATION = gql`
  mutation DeleteMedicineReminder($id: ID!) {
    deleteMedicineReminder(id: $id)
  }
`;

export const ADD_BAG_ITEM_MUTATION = gql`
  mutation AddHospitalBagItem($input: AddHospitalBagItemInput!) {
    addHospitalBagItem(input: $input) {
      id
      itemName
      category
    }
  }
`;

export const TOGGLE_BAG_ITEM_MUTATION = gql`
  mutation ToggleHospitalBagItem($id: ID!, $packed: Boolean!) {
    toggleHospitalBagItem(id: $id, packed: $packed) {
      id
      packed
    }
  }
`;

export const CLEAR_BAG_ITEMS_MUTATION = gql`
  mutation ClearPackedHospitalBagItems {
    clearPackedHospitalBagItems
  }
`;

export const GET_SUPPORT_TICKETS_QUERY = gql`
  query GetSupportTickets {
    getSupportTickets {
      id
      subject
      description
      status
      priority
      category
      satisfactionScore
      satisfactionFeedback
      whatsappHandoffRequested
      slaBreached
      slaExpiresAt
      createdAt
      messages {
        id
        senderType
        message
        createdAt
        sender {
          displayName
        }
      }
    }
  }
`;

export const GET_STAFF_SUPPORT_TICKETS_QUERY = gql`
  query GetStaffSupportTickets($status: String) {
    getStaffSupportTickets(status: $status) {
      id
      subject
      description
      status
      priority
      category
      satisfactionScore
      satisfactionFeedback
      whatsappHandoffRequested
      slaBreached
      slaExpiresAt
      createdAt
      user {
        displayName
      }
      messages {
        id
        senderType
        message
        createdAt
        sender {
          displayName
        }
      }
    }
  }
`;

export const GET_CANNED_REPLIES_QUERY = gql`
  query GetCannedReplies {
    getCannedReplies {
      id
      title
      content
      category
    }
  }
`;

export const GET_SUPPORT_DASHBOARD_METRICS_QUERY = gql`
  query GetSupportDashboardMetrics {
    getSupportDashboardMetrics {
      totalTicketsCount
      resolvedTicketsCount
      pendingTicketsCount
      slaBreachedCount
      averageSatisfactionScore
      satisfactionDistribution {
        score
        count
      }
    }
  }
`;

export const CREATE_SUPPORT_TICKET = gql`
  mutation CreateSupportTicket($input: CreateSupportTicketInput!) {
    createSupportTicket(input: $input) {
      id
      subject
      createdAt
    }
  }
`;

export const ADD_SUPPORT_MESSAGE = gql`
  mutation AddSupportTicketMessage($input: AddSupportTicketMessageInput!) {
    addSupportTicketMessage(input: $input) {
      id
      message
      createdAt
    }
  }
`;

export const CLOSE_SUPPORT_TICKET = gql`
  mutation CloseSupportTicket($input: CloseSupportTicketInput!) {
    closeSupportTicket(input: $input) {
      id
      status
      satisfactionScore
    }
  }
`;

export const REQUEST_WHATSAPP_HANDOFF = gql`
  mutation RequestWhatsappHandoff($id: ID!) {
    requestWhatsappHandoff(id: $id) {
      id
      whatsappHandoffRequested
    }
  }
`;

export const CREATE_CANNED_REPLY_MUTATION = gql`
  mutation CreateCannedReply($title: String!, $content: String!, $category: String!) {
    createCannedReply(title: $title, content: $content, category: $category) {
      id
      title
      content
    }
  }
`;

export const ADD_STAFF_SUPPORT_MESSAGE_MUTATION = gql`
  mutation AddStaffSupportMessage($ticketId: ID!, $message: String!) {
    addStaffSupportMessage(ticketId: $ticketId, message: $message) {
      id
      message
      createdAt
      senderType
    }
  }
`;

export const UPDATE_SUPPORT_TICKET_STATUS_MUTATION = gql`
  mutation UpdateSupportTicketStatus($ticketId: ID!, $status: String!) {
    updateSupportTicketStatus(ticketId: $ticketId, status: $status) {
      id
      status
    }
  }
`;

export const CHECK_SLA_ESCALATIONS_MUTATION = gql`
  mutation CheckSlaEscalations {
    checkSlaEscalations
  }
`;

export const GET_STORE_DATA_QUERY = gql`
  query GetStoreData {
    getProducts {
      id
      title
      description
      price
      imageUrl
      inventoryCount
      category
    }
    getCart {
      id
      productId
      quantity
      product {
        id
        title
        price
      }
    }
    getAddresses {
      id
      fullName
      addressLine1
      addressLine2
      city
      state
      postalCode
      phone
    }
    getMyOrders {
      id
      totalAmount
      status
      createdAt
      address {
        fullName
        addressLine1
        city
      }
      items {
        id
        quantity
        price
        product {
          title
        }
      }
    }
  }
`;

export const ADD_TO_CART_MUTATION = gql`
  mutation AddToCart($input: CartItemInput!) {
    addToCart(input: $input) {
      id
      quantity
    }
  }
`;

export const UPDATE_CART_QUANTITY_MUTATION = gql`
  mutation UpdateCartQuantity($input: CartItemInput!) {
    updateCartQuantity(input: $input) {
      id
      quantity
    }
  }
`;

export const REMOVE_FROM_CART_MUTATION = gql`
  mutation RemoveFromCart($productId: ID!) {
    removeFromCart(productId: $productId)
  }
`;

export const ADD_ADDRESS_MUTATION = gql`
  mutation AddAddress($input: AddAddressInput!) {
    addAddress(input: $input) {
      id
      fullName
    }
  }
`;

export const DELETE_ADDRESS_MUTATION = gql`
  mutation DeleteAddress($id: ID!) {
    deleteAddress(id: $id)
  }
`;

export const PLACE_ORDER_MUTATION = gql`
  mutation PlaceOrder($addressId: ID!) {
    placeOrder(addressId: $addressId) {
      id
      status
    }
  }
`;

export const GET_PARTNER_DASHBOARD_QUERY = gql`
  query GetPartnerDashboard {
    getPartnerDashboard {
      motherName
      pregnancyDay
      currentWeek
      currentTrimester
      babySize
      babyMilestone
      progressPercent
      dailyQuizAttempted
      partnerActivityCompleted
      partnerActivityTitle
      partnerActivityDescription
    }
    # Query sharing preferences via partner's linked mother
    me {
      partner {
        shareVitalsWithPartner
        shareReportsWithPartner
      }
    }
    getMyVitals {
      id
      weight
      systolicBp
      diastolicBp
      kickCount
      bloodSugar
      loggedAt
      symptoms
    }
  }
`;

export const LINK_PARTNER_MUTATION = gql`
  mutation LinkPartner($partnerEmail: String!) {
    linkPartner(partnerEmail: $partnerEmail) {
      id
      partner {
        id
        emailAddress
        displayName
      }
    }
  }
`;

export const SEND_ENCOURAGEMENT_MUTATION = gql`
  mutation SendEncouragement($message: String!) {
    sendEncouragement(message: $message)
  }
`;

export const UPDATE_PARTNER_SHARING_MUTATION = gql`
  mutation UpdatePartnerSharing($shareVitals: Boolean!, $shareReports: Boolean!) {
    updatePartnerSharing(shareVitals: $shareVitals, shareReports: $shareReports) {
      id
      shareVitalsWithPartner
      shareReportsWithPartner
    }
  }
`;

export const GET_COUNSELING_LEADS_QUERY = gql`
  query GetCounselingLeads($status: String, $assignedToMe: Boolean) {
    getCounselingLeads(status: $status, assignedToMe: $assignedToMe) {
      id
      name
      email
      phone
      status
      source
      assignedTo
      convertedUserId
      nextFollowUp
      convertedAt
      createdAt
      counselor {
        displayName
      }
      convertedUser {
        displayName
      }
    }
  }
`;

export const GET_COUNSELING_LEAD_DETAILS_QUERY = gql`
  query GetCounselingLeadDetails($id: ID!) {
    getCounselingLeadDetails(id: $id) {
      id
      name
      email
      phone
      status
      source
      assignedTo
      convertedUserId
      nextFollowUp
      convertedAt
      createdAt
      counselor {
        displayName
      }
      convertedUser {
        displayName
      }
      calls {
        id
        leadId
        scheduledAt
        status
        durationMinutes
        outcome
        notes
        counselorId
        createdAt
        counselor {
          displayName
        }
      }
    }
  }
`;

export const GET_COUNSELING_DASHBOARD_STATS_QUERY = gql`
  query GetCounselingDashboardStats {
    getCounselingDashboardStats {
      totalLeadsCount
      newLeadsCount
      contactedLeadsCount
      scheduledLeadsCount
      convertedLeadsCount
      lostLeadsCount
      conversionRate
    }
  }
`;

export const CREATE_COUNSELING_LEAD_MUTATION = gql`
  mutation CreateCounselingLead($name: String!, $email: String, $phone: String!, $source: String) {
    createCounselingLead(name: $name, email: $email, phone: $phone, source: $source) {
      id
      name
      status
    }
  }
`;

export const UPDATE_COUNSELING_LEAD_STATUS_MUTATION = gql`
  mutation UpdateCounselingLeadStatus($id: ID!, $status: String!) {
    updateCounselingLeadStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const ASSIGN_COUNSELING_LEAD_MUTATION = gql`
  mutation AssignCounselingLead($id: ID!, $counselorId: ID!) {
    assignCounselingLead(id: $id, counselorId: $counselorId) {
      id
      assignedTo
    }
  }
`;

export const SCHEDULE_COUNSELING_CALL_MUTATION = gql`
  mutation ScheduleCounselingCall($leadId: ID!, $scheduledAt: String!) {
    scheduleCounselingCall(leadId: $leadId, scheduledAt: $scheduledAt) {
      id
      scheduledAt
      status
    }
  }
`;

export const LOG_COUNSELING_CALL_OUTCOME_MUTATION = gql`
  mutation LogCounselingCallOutcome($callId: ID!, $status: String!, $durationMinutes: Int, $outcome: String, $notes: String) {
    logCounselingCallOutcome(callId: $callId, status: $status, durationMinutes: $durationMinutes, outcome: $outcome, notes: $notes) {
      id
      status
      outcome
    }
  }
`;

export const CONVERT_LEAD_TO_MEMBER_MUTATION = gql`
  mutation ConvertLeadToMember($leadId: ID!, $centerId: ID!) {
    convertLeadToMember(leadId: $leadId, centerId: $centerId) {
      id
      displayName
    }
  }
`;

export const GET_NOTIFICATION_DELIVERIES_REPORT_QUERY = gql`
  query GetNotificationDeliveriesReport($limit: Int) {
    getNotificationDeliveriesReport(limit: $limit) {
      id
      notificationId
      channel
      status
      attempts
      providerMessageId
      lastAttemptAt
      createdAt
      notification {
        id
        title
        body
      }
    }
  }
`;

export const GET_CAMPAIGN_PERFORMANCE_QUERY = gql`
  query GetCampaignPerformance($notificationId: ID!) {
    getCampaignPerformance(notificationId: $notificationId) {
      totalTargeted
      deliveredCount
      failedCount
      pendingCount
      channelBreakdown {
        channel
        sent
        delivered
        failed
      }
    }
  }
`;

export const CREATE_NOTIFICATION_CAMPAIGN_MUTATION = gql`
  mutation CreateNotificationCampaign($title: String!, $body: String!, $channels: [String!]!, $targetUserIds: [ID!], $centerId: ID, $scheduledAt: String) {
    createNotificationCampaign(title: $title, body: $body, channels: $channels, targetUserIds: $targetUserIds, centerId: $centerId, scheduledAt: $scheduledAt) {
      id
      title
      body
    }
  }
`;

export const TRIGGER_CAMPAIGN_DISPATCHED_MUTATION = gql`
  mutation TriggerCampaignDispatched($notificationId: ID!) {
    triggerCampaignDispatched(notificationId: $notificationId)
  }
`;

export const GET_REMINDER_RULES_QUERY = gql`
  query GetReminderRules {
    getReminderRules {
      id
      name
      ruleType
      triggerCondition
      templateTitle
      templateBody
      channels
      enabled
      createdAt
    }
  }
`;

export const CREATE_REMINDER_RULE_MUTATION = gql`
  mutation CreateReminderRule($name: String!, $ruleType: String!, $triggerConditionJson: String!, $templateTitle: String!, $templateBody: String!, $channels: [String!]!, $enabled: Boolean) {
    createReminderRule(name: $name, ruleType: $ruleType, triggerConditionJson: $triggerConditionJson, templateTitle: $templateTitle, templateBody: $templateBody, channels: $channels, enabled: $enabled) {
      id
      name
      enabled
    }
  }
`;

export const UPDATE_REMINDER_RULE_MUTATION = gql`
  mutation UpdateReminderRule($id: ID!, $name: String, $ruleType: String, $triggerConditionJson: String, $templateTitle: String, $templateBody: String, $channels: [String!], $enabled: Boolean) {
    updateReminderRule(id: $id, name: $name, ruleType: $ruleType, triggerConditionJson: $triggerConditionJson, templateTitle: $templateTitle, templateBody: $templateBody, channels: $channels, enabled: $enabled) {
      id
      name
      enabled
    }
  }
`;

export const DELETE_REMINDER_RULE_MUTATION = gql`
  mutation DeleteReminderRule($id: ID!) {
    deleteReminderRule(id: $id)
  }
`;

export const RUN_REMINDER_RULES_ENGINE_MUTATION = gql`
  mutation RunReminderRulesEngine {
    runReminderRulesEngine {
      success
      rulesProcessed
      notificationsDispatched
    }
  }
`;

export const GET_SPECIAL_EVENTS_QUERY = gql`
  query GetSpecialEvents($eventType: String) {
    getSpecialEvents(eventType: $eventType) {
      id
      title
      description
      eventType
      eventDate
      durationMinutes
      speakerName
      location
      maxRegistrations
      replayUrl
      createdAt
    }
  }
`;

export const GET_EVENT_ATTENDEES_QUERY = gql`
  query GetEventAttendees($eventId: ID!) {
    getEventAttendees(eventId: $eventId) {
      id
      eventId
      userId
      registeredAt
      checkedIn
      checkedInAt
      feedbackRating
      feedbackText
      user {
        id
        displayName
        emailAddress
        mobileNo
      }
    }
  }
`;

export const CREATE_SPECIAL_EVENT_MUTATION = gql`
  mutation CreateSpecialEvent($title: String!, $description: String!, $eventType: String!, $eventDate: String!, $durationMinutes: Int!, $speakerName: String, $location: String, $maxRegistrations: Int) {
    createSpecialEvent(title: $title, description: $description, eventType: $eventType, eventDate: $eventDate, durationMinutes: $durationMinutes, speakerName: $speakerName, location: $location, maxRegistrations: $maxRegistrations) {
      id
      title
    }
  }
`;

export const UPDATE_SPECIAL_EVENT_MUTATION = gql`
  mutation UpdateSpecialEvent($id: ID!, $title: String, $description: String, $eventType: String, $eventDate: String, $durationMinutes: Int, $speakerName: String, $location: String, $maxRegistrations: Int, $replayUrl: String) {
    updateSpecialEvent(id: $id, title: $title, description: $description, eventType: $eventType, eventDate: $eventDate, durationMinutes: $durationMinutes, speakerName: $speakerName, location: $location, maxRegistrations: $maxRegistrations, replayUrl: $replayUrl) {
      id
      title
      replayUrl
    }
  }
`;

export const DELETE_SPECIAL_EVENT_MUTATION = gql`
  mutation DeleteSpecialEvent($id: ID!) {
    deleteSpecialEvent(id: $id)
  }
`;

export const REGISTER_FOR_EVENT_MUTATION = gql`
  mutation RegisterForEvent($eventId: ID!) {
    registerForEvent(eventId: $eventId) {
      id
      eventId
      registeredAt
    }
  }
`;

export const CHECK_IN_TO_EVENT_MUTATION = gql`
  mutation CheckInToEvent($registrationId: ID!) {
    checkInToEvent(registrationId: $registrationId) {
      id
      checkedIn
      checkedInAt
    }
  }
`;

export const SUBMIT_EVENT_FEEDBACK_MUTATION = gql`
  mutation SubmitEventFeedback($eventId: ID!, $rating: Int!, $feedbackText: String) {
    submitEventFeedback(eventId: $eventId, rating: $rating, feedbackText: $feedbackText) {
      id
      feedbackRating
      feedbackText
    }
  }
`;

export const SUBMIT_REFERRAL_MUTATION = gql`
  mutation SubmitReferral($refereeName: String!, $refereeEmail: String, $refereePhone: String!) {
    submitReferral(refereeName: $refereeName, refereeEmail: $refereeEmail, refereePhone: $refereePhone) {
      id
      refereeName
      status
    }
  }
`;

export const GET_MY_REFERRALS_QUERY = gql`
  query GetMyReferrals {
    getMyReferrals {
      id
      refereeName
      refereeEmail
      refereePhone
      status
      rewardPoints
      createdAt
    }
  }
`;

export const GET_REFERRALS_REPORT_QUERY = gql`
  query GetReferralsReport {
    getReferralsReport {
      id
      refereeName
      refereeEmail
      refereePhone
      status
      rewardPoints
      createdAt
      referrer {
        id
        displayName
        emailAddress
        mobileNo
      }
    }
  }
`;

export const CONVERT_REFERRAL_MUTATION = gql`
  mutation ConvertReferral($referralId: ID!, $pointsAwarded: Int) {
    convertReferral(referralId: $referralId, pointsAwarded: $pointsAwarded) {
      id
      status
      rewardPoints
    }
  }
`;

export const SUBMIT_TESTIMONIAL_MUTATION = gql`
  mutation SubmitTestimonial($content: String!, $rating: Int!) {
    submitTestimonial(content: $content, rating: $rating) {
      id
      content
      rating
      status
    }
  }
`;

export const GET_TESTIMONIALS_QUERY = gql`
  query GetTestimonials($statusFilter: String) {
    getTestimonials(statusFilter: $statusFilter) {
      id
      content
      rating
      status
      createdAt
      user {
        id
        displayName
        emailAddress
      }
    }
  }
`;

export const MODERATE_TESTIMONIAL_MUTATION = gql`
  mutation ModerateTestimonial($id: ID!, $status: String!) {
    moderateTestimonial(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const APPLY_FOR_AMBASSADOR_MUTATION = gql`
  mutation ApplyForAmbassador($socialLinksJson: String!, $reason: String!) {
    applyForAmbassador(socialLinksJson: $socialLinksJson, reason: $reason) {
      id
      status
    }
  }
`;

export const GET_AMBASSADOR_APPLICATIONS_QUERY = gql`
  query GetAmbassadorApplications {
    getAmbassadorApplications {
      id
      reason
      status
      createdAt
      socialLinks
      user {
        id
        displayName
        emailAddress
        mobileNo
      }
    }
  }
`;

export const MODERATE_AMBASSADOR_APPLICATION_MUTATION = gql`
  mutation ModerateAmbassadorApplication($id: ID!, $status: String!) {
    moderateAmbassadorApplication(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct($title: String!, $description: String, $price: Float!, $imageUrl: String, $inventoryCount: Int!, $category: String!, $centerId: ID) {
    createProduct(title: $title, description: $description, price: $price, imageUrl: $imageUrl, inventoryCount: $inventoryCount, category: $category, centerId: $centerId) {
      id
      title
      price
      inventoryCount
      category
      centerId
    }
  }
`;

export const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct($id: ID!, $title: String, $description: String, $price: Float, $imageUrl: String, $inventoryCount: Int, $category: String, $centerId: ID) {
    updateProduct(id: $id, title: $title, description: $description, price: $price, imageUrl: $imageUrl, inventoryCount: $inventoryCount, category: $category, centerId: $centerId) {
      id
      title
      price
      inventoryCount
      category
      centerId
    }
  }
`;

export const DELETE_PRODUCT_MUTATION = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

export const GET_ADMIN_INVOICES_QUERY = gql`
  query GetAdminInvoices {
    getAdminInvoices {
      id
      amount
      status
      invoiceNumber
      billingDate
      dueDate
      user {
        displayName
      }
      subscription {
        id
        status
        plan {
          name
        }
      }
      payment {
        status
      }
    }
  }
`;

export const GET_COUPONS_QUERY = gql`
  query GetCoupons {
    getCoupons {
      id
      code
      discountPercent
      discountAmount
      validFrom
      validUntil
      maxRedemptions
      redemptionsCount
    }
  }
`;

export const CREATE_SUBSCRIPTION_PLAN_MUTATION = gql`
  mutation CreateSubscriptionPlan($name: String!, $description: String, $price: Float!, $billingPeriod: String!, $trialDays: Int!, $features: [String!]!) {
    createSubscriptionPlan(name: $name, description: $description, price: $price, billingPeriod: $billingPeriod, trialDays: $trialDays, features: $features) {
      id
      name
      price
      billingPeriod
      trialDays
      features
    }
  }
`;

export const UPDATE_SUBSCRIPTION_PLAN_MUTATION = gql`
  mutation UpdateSubscriptionPlan($id: ID!, $name: String, $description: String, $price: Float, $billingPeriod: String, $trialDays: Int, $features: [String!]) {
    updateSubscriptionPlan(id: $id, name: $name, description: $description, price: $price, billingPeriod: $billingPeriod, trialDays: $trialDays, features: $features) {
      id
      name
      price
    }
  }
`;

export const DELETE_SUBSCRIPTION_PLAN_MUTATION = gql`
  mutation DeleteSubscriptionPlan($id: ID!) {
    deleteSubscriptionPlan(id: $id)
  }
`;

export const CREATE_COUPON_MUTATION = gql`
  mutation CreateCoupon($code: String!, $discountPercent: Int, $discountAmount: Float, $validFrom: String!, $validUntil: String!, $maxRedemptions: Int) {
    createCoupon(code: $code, discountPercent: $discountPercent, discountAmount: $discountAmount, validFrom: $validFrom, validUntil: $validUntil, maxRedemptions: $maxRedemptions) {
      id
      code
    }
  }
`;

export const DELETE_COUPON_MUTATION = gql`
  mutation DeleteCoupon($id: ID!) {
    deleteCoupon(id: $id)
  }
`;

export const SIMULATE_RENEWALS_MUTATION = gql`
  mutation SimulateRenewals {
    simulateRenewals {
      id
      status
      currentPeriodEndDate
    }
  }
`;

export const GET_PLANS_QUERY = gql`
  query GetPlans {
    getPlans {
      id
      name
      description
      price
      billingPeriod
      trialDays
      features
    }
  }
`;

export const GET_FINANCIAL_REPORT_QUERY = gql`
  query GetFinancialReport($startDate: String, $endDate: String, $centerId: ID) {
    getFinancialReport(startDate: $startDate, endDate: $endDate, centerId: $centerId) {
      totalRevenue
      totalRefunds
      netRevenue
      totalCenterShare
      totalPlatformShare
      transactionCount
      reconciledCount
    }
  }
`;

export const GET_FINANCIAL_TRANSACTIONS_QUERY = gql`
  query GetFinancialTransactions($centerId: ID, $type: String) {
    getFinancialTransactions(centerId: $centerId, type: $type) {
      id
      amount
      type
      status
      centerShare
      platformShare
      reconciledAt
      reconciliationNotes
      createdAt
      user {
        displayName
      }
      center {
        name
      }
      payment {
        id
        status
      }
    }
  }
`;

export const RECONCILE_TRANSACTION_MUTATION = gql`
  mutation ReconcileTransaction($transactionId: ID!, $notes: String) {
    reconcileTransaction(transactionId: $transactionId, notes: $notes) {
      id
      reconciledAt
      reconciliationNotes
    }
  }
`;

export const REFUND_TRANSACTION_MUTATION = gql`
  mutation RefundTransaction($paymentId: ID!, $refundAmount: Float!, $reason: String!) {
    refundTransaction(paymentId: $paymentId, refundAmount: $refundAmount, reason: $reason) {
      id
      amount
      type
    }
  }
`;

export const GET_REPORT_TEMPLATES_QUERY = gql`
  query GetReportTemplates($role: String) {
    getReportTemplates(role: $role) {
      id
      title
      description
      role
      filters
      widgets
      createdAt
    }
  }
`;

export const GET_REPORT_DATA_QUERY = gql`
  query GetReportData($templateId: ID!, $filters: String) {
    getReportData(templateId: $templateId, filters: $filters) {
      templateId
      metrics
    }
  }
`;

export const CREATE_REPORT_TEMPLATE_MUTATION = gql`
  mutation CreateReportTemplate($title: String!, $description: String, $role: String!, $filters: String, $widgets: String!) {
    createReportTemplate(title: $title, description: $description, role: $role, filters: $filters, widgets: $widgets) {
      id
      title
      role
    }
  }
`;

export const DELETE_REPORT_TEMPLATE_MUTATION = gql`
  mutation DeleteReportTemplate($id: ID!) {
    deleteReportTemplate(id: $id)
  }
`;

export const SHARE_REPORT_TEMPLATE_MUTATION = gql`
  mutation ShareReportTemplate($templateId: ID!, $roles: String!) {
    shareReportTemplate(templateId: $templateId, roles: $roles) {
      id
      sharedWithRoles
    }
  }
`;

export const CREATE_REPORT_SCHEDULE_MUTATION = gql`
  mutation CreateReportSchedule($templateId: ID!, $frequency: String!, $recipientEmails: String!) {
    createReportSchedule(templateId: $templateId, frequency: $frequency, recipientEmails: $recipientEmails) {
      id
      frequency
      recipientEmails
      nextRunAt
    }
  }
`;

export const DELETE_REPORT_SCHEDULE_MUTATION = gql`
  mutation DeleteReportSchedule($id: ID!) {
    deleteReportSchedule(id: $id)
  }
`;

export const GET_REPORT_SCHEDULES_QUERY = gql`
  query GetReportSchedules {
    getReportSchedules {
      id
      templateId
      frequency
      recipientEmails
      nextRunAt
      isActive
      template {
        title
      }
    }
  }
`;

export const PROCESS_SCHEDULED_REPORTS_MUTATION = gql`
  mutation ProcessScheduledReports {
    processScheduledReports
  }
`;

export const GET_SYSTEM_SETTINGS_QUERY = gql`
  query GetSystemSettings {
    getSystemSettings {
      id
      key
      value
      description
      updatedAt
    }
  }
`;

export const UPDATE_SYSTEM_SETTING_MUTATION = gql`
  mutation UpdateSystemSetting($key: String!, $value: String!) {
    updateSystemSetting(key: $key, value: $value) {
      id
      key
      value
    }
  }
`;

export const GET_FEATURE_FLAGS_QUERY = gql`
  query GetFeatureFlags {
    getFeatureFlags {
      id
      name
      description
      isEnabled
      rules
      updatedAt
    }
  }
`;

export const UPDATE_FEATURE_FLAG_MUTATION = gql`
  mutation UpdateFeatureFlag($name: String!, $isEnabled: Boolean!, $rules: String) {
    updateFeatureFlag(name: $name, isEnabled: $isEnabled, rules: $rules) {
      id
      name
      isEnabled
      rules
    }
  }
`;

export const GET_LOCALE_STRINGS_QUERY = gql`
  query GetLocaleStrings($lang: String!) {
    getLocaleStrings(lang: $lang) {
      id
      lang
      key
      value
      updatedAt
    }
  }
`;

export const UPSERT_LOCALE_STRING_MUTATION = gql`
  mutation UpsertLocaleString($lang: String!, $key: String!, $value: String!) {
    upsertLocaleString(lang: $lang, key: $key, value: $value) {
      id
      lang
      key
      value
    }
  }
`;

export const CHECK_FEATURE_FLAG_QUERY = gql`
  query CheckFeatureFlag($name: String!) {
    checkFeatureFlag(name: $name)
  }
`;

export const GET_SERVER_DIAGNOSTICS_QUERY = gql`
  query GetServerDiagnostics {
    getServerDiagnostics {
      cpuLoad
      freeMem
      totalMem
      processMemory
      uptimeSeconds
      activeDbConnections
      errorCount
    }
  }
`;

export const GET_SYSTEM_METRICS_HISTORY_QUERY = gql`
  query GetSystemMetricsHistory($metricType: String!) {
    getSystemMetricsHistory(metricType: $metricType) {
      id
      metricType
      value
      timestamp
    }
  }
`;

export const EXPORT_SYSTEM_LOGS_QUERY = gql`
  query ExportSystemLogs($limit: Int) {
    exportSystemLogs(limit: $limit)
  }
`;
