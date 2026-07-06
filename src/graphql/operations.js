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
  query GetForumPosts {
    getForumPosts {
      id
      title
      content
      likesCount
      createdAt
      user {
        displayName
      }
      comments {
        id
        content
        createdAt
        user {
          displayName
        }
      }
    }
  }
`;

export const ADD_FORUM_POST_MUTATION = gql`
  mutation AddForumPost($title: String!, $content: String!) {
    addForumPost(title: $title, content: $content) {
      id
      title
      content
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
