import React from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@apollo/client';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GET_BABY_DEVELOPMENT_QUERY, GET_DAILY_CONTENT_QUERY } from '../graphql/operations';
import { colors, shadows } from '../theme/theme.js';

const SUPPORT = 'https://wa.me/919638484545?text=Hello%20Divine%20team%2C%20I%20would%20like%20guidance.';

const inspiration = [
  { title: 'Calm digestion', subtitle: 'Gentle habits for pregnancy', icon: 'leaf-outline', colors: ['#6A1320', '#9C3541'] },
  { title: 'Mindful bonding', subtitle: 'Connect with your baby', icon: 'heart-outline', colors: ['#B45309', '#F59E0B'] },
  { title: 'Deep rest', subtitle: 'Sleep and meditation', icon: 'moon-outline', colors: ['#4A235A', '#7E3D83'] },
];

const quickActions = [
  { title: 'Baby growth', subtitle: 'Weekly milestones', icon: 'heart-circle-outline', tab: 'activity', tone: '#FCE8EC' },
  { title: 'Daily activities', subtitle: 'Mind, body and values', icon: 'sparkles-outline', tab: 'tools', tone: '#FFF0D1' },
  { title: 'Explore library', subtitle: 'Stories, yoga and music', icon: 'library-outline', tab: 'learn', tone: '#E8F4ED' },
  { title: 'Community', subtitle: 'Ask and support', icon: 'people-outline', tab: 'community', tone: '#EFE8F7' },
];

