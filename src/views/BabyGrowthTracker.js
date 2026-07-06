import React, { useState } from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
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
      
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 10 }}>
        <Text style={styles.onboardingLabel}>Select Week:</Text>
        <select
          value={String(week)}
          onChange={(e) => setWeek(parseInt(e.target.value))}
          style={{ padding: 8, borderRadius: 10, border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}
        >
          {Array.from({ length: 40 }, (_, i) => i + 1).map((w) => (
            <option key={w} value={String(w)}>Week {w} {w === user.currentWeek ? '(Current)' : ''}</option>
          ))}
        </select>
      </View>

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
