import React, { useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_BABY_DEVELOPMENT_QUERY } from '../graphql/operations';
import { styles } from '../components/styles.js';

export default function MobileBabyTracker({ user, t }) {
  const [week, setWeek] = useState(user.currentWeek || 1);
  const { data, loading } = useQuery(GET_BABY_DEVELOPMENT_QUERY, {
    variables: { weekNumber: week }
  });

  const baby = data?.getBabyDevelopment;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>👶 Baby Tracker & Milestones</Text>
      
      <Text style={styles.onboardingLabel}>Select pregnancy week</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }} contentContainerStyle={{ gap: 8 }}>
        {Array.from({ length: 40 }, (_, i) => i + 1).map((value) => (
          <TouchableOpacity
            key={value}
            onPress={() => setWeek(value)}
            style={[styles.libraryCategoryTab, week === value && styles.libraryCategoryTabActive]}
          >
            <Text style={[styles.libraryCategoryText, week === value && styles.libraryCategoryTextActive]}>
              {value === user.currentWeek ? `Week ${value} · Now` : `Week ${value}`}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="small" color="#f97316" style={{ marginVertical: 20 }} />
      ) : baby ? (
        <View style={styles.babyInfoBox}>
          <Text style={styles.babyInfoWeek}>WEEK {baby.weekNumber}</Text>
          <Text style={styles.babyInfoSize}>Size: {baby.size}</Text>
          {baby.weight && <Text style={styles.babyInfoWeight}>Weight: {baby.weight}</Text>}
          <View style={styles.babyDivider} />
          <Text style={styles.babyInfoLabel}>Weekly Development Milestones:</Text>
          <Text style={styles.babyInfoDesc}>{baby.milestone}</Text>
        </View>
      ) : (
        <Text style={styles.emptyText}>No weekly milestones detail configured for Week {week}.</Text>
      )}
    </View>
  );
}
