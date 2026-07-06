import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useQuery } from '@apollo/client';
import { LinearGradient } from 'expo-linear-gradient';
import { GET_DAILY_CONTENT_QUERY, GET_BABY_DEVELOPMENT_QUERY } from '../graphql/operations';
import { styles } from '../components/styles.js';

export default function MobileTodayDashboard({ user, t }) {
  const [dayNumber, setDayNumber] = useState(user.pregnancyDay || 1);
  const { data: contentData, loading: contentLoading } = useQuery(GET_DAILY_CONTENT_QUERY, {
    variables: { dayNumber }
  });

  const content = contentData?.getDailyContent;
  const { data: babyData } = useQuery(GET_BABY_DEVELOPMENT_QUERY, {
    variables: { weekNumber: user.currentWeek || 1 }
  });
  const baby = babyData?.getBabyDevelopment;

  return (
    <View style={{ gap: 20 }}>
      {/* Banner */}
      <LinearGradient
        colors={['#fb923c', '#f43f5e']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.greetingCard}
      >
        <Text style={styles.greetingBabyEmoji}>👶</Text>
        <Text style={styles.greetingTitle}>{t.hello_mother}</Text>
        <Text style={styles.greetingDesc}>
          {t.current_week.replace('{week}', user.currentWeek || 1)}. {t.size_desc.replace('{size}', baby?.size || 'a tiny seed')}
        </Text>
        <View style={styles.badgeRow}>
          <View style={styles.capsuleBadge}>
            <Text style={styles.capsuleBadgeText}>{t.edd_badge.replace('{edd}', user.dueDate)}</Text>
          </View>
          <View style={styles.capsuleBadge}>
            <Text style={styles.capsuleBadgeText}>{t.trimester_badge.replace('{trimester}', user.currentTrimester)}</Text>
          </View>
          <View style={styles.capsuleBadge}>
            <Text style={styles.capsuleBadgeText}>🌱 Day {user.pregnancyDay} / 280</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Calendar Day Picker */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📅 280-Day Content Calendar</Text>
        <Text style={styles.cardDesc}>Select a pregnancy day to unlock the story or ritual:</Text>
        
        <View style={styles.daySelectorRow}>
          <TextInput
            style={styles.dayInput}
            keyboardType="number-pad"
            value={String(dayNumber)}
            onChangeText={(text) => {
              const val = parseInt(text);
              if (val >= 1 && val <= 280) setDayNumber(val);
            }}
          />
          <Text style={styles.dayInputLabel}>Day of Pregnancy (1 - 280)</Text>
        </View>

        {contentLoading ? (
          <ActivityIndicator size="small" color="#f97316" style={{ marginVertical: 20 }} />
        ) : content ? (
          <View style={styles.dailyContentBox}>
            <Text style={styles.dailyCategory}>{content.category.toUpperCase()}</Text>
            <Text style={styles.dailyTitle}>{content.title}</Text>
            <Text style={styles.dailyBody}>{content.body}</Text>
            {content.mediaUrl && (
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={() => Linking.openURL(content.mediaUrl)}
              >
                <Text style={styles.mediaButtonText}>Play Guided Session 🔊</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Text style={styles.emptyText}>No specific calendar content uploaded for Day {dayNumber}.</Text>
        )}
      </View>

      {/* Daily Affirmation */}
      <LinearGradient
        colors={['#f43f5e', '#ec4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.affirmationCard}
      >
        <Text style={styles.affirmationLabel}>{t.affirmation_title}</Text>
        <Text style={styles.affirmationQuote}>
          "I am filled with love, peace, and strength. My baby feels safe, healthy, and cherished."
        </Text>
      </LinearGradient>

      {/* Guides Section */}
      <View style={styles.guidesCard}>
        <View style={styles.guidesCardHeader}>
          <Text style={styles.guidesCardHeaderEmoji}>👩‍⚕️</Text>
          <View>
            <Text style={styles.guidesCardHeaderTitle}>{t.guides_title}</Text>
            <Text style={styles.guidesCardHeaderDesc}>{t.guides_sub}</Text>
          </View>
        </View>

        <View style={styles.guideRow}>
          <View>
            <Text style={styles.guideName}>Dr. Sunita Sharma</Text>
            <Text style={styles.guideRoleOrange}>Chief Garbh Sanskar Trainer</Text>
          </View>
          <TouchableOpacity style={styles.chatButtonOrange} onPress={() => Linking.openURL('https://wa.me/919638484545?text=Hello%2C%20I%20would%20like%20to%20book%20an%20expert%20consultation.')}>
            <Text style={styles.chatButtonText}>{t.chat}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.guideRow, styles.guideRowLast]}>
          <View>
            <Text style={styles.guideName}>Mrs. Priya Patel</Text>
            <Text style={styles.guideRoleRose}>Prenatal Yoga Expert</Text>
          </View>
          <TouchableOpacity style={styles.chatButtonRose} onPress={() => Linking.openURL('https://wa.me/919638484545?text=Hello%2C%20I%20would%20like%20to%20book%20a%20prenatal%20yoga%20consultation.')}>
            <Text style={styles.chatButtonText}>{t.chat}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
