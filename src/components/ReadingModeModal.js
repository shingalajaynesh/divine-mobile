import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, ScrollView, Share, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/theme.js';

export default function ReadingModeModal({ visible, onClose, title, body, translations, lang }) {
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState('sepia'); // light, sepia, dark
  const [bilingual, setBilingual] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSize = await AsyncStorage.getItem('m_reader_font_size');
        const storedTheme = await AsyncStorage.getItem('m_reader_theme');
        const storedBilingual = await AsyncStorage.getItem('m_reader_bilingual');

        if (storedSize) setFontSize(parseInt(storedSize));
        if (storedTheme) setTheme(storedTheme);
        if (storedBilingual) setBilingual(storedBilingual === 'true');
      } catch (e) {
        console.warn('Load settings error:', e);
      }
    };
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  // Persist settings
  const saveSetting = async (key, val) => {
    try {
      await AsyncStorage.setItem(key, val);
    } catch (e) {
      console.warn('Save setting error:', e);
    }
  };

  const changeFontSize = (delta) => {
    const newSize = Math.max(14, Math.min(30, fontSize + delta));
    setFontSize(newSize);
    saveSetting('m_reader_font_size', newSize.toString());
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    saveSetting('m_reader_theme', newTheme);
  };

  const toggleBilingual = () => {
    const newBilingual = !bilingual;
    setBilingual(newBilingual);
    saveSetting('m_reader_bilingual', newBilingual.toString());
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${title}\n\n${body}`,
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Theme Style helper
  const getThemeColors = () => {
    switch (theme) {
      case 'sepia':
        return {
          bg: '#f4ecd8',
          text: '#433422',
          border: '#e6dfcf',
          heading: '#2c1e11',
          headerBg: '#e6dfcf'
        };
      case 'dark':
        return {
          bg: '#121212',
          text: '#e2e8f0',
          border: '#2d3748',
          heading: '#ffffff',
          headerBg: '#1a202c'
        };
      case 'light':
      default:
        return {
          bg: '#ffffff',
          text: '#2d3748',
          border: '#edf2f7',
          heading: '#1a202c',
          headerBg: '#edf2f7'
        };
    }
  };

  const c = getThemeColors();

  const currentLang = lang || 'en';
  const otherLang = currentLang === 'en' ? 'hi' : 'en';
  const otherTranslation = translations?.find(t => t.language === otherLang);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[s.container, { backgroundColor: c.bg }]}>
        {/* Controls Header */}
        <View style={[s.header, { backgroundColor: c.headerBg, borderBottomColor: c.border }]}>
          <TouchableOpacity onPress={onClose} style={s.btn}>
            <Ionicons name="arrow-back" size={24} color={c.text} />
          </TouchableOpacity>

          <View style={s.controlRow}>
            {/* Font buttons */}
            <TouchableOpacity onPress={() => changeFontSize(-2)} style={s.controlBtn}>
              <Text style={[s.controlBtnText, { color: c.text, fontSize: 13 }]}>A-</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => changeFontSize(2)} style={s.controlBtn}>
              <Text style={[s.controlBtnText, { color: c.text, fontSize: 17 }]}>A+</Text>
            </TouchableOpacity>

            {/* Theme buttons */}
            <TouchableOpacity onPress={() => changeTheme('light')} style={[s.themeBtn, theme === 'light' && s.activeTheme]}>
              <View style={[s.dot, { backgroundColor: '#ffffff' }]} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => changeTheme('sepia')} style={[s.themeBtn, theme === 'sepia' && s.activeTheme]}>
              <View style={[s.dot, { backgroundColor: '#f4ecd8' }]} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => changeTheme('dark')} style={[s.themeBtn, theme === 'dark' && s.activeTheme]}>
              <View style={[s.dot, { backgroundColor: '#121212' }]} />
            </TouchableOpacity>

            {/* Bilingual */}
            {translations?.length > 1 && (
              <TouchableOpacity onPress={toggleBilingual} style={[s.controlBtn, bilingual && s.activeBilingual]}>
                <Ionicons name="language" size={16} color={bilingual ? colors.paper : c.text} />
              </TouchableOpacity>
            )}

            {/* Share */}
            <TouchableOpacity onPress={handleShare} style={s.controlBtn}>
              <Ionicons name="share-social-outline" size={18} color={c.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Story Text Scroll View */}
        <ScrollView contentContainerStyle={s.scrollContent}>
          <Text style={[s.titleText, { color: c.heading, fontSize: fontSize + 4 }]}>
            {title}
          </Text>

          {bilingual && otherTranslation ? (
            <View style={{ gap: 20 }}>
              <View style={[s.parallelBlock, { borderLeftColor: colors.saffron }]}>
                <Text style={s.langTag}>{currentLang === 'hi' ? 'हिंदी (Hindi)' : 'English'}</Text>
                <Text style={[s.bodyText, { color: c.text, fontSize }]}>
                  {body}
                </Text>
              </View>

              <View style={[s.parallelBlock, { borderLeftColor: '#38bdf8' }]}>
                <Text style={s.langTag}>{otherLang === 'hi' ? 'हिंदी (Hindi)' : 'English'}</Text>
                <Text style={[s.titleText, { color: c.heading, fontSize: fontSize + 2, textAlign: 'left', marginBottom: 10 }]}>
                  {otherTranslation.title}
                </Text>
                <Text style={[s.bodyText, { color: c.text, fontSize }]}>
                  {otherTranslation.body}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={[s.bodyText, { color: c.text, fontSize }]}>
              {body}
            </Text>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  btn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  controlRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  controlBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32
  },
  controlBtnText: { fontWeight: '700' },
  themeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center'
  },
  activeTheme: { borderColor: colors.saffron, borderWidth: 2 },
  activeBilingual: { backgroundColor: colors.saffron, borderColor: colors.saffron },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 0.5, borderColor: '#94a3b8' },
  scrollContent: { padding: 24, paddingBottom: 60 },
  titleText: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'serif'
  },
  bodyText: {
    lineHeight: 30,
    textAlign: 'justify',
    fontFamily: 'serif'
  },
  parallelBlock: {
    paddingLeft: 12,
    borderLeftWidth: 4,
    marginBottom: 16
  },
  langTag: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: 6
  }
});
