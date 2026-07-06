import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { 
  MY_STREAK_QUERY, 
  MY_ACHIEVEMENTS_QUERY, 
  MY_WEEKLY_REPORT_QUERY 
} from '../graphql/operations.js';
import { colors, shadows } from '../theme/theme.js';

const badgeDefinitions = {
  FIRST_STEPS: { title: 'First Steps', titleHi: 'पहला कदम', desc: 'Completed your first daily ritual.', descHi: 'अपनी पहली दैनिक गतिविधि पूरी की।', emoji: '👣' },
  THREE_DAY_STREAK: { title: 'Three-Day Streak', titleHi: 'तीन दिवसीय लय', desc: 'Consistent for three days.', descHi: 'लगातार तीन दिनों तक पूर्णता बनाए रखी।', emoji: '⭐' },
  PERFECT_WEEK: { title: 'Perfect Week', titleHi: 'सर्वश्रेष्ठ सप्ताह', desc: 'Maintained a 7-day streak.', descHi: 'एक आदर्श 7-दिवसीय पूर्णता लय बनाए रखी।', emoji: '👑' }
};

export default function MobileWeeklyReport({ user, lang, onNavigate }) {
  const isHi = lang === 'hi';
  const currentWeek = user?.currentWeek || 1;
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { data: streakData } = useQuery(MY_STREAK_QUERY);
  const { data: achievementsData } = useQuery(MY_ACHIEVEMENTS_QUERY);
  const { data: reportData, loading: reportLoading } = useQuery(MY_WEEKLY_REPORT_QUERY, {
    variables: { weekNumber: selectedWeek }
  });

  const streak = streakData?.myStreak;
  const achievements = achievementsData?.myAchievements || [];
  const report = reportData?.myWeeklyReport;
  const unlockedBadgeKeys = achievements.map(a => a.badgeKey);

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity style={s.backButton} onPress={() => onNavigate('more')}>
          <Ionicons name="arrow-back" size={22} color={colors.maroon} />
          <Text style={s.backText}>{isHi ? 'पीछे' : 'Back'}</Text>
        </TouchableOpacity>
        <Text style={s.title}>{isHi ? 'साप्ताहिक रिपोर्ट' : 'Weekly Reports'}</Text>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Streak Summary */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Ionicons name="flame" size={20} color="#f97316" />
            <Text style={s.cardTitle}>{isHi ? 'दैनिक लय' : 'Daily Streaks'}</Text>
          </View>
          <View style={s.streakRow}>
            <View style={s.streakCol}>
              <Text style={s.streakValue}>{streak?.currentStreak || 0}</Text>
              <Text style={s.streakLabel}>{isHi ? 'वर्तमान लय' : 'Current Streak'}</Text>
            </View>
            <View style={s.streakDivider} />
            <View style={s.streakCol}>
              <Text style={s.streakValue}>{streak?.longestStreak || 0}</Text>
              <Text style={s.streakLabel}>{isHi ? 'सर्वोत्तम लय' : 'Longest Streak'}</Text>
            </View>
          </View>
        </View>

        {/* Week Selector */}
        <View style={[s.selectorCard, s.rowBetween]}>
          <Text style={s.selectorLabel}>{isHi ? 'सप्ताह चुनें:' : 'Select Week:'}</Text>
          <TouchableOpacity style={s.dropdownButton} onPress={() => setDropdownOpen(!dropdownOpen)}>
            <Text style={s.dropdownText}>Week {selectedWeek}</Text>
            <Ionicons name={dropdownOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.maroon} />
          </TouchableOpacity>
        </View>

        {dropdownOpen && (
          <View style={s.dropdownList}>
            <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
              {Array.from({ length: 40 }, (_, i) => i + 1).map((w) => (
                <TouchableOpacity 
                  key={w} 
                  style={[s.dropdownItem, selectedWeek === w && s.dropdownItemActive]} 
                  onPress={() => {
                    setSelectedWeek(w);
                    setDropdownOpen(false);
                  }}
                >
                  <Text style={[s.dropdownItemText, selectedWeek === w && s.dropdownItemTextActive]}>Week {w}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Weekly Progress metrics */}
        {reportLoading ? (
          <View style={s.loadingContainer}>
            <ActivityIndicator size="large" color={colors.maroon} />
          </View>
        ) : report ? (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Ionicons name="analytics" size={20} color={colors.maroon} />
              <Text style={s.cardTitle}>{isHi ? 'सप्ताह प्रगति' : 'Weekly Progress'}</Text>
            </View>
            <View style={s.statsSummary}>
              <Text style={s.summaryText}>
                {isHi ? `${report.completedDaysCount} दिन पूरे किए गए` : `${report.completedDaysCount} of 7 days completed`}
              </Text>
              <Text style={s.summaryMins}>
                ⏱️ {report.totalWeekDurationMins} {isHi ? 'कुल मिनट' : 'total minutes'}
              </Text>
            </View>

            <View style={s.divider} />

            {/* Days list */}
            {report.days.map((day) => (
              <View key={day.dayNumber} style={s.dayRow}>
                <View style={s.dayInfo}>
                  <Text style={s.dayNumberText}>Day {day.dayNumber}</Text>
                  <View style={s.quotientsRow}>
                    <Text style={[s.qBadge, day.pqCompleted && s.qBadgeDone]}>P</Text>
                    <Text style={[s.qBadge, day.iqCompleted && s.qBadgeDone]}>I</Text>
                    <Text style={[s.qBadge, day.eqCompleted && s.qBadgeDone]}>E</Text>
                    <Text style={[s.qBadge, day.sqCompleted && s.qBadgeDone]}>S</Text>
                  </View>
                </View>
                <View style={s.dayReflections}>
                  {day.reflections.length > 0 ? (
                    day.reflections.map((r, i) => (
                      <Text key={i} style={s.reflectionText} numberOfLines={2}>• {r}</Text>
                    ))
                  ) : (
                    <Text style={s.noReflectionText}>{isHi ? 'कोई नोट्स नहीं' : 'No reflections logged'}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {/* Badges and achievements */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Ionicons name="trophy" size={20} color="#eab308" />
            <Text style={s.cardTitle}>{isHi ? 'अर्जित बैज' : 'Achievements & Badges'}</Text>
          </View>
          <View style={{ gap: 12 }}>
            {Object.entries(badgeDefinitions).map(([key, def]) => {
              const unlocked = unlockedBadgeKeys.includes(key);
              return (
                <View key={key} style={[s.badgeCard, unlocked && s.badgeCardUnlocked]}>
                  <Text style={s.badgeEmoji}>{unlocked ? def.emoji : '🔒'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.badgeTitle}>{isHi ? def.titleHi : def.title}</Text>
                    <Text style={s.badgeDesc}>{isHi ? def.descHi : def.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.paper, borderBottomWidth: 1, borderBottomColor: colors.line },
  backButton: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  backText: { color: colors.maroon, fontSize: 13, fontWeight: '700', marginLeft: 4 },
  title: { color: colors.maroonDark, fontSize: 16, fontWeight: '900' },
  scroll: { padding: 16, gap: 16, paddingBottom: 64 },
  card: { padding: 16, borderRadius: 20, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, ...shadows.card },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  cardTitle: { color: colors.maroonDark, fontSize: 13, fontWeight: '900', textTransform: 'uppercase' },
  streakRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  streakCol: { flex: 1, alignItems: 'center' },
  streakValue: { color: '#f97316', fontSize: 26, fontWeight: '900' },
  streakLabel: { color: colors.muted, fontSize: 9, marginTop: 4, fontWeight: '700' },
  streakDivider: { width: 1, backgroundColor: colors.line },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectorCard: { padding: 14, borderRadius: 16, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line },
  selectorLabel: { color: colors.maroonDark, fontSize: 12, fontWeight: '800' },
  dropdownButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.canvas, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: colors.line },
  dropdownText: { color: colors.maroon, fontSize: 12, fontWeight: '800' },
  dropdownList: { backgroundColor: colors.paper, borderRadius: 16, borderColors: colors.line, borderWidth: 1, padding: 8, marginTop: -8 },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  dropdownItemActive: { backgroundColor: colors.softMaroon },
  dropdownItemText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  dropdownItemTextActive: { color: colors.maroon, fontWeight: '900' },
  loadingContainer: { padding: 32, alignItems: 'center' },
  statsSummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryText: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  summaryMins: { color: colors.maroon, fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 14 },
  dayRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  dayInfo: { width: '35%', gap: 6 },
  dayNumberText: { color: colors.maroonDark, fontSize: 12, fontWeight: '900' },
  quotientsRow: { flexDirection: 'row', gap: 3 },
  qBadge: { width: 16, height: 16, borderRadius: 4, backgroundColor: colors.canvas, textAlign: 'center', fontSize: 9, lineHeight: 16, color: colors.muted, fontWeight: '800' },
  qBadgeDone: { backgroundColor: colors.success, color: colors.paper },
  dayReflections: { flex: 1, justifyContent: 'center', paddingLeft: 8 },
  reflectionText: { color: colors.muted, fontSize: 10, lineHeight: 14, marginBottom: 2 },
  noReflectionText: { color: colors.muted, fontSize: 10, fontStyle: 'italic' },
  badgeCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.canvas, opacity: 0.6 },
  badgeCardUnlocked: { backgroundColor: '#FFFBEB', borderColor: '#FEF3C7', opacity: 1 },
  badgeEmoji: { fontSize: 24 },
  badgeTitle: { color: colors.maroonDark, fontSize: 12, fontWeight: '850' },
  badgeDesc: { color: colors.muted, fontSize: 10, marginTop: 2 }
});
