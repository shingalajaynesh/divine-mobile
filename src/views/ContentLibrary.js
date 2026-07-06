import React, { useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_CONTENT_LIBRARY_QUERY } from '../graphql/operations';
import { styles } from '../components/styles.js';

const categories = [
  ['story', 'Stories'], ['video', 'Videos'], ['music', 'Lullabies'], ['yoga', 'Yoga'], ['recipe', 'Recipes'], ['mantra', 'Mantras'], ['article', 'Articles'],
];

export default function MobileLibrary() {
  const [category, setCategory] = useState('yoga');
  const { data, loading } = useQuery(GET_CONTENT_LIBRARY_QUERY, { variables: { category } });
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Divine learning library</Text>
      <Text style={styles.cardDesc}>Choose stories, practices and expert guidance for your journey.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }} contentContainerStyle={{ gap: 8, paddingBottom: 6 }}>
        {categories.map(([id, label]) => <TouchableOpacity key={id} style={[styles.libraryCategoryTab, category === id && styles.libraryCategoryTabActive]} onPress={() => setCategory(id)}><Text style={[styles.libraryCategoryText, category === id && styles.libraryCategoryTextActive]}>{label}</Text></TouchableOpacity>)}
      </ScrollView>
      {loading ? <ActivityIndicator color="#68111B" /> : data?.getContentLibrary?.length ? <View style={{ gap: 12, marginTop: 10 }}>{data.getContentLibrary.map((item) => <View key={item.id} style={styles.libraryItemCard}><Text style={styles.libraryItemDay}>DAY {item.dayNumber}</Text><Text style={styles.libraryItemTitle}>{item.title}</Text><Text style={styles.libraryItemBody}>{item.body}</Text>{item.mediaUrl ? <TouchableOpacity onPress={() => Linking.openURL(item.mediaUrl)}><Text style={styles.libraryItemLink}>Open content →</Text></TouchableOpacity> : null}</View>)}</View> : <Text style={styles.emptyText}>New content for this category is coming soon.</Text>}
    </View>
  );
}