export default function MobileTodayDashboard({ user, onNavigate }) {
  const { data: babyData } = useQuery(GET_BABY_DEVELOPMENT_QUERY, { variables: { weekNumber: user.currentWeek || 1 } });
  const { data: contentData, loading: contentLoading } = useQuery(GET_DAILY_CONTENT_QUERY, { variables: { dayNumber: user.pregnancyDay || 1 } });
  const baby = babyData?.getBabyDevelopment;
  const content = contentData?.getDailyContent;

  return (
    <View style={s.screen}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.rail}>
        {inspiration.map((item) => (
          <LinearGradient key={item.title} colors={item.colors} style={s.inspirationCard}>
            <View style={s.inspirationIcon}><Ionicons name={item.icon} size={24} color={colors.paper} /></View>
            <View><Text style={s.inspirationTitle}>{item.title}</Text><Text style={s.inspirationSubtitle}>{item.subtitle}</Text></View>
          </LinearGradient>
        ))}
      </ScrollView>

      <View style={s.supportCard}>
        <View style={s.supportIllustration}><Ionicons name="headset" size={34} color={colors.maroon} /></View>
        <View style={s.supportCopy}><Text style={s.supportTitle}>Talk to our care team</Text><Text style={s.supportText}>We are here for you, every day.</Text></View>
        <TouchableOpacity style={s.supportButton} onPress={() => Linking.openURL(SUPPORT)}><Text style={s.supportButtonText}>Chat</Text></TouchableOpacity>
      </View>

      <LinearGradient colors={['#FFF3D2', '#F9E6DF']} style={s.journeyCard}>
        <View style={s.journeyCopy}>
          <Text style={s.eyebrow}>YOUR PREGNANCY JOURNEY</Text>
          <Text style={s.journeyTitle}>Week {user.currentWeek || 1}</Text>
          <Text style={s.journeyText}>Your baby is approximately {baby?.size || 'growing beautifully'}.</Text>
          <View style={s.metaRow}><Text style={s.metaText}>Trimester {user.currentTrimester || 1}</Text><Text style={s.metaText}>Day {user.pregnancyDay || 1} of 280</Text></View>
        </View>
        <View style={s.journeyOrb}><Ionicons name="heart" size={42} color={colors.maroon} /></View>
      </LinearGradient>

      <SectionTitle title="Explore your Divine space" action="View all" onPress={() => onNavigate('learn')} />
      <View style={s.quickGrid}>
        {quickActions.map((item) => (
          <TouchableOpacity key={item.title} style={[s.quickCard, { backgroundColor: item.tone }]} onPress={() => onNavigate(item.tab)}>
            <View style={s.quickIcon}><Ionicons name={item.icon} size={24} color={colors.maroon} /></View>
            <Text style={s.quickTitle}>{item.title}</Text><Text style={s.quickSubtitle}>{item.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <SectionTitle title="Today for you" action="Calendar" onPress={() => onNavigate('tools')} />
      <View style={s.dailyCard}>
        {contentLoading ? <ActivityIndicator color={colors.maroon} /> : (
          <>
            <View style={s.dailyTop}><View style={s.dailyIcon}><Ionicons name="sunny-outline" size={25} color={colors.saffron} /></View><Text style={s.dailyCategory}>{content?.category || 'DAILY RITUAL'}</Text></View>
            <Text style={s.dailyTitle}>{content?.title || 'A quiet moment with your baby'}</Text>
            <Text style={s.dailyBody} numberOfLines={4}>{content?.body || 'Sit comfortably, take five slow breaths and share one loving thought with your baby.'}</Text>
            {content?.mediaUrl ? <TouchableOpacity style={s.openButton} onPress={() => Linking.openURL(content.mediaUrl)}><Ionicons name="play" size={16} color={colors.paper} /><Text style={s.openButtonText}>Start session</Text></TouchableOpacity> : null}
          </>
        )}
      </View>

      <View style={s.planCard}>
        <View style={s.planBadge}><Ionicons name="diamond-outline" size={22} color={colors.saffron} /></View>
        <Text style={s.planTitle}>Divine Complete Programme</Text>
        <Text style={s.planText}>Daily activities, meditation, yoga, diet guidance and expert sessions in one organised journey.</Text>
        <TouchableOpacity style={s.planButton} onPress={() => Linking.openURL(SUPPORT)}><Text style={s.planButtonText}>Explore programme</Text><Ionicons name="arrow-forward" size={16} color={colors.paper} /></TouchableOpacity>
      </View>

      <SectionTitle title="Mothers share their journey" />
      <View style={s.testimonial}><Text style={s.quote}>“</Text><Text style={s.testimonialText}>The daily guidance helped me feel calmer, more connected and confident throughout my pregnancy.</Text><Text style={s.testimonialName}>A Divine mother · Surat</Text></View>
    </View>
  );
}

function SectionTitle({ title, action, onPress }) {
  return <View style={s.sectionHeader}><Text style={s.sectionTitle}>{title}</Text>{action ? <TouchableOpacity onPress={onPress}><Text style={s.sectionAction}>{action}</Text></TouchableOpacity> : null}</View>;
}

const s = StyleSheet.create({
  screen: { gap: 18 },
  rail: { gap: 12, paddingRight: 16 },
  inspirationCard: { width: 164, minHeight: 176, padding: 16, borderRadius: 22, justifyContent: 'space-between', overflow: 'hidden' },
  inspirationIcon: { width: 44, height: 44, borderRadius: 16, backgroundColor: 'rgba(255,255,255,.16)', alignItems: 'center', justifyContent: 'center' },
  inspirationTitle: { color: colors.paper, fontSize: 17, fontWeight: '900' },
  inspirationSubtitle: { color: 'rgba(255,255,255,.78)', fontSize: 11, lineHeight: 15, marginTop: 5 },
  supportCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 20, backgroundColor: '#E8F4ED', borderWidth: 1, borderColor: '#D4EBDD' },
  supportIllustration: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' },
  supportCopy: { flex: 1 }, supportTitle: { color: colors.maroonDark, fontSize: 14, fontWeight: '900' }, supportText: { color: colors.muted, fontSize: 10, marginTop: 3 },
  supportButton: { paddingHorizontal: 15, paddingVertical: 10, backgroundColor: colors.success, borderRadius: 12 }, supportButtonText: { color: colors.paper, fontSize: 11, fontWeight: '900' },
  journeyCard: { minHeight: 190, borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' }, journeyCopy: { flex: 1, zIndex: 2 },
  eyebrow: { color: colors.saffron, fontSize: 9, fontWeight: '900', letterSpacing: 1 }, journeyTitle: { color: colors.maroonDark, fontSize: 29, fontWeight: '900', marginTop: 7 }, journeyText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 5, maxWidth: 210 },
  metaRow: { flexDirection: 'row', gap: 7, marginTop: 14 }, metaText: { color: colors.maroon, backgroundColor: 'rgba(255,255,255,.7)', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 10, fontSize: 9, fontWeight: '800' },
  journeyOrb: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,.72)', borderWidth: 8, borderColor: 'rgba(255,255,255,.42)' },
  sectionHeader: { marginTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, sectionTitle: { color: colors.maroonDark, fontSize: 18, fontWeight: '900', letterSpacing: -.3 }, sectionAction: { color: colors.saffron, fontSize: 11, fontWeight: '800' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }, quickCard: { width: '48.2%', minHeight: 136, padding: 15, borderRadius: 20 }, quickIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: 'rgba(255,255,255,.72)', alignItems: 'center', justifyContent: 'center' }, quickTitle: { color: colors.maroonDark, fontSize: 13, fontWeight: '900', marginTop: 12 }, quickSubtitle: { color: colors.muted, fontSize: 9, lineHeight: 13, marginTop: 3 },
  dailyCard: { padding: 18, borderRadius: 22, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, ...shadows.card }, dailyTop: { flexDirection: 'row', alignItems: 'center', gap: 10 }, dailyIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.softSaffron }, dailyCategory: { color: colors.saffron, fontSize: 9, fontWeight: '900', letterSpacing: .8, textTransform: 'uppercase' }, dailyTitle: { color: colors.maroonDark, fontSize: 17, fontWeight: '900', marginTop: 14 }, dailyBody: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 7 }, openButton: { alignSelf: 'flex-start', marginTop: 14, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.maroon }, openButtonText: { color: colors.paper, fontSize: 11, fontWeight: '900' },
  planCard: { padding: 21, borderRadius: 24, backgroundColor: colors.softMaroon, borderWidth: 1, borderColor: '#EBCFD4' }, planBadge: { width: 44, height: 44, borderRadius: 16, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' }, planTitle: { color: colors.maroon, fontSize: 20, fontWeight: '900', marginTop: 14 }, planText: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 7 }, planButton: { minHeight: 46, marginTop: 17, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.maroon }, planButtonText: { color: colors.paper, fontSize: 12, fontWeight: '900' },
  testimonial: { padding: 22, borderRadius: 24, backgroundColor: '#E4F3F8', overflow: 'hidden' }, quote: { color: colors.saffron, fontSize: 54, lineHeight: 42, fontWeight: '900' }, testimonialText: { color: colors.maroonDark, fontSize: 14, lineHeight: 22, fontWeight: '600' }, testimonialName: { color: colors.maroon, fontSize: 11, fontWeight: '900', marginTop: 14 },
});
