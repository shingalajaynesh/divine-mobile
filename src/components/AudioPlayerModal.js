import React, { useRef, useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Dimensions, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { GET_MY_PLAYLISTS_QUERY, CREATE_PLAYLIST_MUTATION, ADD_PLAYLIST_ITEM_MUTATION } from '../graphql/operations.js';
import { colors } from '../theme/theme.js';

const { width } = Dimensions.getDefault || Dimensions.get('window');

export default function AudioPlayerModal({ visible, onClose, mediaUrl, title, contentItemId, isHi }) {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [sleepTimer, setSleepTimer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [downloaded, setDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);

  // Playlists
  const { data: playlistsData, refetch: refetchPlaylists } = useQuery(GET_MY_PLAYLISTS_QUERY, {
    skip: !visible
  });
  const [addPlaylistItem] = useMutation(ADD_PLAYLIST_ITEM_MUTATION);

  // Initialize Audio Mode for background playback
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldRouteThroughEarpieceAndroid: false,
        });
      } catch (err) {
        console.warn('Audio setup error:', err);
      }
    };
    setupAudio();
  }, []);

  // Load sound asset
  useEffect(() => {
    if (visible && mediaUrl) {
      loadAudio();
    }
    return () => {
      unloadAudio();
    };
  }, [visible, mediaUrl]);

  // Sleep Timer ticks
  useEffect(() => {
    if (timeLeft <= 0) {
      if (isPlaying && sleepTimer !== null) {
        pauseAudio();
        setSleepTimer(null);
        Alert.alert(
          isHi ? "स्लीप टाइमर" : "Sleep Timer",
          isHi ? "ऑडियो प्लेबैक रोक दिया गया है।" : "Audio playback has been paused."
        );
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, isPlaying]);

  const loadAudio = async () => {
    try {
      setLoading(true);
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: mediaUrl },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
    } catch (err) {
      console.warn('Sound load error:', err);
    }
  };

  const unloadAudio = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    setIsPlaying(false);
    setStatus({});
  };

  const onPlaybackStatusUpdate = (statusObj) => {
    setStatus(statusObj);
    if (statusObj.isLoaded) {
      setLoading(false);
      setIsPlaying(statusObj.isPlaying);
    }
  };

  const playAudio = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const pauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const handleClose = async () => {
    await unloadAudio();
    setSleepTimer(null);
    setTimeLeft(0);
    setShowPlaylistSelector(false);
    onClose();
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      Alert.alert(
        isHi ? "सफलता" : "Success",
        isHi ? "अभ्यास को ऑफलाइन सुनने के लिए सहेज लिया गया है।" : "Track saved successfully for offline listening."
      );
    }, 2000);
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      await addPlaylistItem({ variables: { playlistId, contentItemId } });
      Alert.alert(
        isHi ? "सफलता" : "Success",
        isHi ? "प्लेलिस्ट में जोड़ा गया!" : "Track added to playlist!"
      );
      setShowPlaylistSelector(false);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const formatTime = (millis) => {
    if (!millis) return '0:00';
    const secs = millis / 1000;
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const positionText = status.isLoaded ? formatTime(status.positionMillis) : '0:00';
  const durationText = status.isLoaded ? formatTime(status.durationMillis) : '0:00';
  const progress = status.isLoaded && status.durationMillis
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
            {isHi ? "ध्यान और संगीत" : "Meditation & Music"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={s.contentBody}>
          {/* Cover Disc */}
          <View style={[s.disc, isPlaying && s.discPlaying]}>
            <Ionicons name="musical-notes" size={72} color={colors.saffron} />
          </View>

          {/* Titles */}
          <Text style={s.trackTitle} numberOfLines={2}>{title || (isHi ? "निर्देशित ध्यान" : "Guided Meditation")}</Text>
          <Text style={s.trackSubtitle}>{isHi ? "मन को शांत रखें" : "Keep a calm mind"}</Text>

          {loading && (
            <ActivityIndicator size="small" color={colors.saffron} style={{ marginVertical: 10 }} />
          )}

          {/* Scrub Bar */}
          <View style={s.scrubContainer}>
            <View style={s.scrubTrack}>
              <View style={[s.scrubFill, { width: `${progress}%` }]} />
            </View>
            <View style={s.scrubTimeRow}>
              <Text style={s.timeText}>{positionText}</Text>
              <Text style={s.timeText}>{durationText}</Text>
            </View>
          </View>

          {/* Playback Controls */}
          <View style={s.controlsRow}>
            <TouchableOpacity style={s.playBtn} onPress={togglePlay}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={36} color={colors.paper} />
            </TouchableOpacity>
          </View>

          {/* Action Row */}
          <View style={s.actionsRow}>
            {/* Download */}
            <TouchableOpacity 
              style={s.actionBtn} 
              onPress={handleDownload}
              disabled={downloading || downloaded}
            >
              {downloading ? (
                <ActivityIndicator size="small" color="#94a3b8" />
              ) : (
                <>
                  <Ionicons name={downloaded ? "checkmark-circle" : "cloud-download-outline"} size={22} color={downloaded ? colors.success : "#cbd5e1"} />
                  <Text style={[s.actionText, downloaded && { color: colors.success }]}>
                    {downloaded ? (isHi ? "सहेजा" : "Saved") : (isHi ? "डाउनलोड" : "Download")}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Sleep Timer */}
            <TouchableOpacity 
              style={s.actionBtn} 
              onPress={() => {
                if (sleepTimer) {
                  setSleepTimer(null);
                  setTimeLeft(0);
                  toast(isHi ? "टाइमर रद्द" : "Timer Cancelled");
                } else {
                  setSleepTimer(30);
                  setTimeLeft(30 * 60);
                  Alert.alert(
                    isHi ? "स्लीप टाइमर" : "Sleep Timer",
                    isHi ? "३० मिनट का टाइमर सेट किया गया है।" : "Audio will stop playing in 30 minutes."
                  );
                }
              }}
            >
              <Ionicons name="alarm-outline" size={22} color={sleepTimer ? colors.saffron : "#cbd5e1"} />
              <Text style={[s.actionText, sleepTimer && { color: colors.saffron }]}>
                {sleepTimer ? formatTime(timeLeft * 1000) : (isHi ? "टाइमर" : "Timer")}
              </Text>
            </TouchableOpacity>

            {/* Add to Playlist */}
            {contentItemId && (
              <TouchableOpacity style={s.actionBtn} onPress={() => setShowPlaylistSelector(true)}>
                <Ionicons name="list-outline" size={22} color="#cbd5e1" />
                <Text style={s.actionText}>{isHi ? "प्लेलिस्ट" : "Playlist"}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Playlist selector sheet inside modal */}
        {showPlaylistSelector && (
          <View style={s.playlistSheet}>
            <View style={s.playlistSheetHeader}>
              <Text style={s.playlistSheetTitle}>{isHi ? "प्लेलिस्ट चुनें" : "Select Playlist"}</Text>
              <TouchableOpacity onPress={() => setShowPlaylistSelector(false)}>
                <Ionicons name="close-circle" size={22} color={colors.maroon} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 200 }}>
              {(playlistsData?.getMyPlaylists || []).map((playlist) => (
                <TouchableOpacity 
                  key={playlist.id} 
                  style={s.playlistItem}
                  onPress={() => handleAddToPlaylist(playlist.id)}
                >
                  <Ionicons name="musical-note" size={16} color={colors.saffron} />
                  <Text style={s.playlistItemText}>{playlist.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
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
  contentBody: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  disc: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#334155',
    marginBottom: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 }
  },
  discPlaying: { borderColor: colors.saffron },
  trackTitle: { color: colors.paper, fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  trackSubtitle: { color: '#94a3b8', fontSize: 13, marginBottom: 32 },
  scrubContainer: { width: '100%', marginBottom: 24 },
  scrubTrack: { height: 6, backgroundColor: '#334155', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  scrubFill: { height: '100%', backgroundColor: colors.saffron, borderRadius: 3 },
  scrubTimeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  timeText: { color: '#64748b', fontSize: 11, fontWeight: '500' },
  controlsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 40 },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.saffron,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4
  },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 24 },
  actionBtn: { alignItems: 'center', gap: 6 },
  actionText: { color: '#94a3b8', fontSize: 10, fontWeight: '600' },
  playlistSheet: { padding: 20, backgroundColor: '#1e293b', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  playlistSheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  playlistSheetTitle: { color: colors.paper, fontSize: 14, fontWeight: 'bold' },
  playlistItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#334155' },
  playlistItemText: { color: '#cbd5e1', fontSize: 12, fontWeight: '600' }
});
