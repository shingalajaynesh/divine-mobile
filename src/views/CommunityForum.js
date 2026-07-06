import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { GET_FORUM_POSTS_QUERY, ADD_FORUM_POST_MUTATION, ADD_FORUM_COMMENT_MUTATION } from '../graphql/operations';
import { styles } from '../components/styles.js';

export default function MobileForum({ t }) {
  const { data, loading, refetch } = useQuery(GET_FORUM_POSTS_QUERY);
  const [addForumPost] = useMutation(ADD_FORUM_POST_MUTATION, { onCompleted: () => refetch() });
  const [addForumComment] = useMutation(ADD_FORUM_COMMENT_MUTATION, { onCompleted: () => refetch() });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [commentText, setCommentText] = useState({});
  const [posting, setPosting] = useState(false);

  const handlePost = async () => {
    if (!title || !content) return;
    setPosting(true);
    try {
      await addForumPost({ variables: { title, content } });
      setTitle('');
      setContent('');
    } catch (e) {
      alert(e.message);
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
      alert(e.message);
    }
  };

  return (
    <View style={{ gap: 20 }}>
      {/* Add post card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💬 Community Forum</Text>
        <TextInput
          style={styles.onboardingInput}
          placeholder="Topic/Question Title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.onboardingInput, { height: 80, textAlignVertical: 'top' }]}
          placeholder="Describe your query..."
          multiline
          value={content}
          onChangeText={setContent}
        />
        <TouchableOpacity style={styles.forumSubmitBtn} onPress={handlePost} disabled={posting}>
          <Text style={styles.forumSubmitBtnText}>{posting ? 'Posting...' : 'Ask Mothers'}</Text>
        </TouchableOpacity>
      </View>

      {/* Feed list */}
      {loading ? (
        <ActivityIndicator size="small" color="#f97316" />
      ) : data?.getForumPosts && data.getForumPosts.length > 0 ? (
        <View style={{ gap: 16 }}>
          {data.getForumPosts.map((post) => (
            <View key={post.id} style={styles.forumPostCard}>
              <View style={styles.forumPostUserRow}>
                <View style={styles.forumUserAvatar}>
                  <Text style={styles.forumUserAvatarText}>{post.user?.displayName?.[0] || 'M'}</Text>
                </View>
                <View>
                  <Text style={styles.forumUserName}>{post.user?.displayName || 'Mother'}</Text>
                  <Text style={styles.forumPostTime}>{new Date(post.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
              <Text style={styles.forumPostTitle}>{post.title}</Text>
              <Text style={styles.forumPostBody}>{post.content}</Text>

              {/* Comments Accordion */}
              <View style={styles.forumCommentSection}>
                <Text style={styles.forumCommentCount}>Comments ({post.comments?.length || 0})</Text>
                {post.comments?.map((comment) => (
                  <View key={comment.id} style={styles.forumCommentItem}>
                    <Text style={styles.forumCommentUser}>{comment.user?.displayName || 'Mother'}</Text>
                    <Text style={styles.forumCommentText}>{comment.content}</Text>
                  </View>
                ))}

                <View style={styles.forumCommentInputRow}>
                  <TextInput
                    style={styles.forumCommentInput}
                    placeholder="Write a comment..."
                    value={commentText[post.id] || ''}
                    onChangeText={(text) => setCommentText({ ...commentText, [post.id]: text })}
                  />
                  <TouchableOpacity style={styles.forumCommentBtn} onPress={() => handleComment(post.id)}>
                    <Text style={styles.forumCommentBtnText}>Reply</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>No community posts shared yet.</Text>
      )}
    </View>
  );
}
