import { gql } from '@apollo/client';

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
