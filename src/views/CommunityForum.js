import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Modal, StyleSheet, Checkbox } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { 
  GET_FORUM_POSTS_QUERY, 
  GET_FORUM_GROUPS_QUERY,
  CREATE_FORUM_GROUP_MUTATION,
  ADD_FORUM_POST_MUTATION, 
  ADD_FORUM_COMMENT_MUTATION,
  REACT_TO_POST_MUTATION,
  REPORT_POST_MUTATION,
  REPORT_COMMENT_MUTATION
} from '../graphql/operations.js';
import { styles } from '../components/styles.js';
import { colors, radius, spacing } from '../theme/theme.js';

const REACTION_TYPES = [
  { emoji: '👍', value: 'LIKE' },
  { emoji: '❤️', value: 'HEART' },
  { emoji: '😮', value: 'WOW' },
  { emoji: '😢', value: 'SAD' }
];

export default function MobileForum({ user }) {
  const userLang = user?.language || 'en';
  const isHi = userLang === 'hi';

  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // Queries
  const { data: groupsData, refetch: refetchGroups } = useQuery(GET_FORUM_GROUPS_QUERY);
  const { data, loading, refetch } = useQuery(GET_FORUM_POSTS_QUERY, {
    variables: { 
      category: activeCategory === 'All' ? null : activeCategory,
      groupId: selectedGroupId
    }
  });

  // Mutations
  const [createForumGroup, { loading: creatingGroup }] = useMutation(CREATE_FORUM_GROUP_MUTATION, { onCompleted: () => refetchGroups() });
  const [addForumPost] = useMutation(ADD_FORUM_POST_MUTATION, { onCompleted: () => refetch() });
  const [addForumComment] = useMutation(ADD_FORUM_COMMENT_MUTATION, { onCompleted: () => refetch() });
  const [reactToPost] = useMutation(REACT_TO_POST_MUTATION, { onCompleted: () => refetch() });
  const [reportPost] = useMutation(REPORT_POST_MUTATION, { onCompleted: () => refetch() });
  const [reportComment] = useMutation(REPORT_COMMENT_MUTATION, { onCompleted: () => refetch() });

  // Dialog / Modal states
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupPrivate, setNewGroupPrivate] = useState(false);

  // Abuse Report Modal states
  const [reportTarget, setReportTarget] = useState(null); // { type: 'POST'|'COMMENT', id: ID }
  const [reportReason, setReportReason] = useState('');

  // Form states
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

  const handleCreateGroup = async () => {
    if (!newGroupName) return;
    try {
      await createForumGroup({
        variables: {
          name: newGroupName,
          description: newGroupDesc,
          isPrivate: newGroupPrivate,
          coverUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74'
        }
      });
      setIsGroupModalOpen(false);
      setNewGroupName('');
      setNewGroupDesc('');
      setNewGroupPrivate(false);
      Alert.alert('Success', isHi ? 'समुदाय समूह बनाया गया!' : 'Sub-community group channel created!');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handlePost = async () => {
    if (!title || !content) return;
    setPosting(true);
    try {
      await addForumPost({ 
        variables: { 
          title, 
          content, 
          category: postCategory,
          groupId: selectedGroupId
        } 
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

  const handleReactToPost = async (postId, reaction) => {
    try {
      await reactToPost({ variables: { postId, reactionType: reaction } });
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const submitAbuseReport = async () => {
    if (!reportTarget) return;
    try {
      if (reportTarget.type === 'POST') {
        await reportPost({ variables: { postId: reportTarget.id, reason: reportReason } });
      } else {
        await reportComment({ variables: { commentId: reportTarget.id, reason: reportReason } });
      }
      Alert.alert(isHi ? 'सामग्री रिपोर्ट की गई' : 'Reported', isHi ? 'सत्र मॉडरेटर को सूचित कर दिया गया है।' : 'Thank you. Flagged for review.');
      setReportTarget(null);
      setReportReason('');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const getReactionCount = (stats, type) => {
    const item = (stats || []).find(s => s.type === type);
    return item ? item.count : 0;
  };

  const groups = groupsData?.getForumGroups || [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        
        {/* Groups Navigator Card */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="people-outline" size={15} color={colors.maroonDark} />
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.maroonDark }}>{isHi ? "समुदाय समूह" : "Sub-Community Channels"}</Text>
            </View>
            <TouchableOpacity onPress={() => setIsGroupModalOpen(true)}>
              <Ionicons name="add-circle" size={20} color={colors.maroon} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            <TouchableOpacity 
              style={[customStyles.groupTab, selectedGroupId === null && customStyles.groupTabActive]}
              onPress={() => setSelectedGroupId(null)}
            >
              <Text style={[customStyles.groupTabText, selectedGroupId === null && customStyles.groupTabTextActive]}>
                {isHi ? "सभी चर्चाएं" : "All Discussions"}
              </Text>
            </TouchableOpacity>
            {groups.map(group => (
              <TouchableOpacity 
                key={group.id}
                style={[customStyles.groupTab, selectedGroupId === group.id && customStyles.groupTabActive]}
                onPress={() => setSelectedGroupId(group.id)}
              >
                <Text style={[customStyles.groupTabText, selectedGroupId === group.id && customStyles.groupTabTextActive]}>
                  {group.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Add post card */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.maroonDark} />
            <Text style={[styles.cardTitle, { marginBottom: 0 }]}>{isHi ? "सामुदायिक मंच" : "Community Forum"}</Text>
          </View>
          
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
                    {post.group && (
                      <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: '#E0F2FE', flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                        <Ionicons name="people-outline" size={8} color="#0369A1" />
                        <Text style={{ fontSize: 8, color: '#0369A1', fontWeight: '900' }}>{post.group.name}</Text>
                      </View>
                    )}
                    <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: '#FFF0F3' }}>
                      <Text style={{ fontSize: 8, color: '#be123c', fontWeight: '900' }}>{post.category}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setReportTarget({ type: 'POST', id: post.id })}>
                      <Ionicons name="flag-outline" size={14} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={[styles.forumPostTitle, { color: '#881337', marginTop: 4 }]}>{post.title}</Text>
                <Text style={[styles.forumPostBody, { color: colors.ink, marginTop: 4 }]}>{post.content}</Text>

                {/* Emoji reactions bar */}
                <View style={customStyles.reactionsBar}>
                  {REACTION_TYPES.map((react) => {
                    const count = getReactionCount(post.reactionStats, react.value);
                    const active = post.userReaction === react.value;
                    return (
                      <TouchableOpacity 
                        key={react.value}
                        style={[customStyles.reactionBtn, active && customStyles.reactionBtnActive]}
                        onPress={() => handleReactToPost(post.id, react.value)}
                      >
                        <Text style={{ fontSize: 12 }}>{react.emoji}</Text>
                        {count > 0 && (
                          <Text style={[customStyles.reactionCountText, active && { color: colors.maroon }]}>{count}</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Comments Accordion */}
                <View style={styles.forumCommentSection}>
                  <Text style={styles.forumCommentCount}>{isHi ? `टिप्पणियाँ (${post.comments?.length || 0})` : `Comments (${post.comments?.length || 0})`}</Text>
                  {post.comments?.map((comment) => (
                    <View key={comment.id} style={styles.forumCommentItem}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.forumCommentUser}>{comment.user?.displayName || 'Mother'}</Text>
                        <TouchableOpacity onPress={() => setReportTarget({ type: 'COMMENT', id: comment.id })}>
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

      {/* CREATE GROUP MODAL */}
      <Modal
        visible={isGroupModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsGroupModalOpen(false)}
      >
        <View style={customStyles.modalOverlay}>
          <View style={customStyles.modalContent}>
            <Text style={customStyles.modalTitle}>{isHi ? "नया समुदाय समूह बनाएँ" : "Create New Forum Group"}</Text>
            
            <Text style={customStyles.label}>Group Name *</Text>
            <TextInput 
              style={customStyles.input}
              placeholder="e.g. Trimester 2 Support"
              value={newGroupName}
              onChangeText={setNewGroupName}
            />

            <Text style={customStyles.label}>Description</Text>
            <TextInput 
              style={[customStyles.input, { height: 60, textAlignVertical: 'top' }]}
              placeholder="Explain what this channel is for..."
              multiline
              value={newGroupDesc}
              onChangeText={setNewGroupDesc}
            />

            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12, gap: 8 }}
              onPress={() => setNewGroupPrivate(!newGroupPrivate)}
            >
              <Ionicons 
                name={newGroupPrivate ? "checkbox" : "square-outline"} 
                size={20} 
                color={colors.maroon} 
              />
              <Text style={{ fontSize: 12, color: colors.ink }}>Private Channel (Invitation Only)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[customStyles.actionBtn, { backgroundColor: colors.maroon }]}
              onPress={handleCreateGroup}
              disabled={creatingGroup}
            >
              <Text style={customStyles.actionBtnText}>{isHi ? "समूह बनाएँ" : "Create Group Channel"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={customStyles.closeBtn} onPress={() => setIsGroupModalOpen(false)}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.muted }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ABUSE REPORT MODAL */}
      <Modal
        visible={reportTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => { setReportTarget(null); setReportReason(''); }}
      >
        <View style={customStyles.modalOverlay}>
          <View style={customStyles.modalContent}>
            <Text style={customStyles.modalTitle}>{isHi ? "सामग्री रिपोर्ट करें" : "Report Content Violation"}</Text>
            <Text style={{ fontSize: 11, color: colors.muted, marginVertical: 8 }}>
              Please describe the violation reason (e.g. spam, abuse, incorrect medical advice) so that our moderation team can review this item.
            </Text>

            <TextInput 
              style={[customStyles.input, { height: 65, textAlignVertical: 'top' }]}
              placeholder="Type reason here..."
              multiline
              value={reportReason}
              onChangeText={setReportReason}
            />

            <TouchableOpacity 
              style={[customStyles.actionBtn, { backgroundColor: colors.error, marginTop: 12 }]}
              onPress={submitAbuseReport}
            >
              <Text style={customStyles.actionBtnText}>Submit Violation Report</Text>
            </TouchableOpacity>

            <TouchableOpacity style={customStyles.closeBtn} onPress={() => { setReportTarget(null); setReportReason(''); }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.muted }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const customStyles = StyleSheet.create({
  groupTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.line
  },
  groupTabActive: {
    backgroundColor: '#FFE4E6',
    borderColor: '#F43F5E'
  },
  groupTabText: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: 'bold'
  },
  groupTabTextActive: {
    color: '#BE123C'
  },
  reactionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.canvas,
    padding: 6,
    borderRadius: radius.sm,
    marginTop: 10,
    alignSelf: 'flex-start'
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  reactionBtnActive: {
    backgroundColor: '#FFE4E6',
    borderWidth: 1,
    borderColor: '#F43F5E'
  },
  reactionCountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.muted
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: radius.md,
    padding: 16,
    gap: 8
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.maroonDark,
    textAlign: 'center',
    marginBottom: 4
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.muted,
    marginTop: 6
  },
  input: {
    height: 38,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    fontSize: 11,
    backgroundColor: '#fff'
  },
  actionBtn: {
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900'
  },
  closeBtn: {
    paddingVertical: 10,
    alignItems: 'center'
  }
});
