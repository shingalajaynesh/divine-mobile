import React, { useRef, useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Dimensions, ActivityIndicator } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { GET_CONTENT_VIEW_HISTORY_QUERY, RECORD_CONTENT_VIEW_MUTATION } from '../graphql/operations.js';
import { colors } from '../theme/theme.js';

const { width } = Dimensions.getDefault || Dimensions.get('window');

export default function VideoPlayerModal({ visible, onClose, mediaUrl, contentItemId, dailyContentId, title, isHi }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [savedPosition, setSavedPosition] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch watch history
  const { data, refetch } = useQuery(GET_CONTENT_VIEW_HISTORY_QUERY, {
    variables: { contentItemId: contentItemId || null, dailyContentId: dailyContentId || null },
    skip: !visible || (!contentItemId && !dailyContentId),
    fetchPolicy: 'network-only'
  });

  const [recordContentView] = useMutation(RECORD_CONTENT_VIEW_MUTATION);

  // Check watch history position
  useEffect(() => {
    if (data?.getContentViewHistory) {
      const pos = data.getContentViewHistory.lastPositionSeconds;
      if (pos > 5 && !data.getContentViewHistory.completed) {
        setSavedPosition(pos);
        setShowResumePrompt(true);
      }
    }
  }, [data]);

  const saveProgress = async (pos, percent, isDone) => {
    try {
      await recordContentView({
        variables: {
          input: {
            contentItemId: contentItemId || null,
            dailyContentId: dailyContentId || null,
            lastPositionSeconds: Math.floor(pos),
            progressPercent: parseFloat(percent.toFixed(2)),
            completed: isDone
          }
        }
      });
    } catch (e) {
      console.warn('Error saving position:', e);
    }
  };

  const handlePlaybackStatusUpdate = (statusObj) => {
    setStatus(statusObj);
    
    if (statusObj.isLoaded) {
      setLoading(false);
      
      const current = statusObj.positionMillis / 1000;
      const duration = statusObj.durationMillis / 1000;
      
      if (duration > 0) {
        const percent = (current / duration) * 100;
        
        // Save progress every 8 seconds
        if (Math.floor(current) % 8 === 0 && Math.floor(current) > 0) {
          saveProgress(current, percent, percent >= 90);
        }

        if (statusObj.didJustFinish) {
          saveProgress(current, 100, true);
        }
      }
    }
  };

  const handleResume = async () => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(savedPosition * 1000);
      await videoRef.current.playAsync();
    }
    setShowResumePrompt(false);
  };

  const handleStartFresh = async () => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(0);
      await videoRef.current.playAsync();
    }
    setShowResumePrompt(false);
  };

  const handleClose = async () => {
    if (videoRef.current && status.isLoaded) {
      const current = status.positionMillis / 1000;
      const duration = status.durationMillis / 1000;
      if (duration > 0) {
        const percent = (current / duration) * 100;
        await saveProgress(current, percent, percent >= 90);
      }
      await videoRef.current.stopAsync();
    }
    setShowResumePrompt(false);
    onClose();
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = status.isLoaded && status.durationMillis
    ? (status.positionMillis / status.durationMillis) * 100
    : 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      transparent={false}
    >
      <View style={s.container}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={handleClose} style={s.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.paper} />
          </TouchableOpacity>
          <Text style={s.headerTitle} numberOfLines={1}>
            {title || (isHi ? "वीडियो" : "Video")}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Video Wrapper */}
        <View style={s.videoWrapper}>
          <Video
            ref={videoRef}
            source={{ uri: mediaUrl }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="contain"
            shouldPlay={!showResumePrompt}
            useNativeControls
            style={s.videoPlayer}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />

          {loading && !showResumePrompt && (
            <View style={s.loadingContainer}>
              <ActivityIndicator size="large" color={colors.saffron} />
            </View>
          )}

          {showResumePrompt && (
            <View style={s.resumePrompt}>
              <Ionicons name="time-outline" size={48} color={colors.saffron} style={{ marginBottom: 12 }} />
              <Text style={s.resumePromptTitle}>
                {isHi ? "वीडियो फिर से शुरू करें?" : "Resume Video?"}
              </Text>
              <Text style={s.resumePromptText}>
                {isHi 
                  ? `पिछली प्रगति ${formatTime(savedPosition)} पर पाई गई।`
                  : `Last watched progress found at ${formatTime(savedPosition)}.`
                }
              </Text>
              <View style={s.resumePromptActions}>
                <TouchableOpacity style={s.resumeBtn} onPress={handleResume}>
                  <Text style={s.resumeBtnText}>
                    {isHi ? "यहाँ से शुरू करें" : "Resume"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.freshBtn} onPress={handleStartFresh}>
                  <Text style={s.freshBtnText}>
                    {isHi ? "शुरू से देखें" : "Start Fresh"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Watch Progress Tracker */}
        <View style={s.progressBarArea}>
          <View style={s.progressLabelRow}>
            <Text style={s.progressBarLabel}>
              {isHi ? "ऑटो-सिंक प्रगति ट्रैकिंग" : "Auto-sync view progress tracking"}
            </Text>
            <Text style={s.progressPercentage}>
              {Math.round(progressPercent)}%
            </Text>
          </View>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 16,
    backgroundColor: '#1e293b'
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: colors.paper, fontSize: 16, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  videoWrapper: { flex: 1, justifyContent: 'center', backgroundColor: '#000', position: 'relative' },
  videoPlayer: { width: '100%', height: 260 },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  resumePrompt: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  resumePromptTitle: { color: colors.paper, fontSize: 18, fontWeight: '900', marginBottom: 8 },
  resumePromptText: { color: '#94a3b8', fontSize: 13, textAlign: 'center', marginBottom: 24 },
  resumePromptActions: { flexDirection: 'row', gap: 12 },
  resumeBtn: { backgroundColor: colors.maroon, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  resumeBtnText: { color: colors.paper, fontWeight: 'bold', fontSize: 13 },
  freshBtn: { borderWidth: 1, borderColor: '#cbd5e1', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  freshBtnText: { color: '#cbd5e1', fontWeight: 'bold', fontSize: 13 },
  progressBarArea: { padding: 20, backgroundColor: '#1e293b' },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressBarLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '600' },
  progressPercentage: { color: colors.saffron, fontSize: 12, fontWeight: '800' },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: '#334155', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.saffron, borderRadius: 3 }
});
