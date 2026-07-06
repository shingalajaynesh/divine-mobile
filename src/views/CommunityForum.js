import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { 
  GET_FORUM_POSTS_QUERY, 
  ADD_FORUM_POST_MUTATION, 
  ADD_FORUM_COMMENT_MUTATION,
  TOGGLE_POST_LIKE_MUTATION,
  REPORT_POST_MUTATION,
  REPORT_COMMENT_MUTATION
} from '../graphql/operations.js';
import { styles } from '../components/styles.js';
import { colors } from '../theme/theme.js';

export default function MobileForum({ user }) {
  const userLang = user?.language || 'en';
  const isHi = userLang === 'hi';

  const [activeCategory, setActiveCategory] = useState('All');
  
  const { data, loading, refetch } = useQuery(GET_FORUM_POSTS_QUERY, {
    variables: { category: activeCategory }
  });

  const [addForumPost] = useMutation(ADD_FORUM_POST_MUTATION, { onCompleted: () => refetch() });
  const [addForumComment] = useMutation(ADD_FORUM_COMMENT_MUTATION, { onCompleted: () => refetch() });
  const [togglePostLike] = useMutation(TOGGLE_POST_LIKE_MUTATION, { onCompleted: () => refetch() });
  const [reportPost] = useMutation(REPORT_POST_MUTATION, { onCompleted: () => refetch() });
  const [reportComment] = useMutation(REPORT_COMMENT_MUTATION, { onCompleted: () => refetch() });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postCategory, setPostCategory] = useState('General');
  const [commentText, setCommentText] = useState({});
  const [posting, setPosting] = useState(false);

  const categories = [
    { key: 'All', label: isHi ? 'सभी' : 'All' },
    { key: 'General', label: isHi ? 'सामान्य' : 'General' },
    { key: 'Trimester 1 Support', label: isHi ? 'तिमाही 1' : 'Trimester 1' },
    { key: 'Yoga & Fitness', label: isHi ? 'योग' : 'Yoga' },
    { key: 'Diet & Recipes', label: isHi ? 'आहार' : 'Diet' },
    { key: 'Baby Names', label: isHi ? 'नाम' : 'Names' }
  ];

  const handlePost = async () => {
    if (!title || !content) return;
    setPosting(true);
    try {
      await addForumPost({ 
        variables: { title, content, category: postCategory } 
      });
      setTitle('');
      setContent('');
      Alert.alert(isHi ? 'सफलता' : 'Success', isHi ? 'पोस्ट साझा की गई!' : 'Community post shared successfully!');
    } catch (e) {
      Alert.alert('Unable to publish', e.message);
    } finally {
      setPosting(false);
    }
  };

  const handleComment = async (postId) => {
    const text = commentText[postId];
    if (!text) return;
    try {
      await addForumComment({ variables: { postId, content: text } });
      setCommentText({ ...commentText, [postId]: '' });
    } catch (e) {
      Alert.alert('Unable to reply', e.message);
    }
  };

  const handleLike = async (postId) => {
    try {
      await togglePostLike({ variables: { postId } });
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleReportPost = (postId) => {
    Alert.alert(
      isHi ? 'सामग्री रिपोर्ट करें' : 'Report Content',
      isHi ? 'क्या आप इस पोस्ट को रिपोर्ट करना चाहते हैं?' : 'Are you sure you want to flag this post for moderation review?',
      [
        { text: isHi ? 'रद्द' : 'Cancel', style: 'cancel' },
        { 
          text: isHi ? 'रिपोर्ट' : 'Report', 
          style: 'destructive',
          onPress: async () => {
            try {
              await reportPost({ variables: { postId } });
              Alert.alert(isHi ? 'रिपोर्ट किया गया' : 'Reported', isHi ? 'सत्र मॉडरेटर को सूचित कर दिया गया है।' : 'Thank you. The item has been flagged.');
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          }
        }
      ]
    );
  };

  const handleReportComment = (commentId) => {
    Alert.alert(
      isHi ? 'टिप्पणी रिपोर्ट करें' : 'Report Comment',
      isHi ? 'क्या आप इस टिप्पणी को रिपोर्ट करना चाहते हैं?' : 'Are you sure you want to flag this comment for moderation review?',
      [
        { text: isHi ? 'रद्द' : 'Cancel', style: 'cancel' },
        { 
          text: isHi ? 'रिपोर्ट' : 'Report', 
          style: 'destructive',
          onPress: async () => {
            try {
              await reportComment({ variables: { commentId } });
              Alert.alert(isHi ? 'रिपोर्ट किया गया' : 'Reported', isHi ? 'सत्र मॉडरेटर को सूचित कर दिया गया है।' : 'Thank you. The comment has been flagged.');
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      {/* Add post card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💬 {isHi ? "सामुदायिक मंच" : "Community Forum"}</Text>
        
        {/* Category selector row */}
        <Text style={{ fontSize: 10, fontWeight: '800', color: colors.muted, marginBottom: 4, textTransform: 'uppercase' }}>
          {isHi ? "विषय श्रेणी" : "Post Topic Category"}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: 12 }}>
          {categories.filter(c => c.key !== 'All').map(c => (
            <TouchableOpacity 
              key={c.key} 
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: postCategory === c.key ? colors.maroon : colors.canvas,
                borderWidth: 1,
                borderColor: colors.line
              }}
              onPress={() => setPostCategory(c.key)}
            >
              <Text style={{ fontSize: 10, color: postCategory === c.key ? colors.paper : colors.muted, fontWeight: 'bold' }}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TextInput
          style={styles.onboardingInput}
          placeholder={isHi ? "शीर्षक..." : "Topic/Question Title"}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.onboardingInput, { height: 70, textAlignVertical: 'top' }]}
          placeholder={isHi ? "विवरण लिखें..." : "Describe your query..."}
          multiline
          value={content}
          onChangeText={setContent}
        />
        <TouchableOpacity style={[styles.forumSubmitBtn, { backgroundColor: '#be123c' }]} onPress={handlePost} disabled={posting}>
          <Text style={styles.forumSubmitBtnText}>{posting ? (isHi ? 'पोस्ट हो रहा है...' : 'Posting...') : (isHi ? 'माताओं से पूछें' : 'Ask Mothers')}</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Category Filters list */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {categories.map(c => (
            <TouchableOpacity 
              key={c.key} 
              style={[
                styles.libraryCategoryTab, 
                activeCategory === c.key && { backgroundColor: '#be123c', borderColor: '#be123c' }
              ]}
              onPress={() => setActiveCategory(c.key)}
            >
              <Text style={[
                styles.libraryCategoryText, 
                activeCategory === c.key && { color: colors.paper }
              ]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Feed list */}
      {loading ? (
        <ActivityIndicator size="small" color="#be123c" style={{ marginVertical: 20 }} />
      ) : data?.getForumPosts && data.getForumPosts.length > 0 ? (
        <View style={{ gap: 16 }}>
          {data.getForumPosts.map((post) => (
            <View key={post.id} style={styles.forumPostCard}>
              <View style={[styles.forumPostUserRow, { justifyContent: 'space-between', alignItems: 'center' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[styles.forumUserAvatar, { backgroundColor: '#ffe4e6' }]}>
                    <Text style={[styles.forumUserAvatarText, { color: '#be123c' }]}>{post.user?.displayName?.[0] || 'M'}</Text>
                  </View>
                  <View>
                    <Text style={styles.forumUserName}>{post.user?.displayName || 'Mother'}</Text>
                    <Text style={styles.forumPostTime}>{new Date(post.createdAt).toLocaleDateString()}</Text>
                  </View>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: '#FFF0F3' }}>
                    <Text style={{ fontSize: 8, color: '#be123c', fontWeight: '900' }}>{post.category}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleReportPost(post.id)}>
                    <Ionicons name="flag-outline" size={14} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={[styles.forumPostTitle, { color: '#881337', marginTop: 4 }]}>{post.title}</Text>
              <Text style={[styles.forumPostBody, { color: colors.ink, marginTop: 4 }]}>{post.content}</Text>

              {/* Likes trigger bar */}
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10, alignSelf: 'flex-start' }}
                onPress={() => handleLike(post.id)}
              >
                <Ionicons 
                  name={post.isLiked ? "thumbs-up" : "thumbs-up-outline"} 
                  size={16} 
                  color={post.isLiked ? '#be123c' : colors.muted} 
                />
                <Text style={{ fontSize: 11, fontWeight: '800', color: post.isLiked ? '#be123c' : colors.muted }}>
                  {post.likesCount} {isHi ? "पसंद" : "Likes"}
                </Text>
              </TouchableOpacity>

              {/* Comments Accordion */}
              <View style={styles.forumCommentSection}>
                <Text style={styles.forumCommentCount}>{isHi ? `टिप्पणियाँ (${post.comments?.length || 0})` : `Comments (${post.comments?.length || 0})`}</Text>
                {post.comments?.map((comment) => (
                  <View key={comment.id} style={styles.forumCommentItem}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={styles.forumCommentUser}>{comment.user?.displayName || 'Mother'}</Text>
                      <TouchableOpacity onPress={() => handleReportComment(comment.id)}>
                        <Ionicons name="flag-outline" size={10} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.forumCommentText}>{comment.content}</Text>
                  </View>
                ))}

                <View style={styles.forumCommentInputRow}>
                  <TextInput
                    style={styles.forumCommentInput}
                    placeholder={isHi ? "टिप्पणी लिखें..." : "Write a comment..."}
                    value={commentText[post.id] || ''}
                    onChangeText={(text) => setCommentText({ ...commentText, [post.id]: text })}
                  />
                  <TouchableOpacity style={[styles.forumCommentBtn, { backgroundColor: '#be123c' }]} onPress={() => handleComment(post.id)}>
                    <Text style={styles.forumCommentBtnText}>{isHi ? "उत्तर दें" : "Reply"}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>{isHi ? "कोई पोस्ट उपलब्ध नहीं है।" : "No community posts shared yet."}</Text>
      )}
    </ScrollView>
  );
}
