import React from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMutation } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { SAVE_ONBOARDING_MUTATION } from '../graphql/operations';
import { colors, shadows } from '../theme/theme.js';

const WEBSITE = 'https://www.thedivinegarbhsanskar.com';
const SUPPORT = 'https://wa.me/919638484545?text=Hello%20Divine%20support%2C%20I%20need%20help.';

export default function MobileSettings({ user, refetch, onNavigate, onSignOut }) {
  const [saveOnboarding] = useMutation(SAVE_ONBOARDING_MUTATION, { onCompleted: () => refetch() });
  const plan = user.subscriptionStatus && user.subscriptionStatus !== 'free' ? user.subscriptionStatus : 'Explore';
  const initials = (user.displayName || user.firstName || 'D').charAt(0).toUpperCase();

  const changeLanguage = async (language) => {
    try {
      await saveOnboarding({ variables: { lmpDate: user.lmpDate, dueDate: user.dueDate, language } });
    } catch (error) {
      Alert.alert('Unable to update language', error.message);
    }
  };

  const tiles = [
    { title: 'Saved', icon: 'bookmark-outline', tone: '#DDF1FA', action: () => onNavigate('learn') },
    { title: 'About us', icon: 'information-circle-outline', tone: '#F9E8E8', action: () => Linking.openURL(WEBSITE) },
    { title: 'Support', icon: 'chatbubbles-outline', tone: '#FFF0D3', action: () => Linking.openURL(SUPPORT) },
    { title: 'Programme', icon: 'ribbon-outline', tone: '#DDF2E4', action: () => onNavigate('tools') },
    { title: 'Community', icon: 'people-outline', tone: '#EFE1FA', action: () => onNavigate('community') },
    { title: 'Career', icon: 'briefcase-outline', tone: '#F9E1EF', action: () => Linking.openURL(`${WEBSITE}/contact`) },
  ];

  return (
    <View style={s.screen}>
      <View style={s.brandBand}>
        <Text style={s.profileHeading}>My profile</Text>
        <View style={s.brandRow}><Ionicons name="heart" size={27} color={colors.saffron} /><Text style={s.brandName}>Divine <Text style={{ color: colors.saffron }}>Garbh Sanskar</Text></Text></View>
      </View>

      <View style={s.profileCard}>
        <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
        <View style={s.profileCopy}><Text style={s.name}>{user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Divine Mother'}</Text><Text style={s.contact}>{user.emailAddress}</Text></View>
        <View style={s.statDivider} />
        <View style={s.stats}>
          <View style={s.stat}><Ionicons name="calendar-outline" size={23} color={colors.maroon} /><View><Text style={s.statLabel}>Pregnancy</Text><Text style={s.statValue}>Week {user.currentWeek || 1}</Text></View></View>
          <View style={s.stat}><Ionicons name="diamond-outline" size={23} color={colors.saffron} /><View><Text style={s.statLabel}>Current plan</Text><Text style={s.statValue}>{plan}</Text></View></View>
        </View>
      </View>

      <View style={s.tileGrid}>{tiles.map((tile) => <TouchableOpacity key={tile.title} style={[s.tile, { backgroundColor: tile.tone }]} onPress={tile.action}><Ionicons name={tile.icon} size={25} color={colors.maroon} /><Text style={s.tileText}>{tile.title}</Text></TouchableOpacity>)}</View>

      <View style={s.listCard}>
        <Text style={s.listTitle}>Language</Text>
        <View style={s.languageRow}>{[['en', 'English'], ['hi', 'हिन्दी'], ['gu', 'ગુજરાતી']].map(([code, label]) => <TouchableOpacity key={code} style={[s.language, user.language === code && s.languageActive]} onPress={() => changeLanguage(code)}><Text style={[s.languageText, user.language === code && s.languageTextActive]}>{label}</Text></TouchableOpacity>)}</View>
      </View>

      <View style={s.listCard}>
        <SettingsRow icon="shield-checkmark-outline" label="Privacy & data help" onPress={() => Linking.openURL(`${WEBSITE}/contact`)} />
        <SettingsRow icon="document-text-outline" label="Terms & programme details" onPress={() => Linking.openURL(`${WEBSITE}/contact`)} />
        <SettingsRow icon="log-out-outline" label="Sign out" danger onPress={onSignOut} last />
      </View>
      <Text style={s.version}>Divine Garbh Sanskar · Version 1.1.0</Text>
    </View>
  );
}

function SettingsRow({ icon, label, onPress, danger, last }) {
  return <TouchableOpacity style={[s.row, last && { borderBottomWidth: 0 }]} onPress={onPress}><View style={s.rowIcon}><Ionicons name={icon} size={20} color={danger ? colors.error : colors.maroon} /></View><Text style={[s.rowLabel, danger && { color: colors.error }]}>{label}</Text><Ionicons name="chevron-forward" size={18} color={colors.muted} /></TouchableOpacity>;
}

const s = StyleSheet.create({
  screen: { gap: 16 },
  brandBand: { marginHorizontal: -16, marginTop: -10, paddingHorizontal: 22, paddingTop: 24, paddingBottom: 70, backgroundColor: colors.maroon },
  profileHeading: { color: colors.paper, fontSize: 18, fontWeight: '900' }, brandRow: { marginTop: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9 }, brandName: { color: colors.paper, fontSize: 23, fontWeight: '900' },
  profileCard: { marginTop: -64, padding: 20, borderRadius: 26, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, ...shadows.card },
  avatar: { width: 78, height: 78, marginTop: -56, borderRadius: 30, backgroundColor: colors.softSaffron, borderWidth: 7, borderColor: colors.paper, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.maroon, fontSize: 30, fontWeight: '900' },
  profileCopy: { marginTop: 8 }, name: { color: colors.maroonDark, fontSize: 18, fontWeight: '900' }, contact: { color: colors.muted, fontSize: 11, marginTop: 4 }, statDivider: { height: 1, backgroundColor: colors.line, marginVertical: 18 }, stats: { flexDirection: 'row', justifyContent: 'space-between' }, stat: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 10 }, statLabel: { color: colors.muted, fontSize: 9 }, statValue: { color: colors.maroonDark, fontSize: 13, fontWeight: '900', marginTop: 2 },
  tileGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 }, tile: { width: '31.5%', minHeight: 94, padding: 12, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 8 }, tileText: { color: colors.maroonDark, fontSize: 10, fontWeight: '800', textAlign: 'center' },
  listCard: { paddingHorizontal: 15, borderRadius: 22, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line }, listTitle: { color: colors.maroonDark, fontSize: 13, fontWeight: '900', marginTop: 16 }, languageRow: { flexDirection: 'row', gap: 7, marginVertical: 14 }, language: { flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center', borderWidth: 1, borderColor: colors.line }, languageActive: { backgroundColor: colors.maroon, borderColor: colors.maroon }, languageText: { color: colors.muted, fontSize: 10, fontWeight: '800' }, languageTextActive: { color: colors.paper },
  row: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: colors.line }, rowIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.canvas }, rowLabel: { flex: 1, color: colors.maroonDark, fontSize: 12, fontWeight: '700' }, version: { color: colors.muted, fontSize: 9, textAlign: 'center' },
});
