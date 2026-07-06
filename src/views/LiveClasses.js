import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { GET_LIVE_CLASSES_QUERY, BOOK_LIVE_CLASS_MUTATION } from '../graphql/operations';
import { styles } from '../components/styles.js';

export default function MobileLiveClasses() {
  const { data, loading, refetch } = useQuery(GET_LIVE_CLASSES_QUERY);
  const [bookLiveClass] = useMutation(BOOK_LIVE_CLASS_MUTATION, { onCompleted: () => refetch() });

  const handleBook = async (classId) => {
    try {
      await bookLiveClass({ variables: { classId } });
      alert("Class Booked Successfully!");
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>👩‍⚕️ Live Interactive Webinars</Text>
      <Text style={styles.cardDesc}>Attend daily expert yoga and meditation call sessions:</Text>

      {loading ? (
        <ActivityIndicator size="small" color="#f97316" style={{ marginVertical: 20 }} />
      ) : data?.getLiveClasses && data.getLiveClasses.length > 0 ? (
        <View style={{ gap: 14, marginTop: 10 }}>
          {data.getLiveClasses.map((item) => (
            <View key={item.id} style={styles.liveClassCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.liveClassTime}>
                  {new Date(item.startTime).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={styles.liveClassTitle}>{item.title}</Text>
                <Text style={styles.liveClassInstructor}>Instructor: {item.instructor} ({item.durationMins} mins)</Text>
              </View>
              <View>
                {item.isBooked ? (
                  <TouchableOpacity
                    style={styles.liveClassBtnJoined}
                    onPress={() => Linking.openURL(item.videoCallUrl)}
                  >
                    <Text style={styles.liveClassBtnText}>Join Call 🎥</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.liveClassBtnBook} onPress={() => handleBook(item.id)}>
                    <Text style={styles.liveClassBtnText}>Book</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>No live classes scheduled.</Text>
      )}
    </View>
  );
}
