import React, { useState } from 'react';
import { ActivityIndicator, Alert, Linking, Text, TouchableOpacity, View, TextInput, ScrollView } from 'react-native';
import { useMutation, useQuery } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { 
  GET_LIVE_CLASSES_DETAILED_QUERY, 
  BOOK_LIVE_CLASS_DETAILED_MUTATION, 
  SUBMIT_LIVE_CLASS_FEEDBACK_MUTATION 
} from '../graphql/operations.js';
import { styles } from '../components/styles.js';
import { colors } from '../theme/theme.js';

export default function MobileLiveClasses({ user }) {
  const userLang = user?.language || 'en';
  const isHi = userLang === 'hi';

  const { data, loading, refetch } = useQuery(GET_LIVE_CLASSES_DETAILED_QUERY);
  const [bookLiveClass] = useMutation(BOOK_LIVE_CLASS_DETAILED_MUTATION, { onCompleted: () => refetch() });
  const [submitFeedback] = useMutation(SUBMIT_LIVE_CLASS_FEEDBACK_MUTATION, { onCompleted: () => refetch() });

  // Feedback states
  const [activeFeedbackId, setActiveFeedbackId] = useState(null);
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState('');

  const handleBook = async (liveClassId) => {
    try {
      await bookLiveClass({ variables: { liveClassId } });
      Alert.alert(isHi ? 'बुक किया गया' : 'Seat Reserved', isHi ? 'आपकी लाइव कक्षा सफलतापूर्वक बुक कर दी गई है।' : 'Your place has been reserved successfully.');
    } catch (error) {
      Alert.alert('Unable to book', error.message);
    }
  };

  const handleFeedbackSubmit = async (liveClassId) => {
    try {
      await submitFeedback({
        variables: {
          input: {
            liveClassId,
            feedbackScore: rating,
            feedbackNotes: notes
          }
        }
      });
      Alert.alert(isHi ? "धन्यवाद" : "Success", isHi ? "आपकी प्रतिक्रिया दर्ज कर ली गई है।" : "Thank you for rating the session!");
      setActiveFeedbackId(null);
      setNotes('');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCalendar = (item) => {
    const title = isHi ? item.titleHi : item.titleEn;
    const startDate = new Date(item.startTime);
    const endDate = new Date(startDate.getTime() + item.durationMins * 60 * 1000);
    
    const formatCalDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const dates = `${formatCalDate(startDate)}/${formatCalDate(endDate)}`;
    
    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${dates}&details=${encodeURIComponent('Live Session with ' + item.instructor)}&location=${encodeURIComponent(item.videoCallUrl)}`;
    Linking.openURL(url);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.canvas }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👩‍⚕️ {isHi ? "लाइव एक्सपर्ट सत्र" : "Live Expert Sessions"}</Text>
        <Text style={styles.cardDesc}>
          {isHi 
            ? "योग, ध्यान और स्त्री रोग विशेषज्ञों के साथ लाइव सत्र बुक करें।" 
            : "Book yoga, meditation and Garbh Sanskar sessions with our care team."}
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.maroon} style={{ marginVertical: 30 }} />
        ) : data?.getLiveClassesDetailed?.length ? (
          <View style={{ gap: 16, marginTop: 12 }}>
            {data.getLiveClassesDetailed.map((item) => {
              const isPast = new Date(item.startTime) < new Date();
              const title = isHi ? item.titleHi : item.titleEn;

              return (
                <View key={item.id} style={[styles.liveClassCard, { flexDirection: 'column', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.line }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: isPast ? colors.muted : colors.saffron }}>
                      📅 {new Date(item.startTime).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      {item.seriesTitle && (
                        <View style={{ backgroundColor: '#FAF5FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                          <Text style={{ color: '#553C9A', fontSize: 8, fontWeight: '900' }}>{item.seriesTitle.toUpperCase()}</Text>
                        </View>
                      )}
                      {item.batchName && (
                        <View style={{ backgroundColor: '#EBF8FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                          <Text style={{ color: '#2B6CB0', fontSize: 8, fontWeight: '900' }}>{item.batchName.toUpperCase()}</Text>
                        </View>
                      )}
                      {item.booked && (
                        <View style={{ backgroundColor: '#E6FFFA', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                          <Text style={{ color: '#234e52', fontSize: 8, fontWeight: '900' }}>{isHi ? "बुक किया गया" : "BOOKED"}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <Text style={[styles.liveClassTitle, { fontSize: 14, fontWeight: '800', color: colors.maroonDark, marginTop: 6 }]}>{title}</Text>
                  <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{item.instructor} · {item.durationMins} mins</Text>

                  {/* Action buttons bar */}
                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                    {item.booked && !isPast && (
                      <TouchableOpacity 
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.line }}
                        onPress={() => handleCalendar(item)}
                      >
                        <Ionicons name="calendar-outline" size={14} color={colors.maroon} />
                        <Text style={{ fontSize: 10, color: colors.maroon, fontWeight: '800' }}>{isHi ? "कैलेंडर" : "Calendar"}</Text>
                      </TouchableOpacity>
                    )}

                    {item.replayUrl && (
                      <TouchableOpacity 
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#7C3AED' }}
                        onPress={() => Linking.openURL(item.replayUrl)}
                      >
                        <Ionicons name="play-circle" size={14} color={colors.paper} />
                        <Text style={{ fontSize: 10, color: colors.paper, fontWeight: '800' }}>{isHi ? "रीप्ले देखें" : "Watch Replay"}</Text>
                      </TouchableOpacity>
                    )}

                    {item.booked ? (
                      !isPast ? (
                        <TouchableOpacity 
                          style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.success }}
                          onPress={() => Linking.openURL(item.videoCallUrl)}
                        >
                          <Text style={{ fontSize: 10, color: colors.paper, fontWeight: '900' }}>{isHi ? "शामिल हों" : "Join Call"}</Text>
                        </TouchableOpacity>
                      ) : (
                        !item.feedbackScore && (
                          <TouchableOpacity 
                            style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#EAB308' }}
                            onPress={() => setActiveFeedbackId(activeFeedbackId === item.id ? null : item.id)}
                          >
                            <Text style={{ fontSize: 10, color: colors.paper, fontWeight: '900' }}>{isHi ? "फीडबैक दें" : "Give Feedback"}</Text>
                          </TouchableOpacity>
                        )
                      )
                    ) : (
                      !isPast && (
                        <TouchableOpacity 
                          style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: colors.maroon }}
                          onPress={() => handleBook(item.id)}
                        >
                          <Text style={{ fontSize: 10, color: colors.paper, fontWeight: '900' }}>{isHi ? "सीट बुक करें" : "Book Seat"}</Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>

                  {/* Feedback form overlay */}
                  {activeFeedbackId === item.id && (
                    <View style={{ marginTop: 12, padding: 12, borderRadius: 10, backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.line }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: colors.maroonDark, marginBottom: 6 }}>
                        {isHi ? "कार्यशाला को रेटिंग दें (1-5)" : "Rate Workshop (1-5)"}
                      </Text>
                      
                      {/* Custom Native Stars Selector */}
                      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                        {[1, 2, 3, 4, 5].map(val => (
                          <TouchableOpacity key={val} onPress={() => setRating(val)}>
                            <Ionicons 
                              name={val <= rating ? "star" : "star-outline"} 
                              size={20} 
                              color="#EAB308" 
                            />
                          </TouchableOpacity>
                        ))}
                      </View>

                      <TextInput
                        style={{ height: 44, padding: 8, borderWidth: 1, borderColor: colors.line, borderRadius: 8, fontSize: 11, backgroundColor: colors.paper, textAlignVertical: 'top' }}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder={isHi ? "अपनी प्रतिक्रिया लिखें..." : "Share your feedback notes..."}
                        multiline
                      />

                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                        <TouchableOpacity 
                          style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: colors.maroon }}
                          onPress={() => handleFeedbackSubmit(item.id)}
                        >
                          <Text style={{ fontSize: 9, color: colors.paper, fontWeight: '800' }}>{isHi ? "सबमिट" : "Submit"}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: colors.line }}
                          onPress={() => setActiveFeedbackId(null)}
                        >
                          <Text style={{ fontSize: 9, color: colors.muted, fontWeight: '800' }}>{isHi ? "रद्द" : "Cancel"}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {item.feedbackScore && (
                    <View style={{ marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={{ flexDirection: 'row' }}>
                        {[1, 2, 3, 4, 5].map(val => (
                          <Ionicons 
                            key={val}
                            name={val <= item.feedbackScore ? "star" : "star-outline"} 
                            size={12} 
                            color="#EAB308" 
                          />
                        ))}
                      </View>
                      {item.feedbackNotes && (
                        <Text style={{ fontSize: 10, fontStyle: 'italic', color: colors.muted }}>
                          "{item.feedbackNotes}"
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.emptyText}>{isHi ? "कोई लाइव कक्षाएं निर्धारित नहीं हैं।" : "No live classes scheduled."}</Text>
        )}
      </View>
    </ScrollView>
  );
}
