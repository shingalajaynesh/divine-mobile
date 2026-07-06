import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useQuery } from '@apollo/client';
import { GET_CONTENT_LIBRARY_QUERY } from '../graphql/operations';
import { styles } from '../components/styles.js';

export default function MobileLibrary({ t }) {
  const [category, setCategory] = useState('yoga');
  const { data, loading } = useQuery(GET_CONTENT_LIBRARY_QUERY, {
    variables: { category }
  });

  const categories = [
    { id: 'story', label: '📖 Stories' },
    { id: 'video', label: '🎥 Videos' },
    { id: 'music', label: '🎵 Lullabies' },
    { id: 'yoga', label: '🧘‍♀️ Yoga' },
    { id: 'recipe', label: '🥗 Recipes' },
    { id: 'mantra', label: '🕉️ Mantras' },
    { id: 'article', label: '📚 Articles' }
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>📚 Content Library</Text>
      
      {/* Category grid selection */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
        <View style={{ flexDirection: 'row', gap: 8, paddingBottom: 6 }}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.libraryCategoryTab, category === cat.id && styles.libraryCategoryTabActive]}
              onPress={() => setCategory(cat.id)}
            >
              <Text style={[styles.libraryCategoryText, category === cat.id && styles.libraryCategoryTextActive]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="small" color="#f97316" style={{ marginVertical: 20 }} />
      ) : data?.getContentLibrary && data.getContentLibrary.length > 0 ? (
        <View style={{ gap: 12, marginTop: 10 }}>
          {data.getContentLibrary.map((item) => (
            <View key={item.id} style={styles.libraryItemCard}>
              <Text style={styles.libraryItemDay}>DAY {item.dayNumber}</Text>
              <Text style={styles.libraryItemTitle}>{item.title}</Text>
              <Text style={styles.libraryItemBody}>{item.body}</Text>
              {item.mediaUrl && (
                <TouchableOpacity onPress={() => Linking.openURL(item.mediaUrl)}>
                  <Text style={styles.libraryItemLink}>Open Attachment →</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>No content uploaded under this category yet.</Text>
      )}
    </View>
  );
}
