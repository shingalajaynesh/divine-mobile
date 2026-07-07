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
  query GetForumPosts($category: String) {
    getForumPosts(category: $category) {
      id
      title
      content
      category
      likesCount
      isLiked
      createdAt
      user {
        displayName
      }
      comments {
        id
        content
        reported
        createdAt
        user {
          displayName
        }
      }
    }
  }
`;

export const ADD_FORUM_POST_MUTATION = gql`
  mutation AddForumPost($title: String!, $content: String!, $category: String) {
    addForumPost(title: $title, content: $content, category: $category) {
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

export const REPORT_POST_MUTATION = gql`
  mutation ReportPost($postId: ID!) {
    reportPost(postId: $postId) {
      id
      reported
      reportsCount
    }
  }
`;

export const REPORT_COMMENT_MUTATION = gql`
  mutation ReportComment($commentId: ID!) {
    reportComment(commentId: $commentId) {
      id
      reported
      reportsCount
    }
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
