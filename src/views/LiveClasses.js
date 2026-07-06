import React from 'react';
import { ActivityIndicator, Alert, Linking, Text, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery } from '@apollo/client';
import { BOOK_LIVE_CLASS_MUTATION, GET_LIVE_CLASSES_QUERY } from '../graphql/operations';
import { styles } from '../components/styles.js';

export default function MobileLiveClasses() {
  const { data, loading, refetch } = useQuery(GET_LIVE_CLASSES_QUERY);
  const [bookLiveClass] = useMutation(BOOK_LIVE_CLASS_MUTATION, { onCompleted: () => refetch() });
  const handleBook = async (classId) => {
    try {
      await bookLiveClass({ variables: { classId } });
      Alert.alert('Class booked', 'Your place has been reserved successfully.');
    } catch (error) {
      Alert.alert('Unable to book class', error.message);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Live expert sessions</Text>
      <Text style={styles.cardDesc}>Book yoga, meditation and Garbh Sanskar sessions with our care team.</Text>
      {loading ? <ActivityIndicator color="#68111B" /> : data?.getLiveClasses?.length ? (
        <View style={{ gap: 14, marginTop: 10 }}>
          {data.getLiveClasses.map((item) => (
            <View key={item.id} style={styles.liveClassCard}>
              <View style={{ flex: 1 }}><Text style={styles.liveClassTime}>{new Date(item.startTime).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text><Text style={styles.liveClassTitle}>{item.title}</Text><Text style={styles.liveClassInstructor}>{item.instructor} · {item.durationMins} mins</Text></View>
              {item.isBooked ? <TouchableOpacity style={styles.liveClassBtnJoined} onPress={() => Linking.openURL(item.videoCallUrl)}><Text style={styles.liveClassBtnText}>Join call</Text></TouchableOpacity> : <TouchableOpacity style={styles.liveClassBtnBook} onPress={() => handleBook(item.id)}><Text style={styles.liveClassBtnText}>Book</Text></TouchableOpacity>}
            </View>
          ))}
        </View>
      ) : <Text style={styles.emptyText}>No live classes are scheduled yet.</Text>}
    </View>
  );
}
