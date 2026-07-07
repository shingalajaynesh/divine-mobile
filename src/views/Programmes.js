import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { ENROLL_IN_PROGRAM_MUTATION, MY_PROGRAM_ENROLLMENTS_QUERY, PROGRAM_CATALOG_QUERY, UPDATE_ACTIVITY_PROGRESS_MUTATION } from '../graphql/operations.js';
import { colors, shadows } from '../theme/theme.js';

export default function MobileProgrammes() {
  const [expanded, setExpanded] = useState(null);
  const { data, loading, error } = useQuery(PROGRAM_CATALOG_QUERY);
  const { data: enrollmentData, refetch } = useQuery(MY_PROGRAM_ENROLLMENTS_QUERY);
  const [enroll, { loading: enrolling }] = useMutation(ENROLL_IN_PROGRAM_MUTATION, { onCompleted: () => refetch() });
  const [updateProgress] = useMutation(UPDATE_ACTIVITY_PROGRESS_MUTATION, { onCompleted: () => refetch() });

  const enrollments = new Map((enrollmentData?.myProgramEnrollments || []).map((item) => [item.program.id, item]));

  const handleToggleActivity = (activityId, isCompleted) => {
    updateProgress({
      variables: {
        activityId,
        input: {
          status: isCompleted ? 'pending' : 'completed',
          durationSeconds: 300
        }
      }
    }).catch((e) => Alert.alert('Error updating activity', e.message));
  };

  if (loading) return <ActivityIndicator color={colors.maroon} />;
  if (error) return <Text style={s.empty}>Programme catalogue could not be loaded.</Text>;

  return <View style={s.screen}>
    <Text style={s.eyebrow}>DIVINE LEARNING</Text><Text style={s.heading}>Programmes for your journey</Text><Text style={s.intro}>Structured daily practices designed for a calm, consistent routine.</Text>
    {(data?.programCatalog || []).map((program) => {
      const enrollment = enrollments.get(program.id);
      const activities = program.modules.flatMap((module) => module.lessons.flatMap((lesson) => lesson.activities));
      const completed = new Set((enrollment?.activityProgress || []).filter((item) => item.status === 'completed').map((item) => item.activityId));
      const progress = activities.length ? Math.round((completed.size / activities.length) * 100) : 0;

      return <View key={program.id} style={s.card}>
        <View style={s.cardTop}><View style={s.programIcon}><Ionicons name="sparkles" size={24} color={colors.saffron} /></View><View style={s.badge}><Text style={s.badgeText}>{program.isPremium ? 'PREMIUM' : 'INCLUDED'}</Text></View></View>
        <Text style={s.title}>{program.name}</Text><Text style={s.summary}>{program.summary}</Text><Text style={s.meta}>{program.modules.length} modules · {activities.length} activities · Progress: {progress}%</Text>
        {!enrollment ? <TouchableOpacity disabled={program.isPremium || enrolling} style={[s.primary, program.isPremium && s.disabled]} onPress={() => enroll({ variables: { programId: program.id } }).catch((e) => Alert.alert('Unable to enroll', e.message))}><Text style={s.primaryText}>{program.isPremium ? 'Requires programme access' : 'Start programme'}</Text></TouchableOpacity> : <View style={s.enrolled}><Ionicons name="checkmark-circle" size={18} color={colors.success} /><Text style={s.enrolledText}>Enrolled · {enrollment.status}</Text></View>}
        <TouchableOpacity style={s.modulesToggle} onPress={() => setExpanded(expanded === program.id ? null : program.id)}><Text style={s.modulesToggleText}>View curriculum</Text><Ionicons name={expanded === program.id ? 'chevron-up' : 'chevron-down'} size={18} color={colors.maroon} /></TouchableOpacity>
        {expanded === program.id ? <View style={s.modules}>{program.modules.map((module) => <View key={module.id} style={s.module}><Text style={s.moduleTitle}>{module.title}</Text><Text style={s.moduleDescription}>{module.description}</Text>{module.lessons.map((lesson) => (
          <View key={lesson.id} style={{ marginVertical: 8 }}>
            <View style={s.lesson}><View style={s.lessonIcon}><Ionicons name={lesson.lessonType === 'audio' ? 'headset-outline' : 'play-outline'} size={16} color={colors.maroon} /></View><View style={{ flex: 1 }}><Text style={s.lessonTitle}>{lesson.title}</Text><Text style={s.lessonMeta}>{lesson.durationMins || 0} min · {lesson.activities.length} activities</Text></View></View>
            {enrollment && lesson.activities && lesson.activities.length > 0 && (
              <View style={s.activitiesList}>
                {lesson.activities.map((act) => {
                  const isDone = completed.has(act.id);
                  return (
                    <View key={act.id} style={s.activityRow}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={[s.activityTitle, isDone && s.activityTitleDone]}>{act.title}</Text>
                        <Text style={s.activityInstructions}>{act.instructions} · {act.estimatedMins}m</Text>
                      </View>
                      <TouchableOpacity 
                        style={[s.activityBtn, isDone && s.activityBtnDone]} 
                        onPress={() => handleToggleActivity(act.id, isDone)}
                      >
                        <Ionicons name={isDone ? "checkmark-circle" : "play-circle"} size={14} color={isDone ? colors.success : colors.paper} />
                        <Text style={[s.activityBtnText, isDone && s.activityBtnTextDone]}>{isDone ? 'Done' : 'Start'}</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ))}</View>)}</View> : null}
      </View>;
    })}
  </View>;
}

const s = StyleSheet.create({
  screen: { gap: 14 }, eyebrow: { color: colors.saffron, fontSize: 9, fontWeight: '900', letterSpacing: 1 }, heading: { color: colors.maroonDark, fontSize: 26, lineHeight: 31, fontWeight: '900' }, intro: { color: colors.muted, fontSize: 12, lineHeight: 18, marginBottom: 4 }, empty: { color: colors.muted, textAlign: 'center', marginTop: 30 },
  card: { padding: 19, borderRadius: 24, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, ...shadows.card }, cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, programIcon: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.softSaffron }, badge: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: '#E4F2E9' }, badgeText: { color: colors.success, fontSize: 8, fontWeight: '900' },
  title: { color: colors.maroonDark, fontSize: 20, fontWeight: '900', marginTop: 14 }, summary: { color: colors.muted, fontSize: 11, lineHeight: 17, marginTop: 6 }, meta: { color: colors.saffron, fontSize: 10, fontWeight: '800', marginTop: 12 }, primary: { minHeight: 45, marginTop: 16, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.maroon }, disabled: { opacity: .5 }, primaryText: { color: colors.paper, fontSize: 11, fontWeight: '900' }, enrolled: { marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 7 }, enrolledText: { color: colors.success, fontSize: 11, fontWeight: '900' }, modulesToggle: { minHeight: 44, marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.line }, modulesToggleText: { color: colors.maroon, fontSize: 11, fontWeight: '800' }, modules: { gap: 10 }, module: { padding: 13, borderRadius: 15, backgroundColor: colors.canvas }, moduleTitle: { color: colors.maroonDark, fontSize: 13, fontWeight: '900' }, moduleDescription: { color: colors.muted, fontSize: 9, lineHeight: 14, marginTop: 3, marginBottom: 8 }, lesson: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 8 }, lessonIcon: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.paper }, lessonTitle: { color: colors.maroonDark, fontSize: 10, fontWeight: '800' }, lessonMeta: { color: colors.muted, fontSize: 8, marginTop: 2 },
  activitiesList: { paddingLeft: 12, paddingVertical: 4, gap: 6, backgroundColor: '#f1f5f9', borderRadius: 10, marginTop: 4 },
  activityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  activityTitle: { color: colors.maroonDark, fontSize: 11, fontWeight: '700' },
  activityTitleDone: { color: colors.muted, textDecorationLine: 'line-through' },
  activityInstructions: { color: colors.muted, fontSize: 9, marginTop: 1 },
  activityBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: colors.maroon },
  activityBtnDone: { backgroundColor: '#e2e8f0', borderWidth: 1, borderColor: '#cbd5e1' },
  activityBtnText: { color: colors.paper, fontSize: 9, fontWeight: '800' },
  activityBtnTextDone: { color: colors.success, fontSize: 9, fontWeight: '800' },
});
