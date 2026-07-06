import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_BABY_DEVELOPMENT_QUERY } from '../graphql/operations';
import { styles } from '../components/styles.js';

export default function MobileBabyTracker({ user }) {
  const [week, setWeek] = useState(user.currentWeek || 1);
  const { data, loading } = useQuery(GET_BABY_DEVELOPMENT_QUERY, { variables: { weekNumber: week } });
  const baby = data?.getBabyDevelopment;
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Baby growth & milestones</Text>
      <Text style={styles.cardDesc}>Explore the beautiful changes happening each week.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }} contentContainerStyle={{ gap: 8 }}>
        {Array.from({ length: 40 }, (_, index) => index + 1).map((value) => <TouchableOpacity key={value} onPress={() => setWeek(value)} style={[styles.libraryCategoryTab, week === value && styles.libraryCategoryTabActive]}><Text style={[styles.libraryCategoryText, week === value && styles.libraryCategoryTextActive]}>{value === user.currentWeek ? `Week ${value} · Now` : `Week ${value}`}</Text></TouchableOpacity>)}
      </ScrollView>
      {loading ? <ActivityIndicator color="#68111B" /> : baby ? <View style={styles.babyInfoBox}><Text style={styles.babyInfoWeek}>WEEK {baby.weekNumber}</Text><Text style={styles.babyInfoSize}>Size: {baby.size}</Text>{baby.weight ? <Text style={styles.babyInfoWeight}>Weight: {baby.weight}</Text> : null}<View style={styles.babyDivider} /><Text style={styles.babyInfoLabel}>This week’s development</Text><Text style={styles.babyInfoDesc}>{baby.milestone}</Text></View> : <Text style={styles.emptyText}>Milestone information for week {week} is coming soon.</Text>}
    </View>
  );
}
