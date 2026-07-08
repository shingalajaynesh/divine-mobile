import React, { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { 
  CLEAR_RECENT_CONTENT_SEARCHES_MUTATION, 
  CONTENT_FEED_QUERY, 
  RECENT_CONTENT_SEARCHES_QUERY, 
  SAVED_CONTENT_QUERY, 
  SEARCH_CONTENT_QUERY, 
  SET_CONTENT_BOOKMARK_MUTATION,
  GET_RECOMMENDED_CONTENT_FEED_QUERY,
  GET_MY_LEARNING_PATHS_QUERY
} from '../graphql/operations.js';
import { colors, shadows } from '../theme/theme.js';

const filters = [['', 'All'], ['story', 'Stories'], ['audio', 'Audio'], ['video', 'Video'], ['meditation', 'Meditation'], ['yoga', 'Yoga'], ['affirmation', 'Affirmations']];
const views = [['explore', 'Explore'], ['paths', 'Paths'], ['bookmark', 'Saved'], ['watch_later', 'Watch later']];

export default function MobileLibrary({ lang = 'en' }) {
  const [type, setType] = useState('');
  const [view, setView] = useState('explore');
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [notice, setNotice] = useState('');
  
  const feed = useQuery(CONTENT_FEED_QUERY, { variables: { language: lang, contentType: type || null }, skip: view !== 'explore' || Boolean(activeQuery) });
  const [search, searchState] = useLazyQuery(SEARCH_CONTENT_QUERY, { fetchPolicy: 'network-only' });
  const recent = useQuery(RECENT_CONTENT_SEARCHES_QUERY, { fetchPolicy: 'cache-and-network' });
  const saved = useQuery(SAVED_CONTENT_QUERY, { variables: { kind: view, language: lang }, skip: ['explore', 'paths'].includes(view), fetchPolicy: 'cache-and-network' });
  
  const recommendedFeed = useQuery(GET_RECOMMENDED_CONTENT_FEED_QUERY, {
    variables: { language: lang, limit: 10 },
    skip: view !== 'explore',
    fetchPolicy: 'cache-and-network'
  });
  const learningPaths = useQuery(GET_MY_LEARNING_PATHS_QUERY, {
    variables: { language: lang },
    skip: view !== 'paths',
    fetchPolicy: 'cache-and-network'
  });

  const [setBookmark, bookmarkState] = useMutation(SET_CONTENT_BOOKMARK_MUTATION);
  const [clearRecent] = useMutation(CLEAR_RECENT_CONTENT_SEARCHES_MUTATION);
  
  const runSearch = (value = query) => {
    const clean = value.trim();
    if (clean.length < 2) return;
    setQuery(clean); setActiveQuery(clean); setView('explore');
    search({ variables: { query: clean, language: lang, contentType: type || null } }).then(() => recent.refetch());
  };

  const items = useMemo(() => {
    if (['paths'].includes(view)) return [];
    return view !== 'explore' ? saved.data?.savedContent : activeQuery ? searchState.data?.searchContent : feed.data?.contentFeed;
  }, [view, saved.data, activeQuery, searchState.data, feed.data]);

  const loading = ['paths'].includes(view) ? false : (view !== 'explore' ? saved.loading : activeQuery ? searchState.loading : feed.loading);
  const error = ['paths'].includes(view) ? null : (view !== 'explore' ? saved.error : activeQuery ? searchState.error : feed.error);
  const save = async (contentItemId, kind, savedValue = true) => {
    await setBookmark({ variables: { input: { contentItemId, kind, saved: savedValue } } });
    setNotice(savedValue ? (kind === 'watch_later' ? 'Added to watch later.' : 'Saved to bookmarks.') : 'Removed from your saved list.');
    if (view !== 'explore') saved.refetch();
  };

  return <View style={s.screen}><Text style={s.eyebrow}>DIVINE LIBRARY</Text><Text style={s.heading}>Learn, listen and connect</Text><Text style={s.intro}>Search original guidance and keep favourites close.</Text>
    <View style={s.search}><TextInput style={s.searchInput} value={query} onChangeText={setQuery} onSubmitEditing={() => runSearch()} returnKeyType="search" placeholder="Search meditation, stories, yoga…" placeholderTextColor={colors.muted} /><TouchableOpacity accessibilityLabel="Search library" style={s.searchButton} onPress={() => runSearch()}><Ionicons name="search" size={20} color={colors.paper} /></TouchableOpacity></View>
    {recent.data?.recentContentSearches?.length ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.recent}>{recent.data.recentContentSearches.slice(0, 5).map((item) => <TouchableOpacity key={item.id} style={s.recentChip} onPress={() => runSearch(item.query)}><Text style={s.recentText}>{item.query}</Text></TouchableOpacity>)}<TouchableOpacity style={s.clearChip} onPress={async () => { await clearRecent(); recent.refetch(); }}><Text style={s.clearText}>Clear</Text></TouchableOpacity></ScrollView> : null}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>{views.map(([value,label]) => <TouchableOpacity key={value} style={[s.filter, view === value && s.filterActive]} onPress={() => { setView(value); if (value !== 'explore') setActiveQuery(''); }}><Text style={[s.filterText, view === value && s.filterTextActive]}>{label}</Text></TouchableOpacity>)}</ScrollView>
    {view === 'explore' ? <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>{filters.map(([value,label]) => <TouchableOpacity key={label} style={[s.filter, type === value && s.filterActive]} onPress={() => { setType(value); if (activeQuery) search({ variables: { query: activeQuery, language: lang, contentType: value || null } }); }}><Text style={[s.filterText, type === value && s.filterTextActive]}>{label}</Text></TouchableOpacity>)}</ScrollView> : null}
    {notice ? <Text accessibilityRole="alert" style={s.notice}>{notice}</Text> : null}
    {view === 'paths' ? (
      learningPaths.loading ? (
        <ActivityIndicator color={colors.maroon} style={{ marginTop: 20 }} />
      ) : learningPaths.data?.myLearningPaths?.length ? (
        <View style={s.grid}>
          {learningPaths.data.myLearningPaths.map((path) => (
            <View key={path.id} style={s.card}>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 24 }}>{path.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.title, { marginTop: 0, fontSize: 15 }]}>{path.title}</Text>
                  <Text style={{ fontSize: 11, color: colors.muted }}>{path.items.length} milestones</Text>
                </View>
              </View>
              <Text style={[s.body, { marginTop: 10 }]}>{path.description}</Text>
              
              <View style={{ marginVertical: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: colors.maroon }}>Progress</Text>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: colors.maroon }}>{path.progressPercent}%</Text>
                </View>
                <View style={{ height: 6, backgroundColor: colors.line, borderRadius: 3, overflow: 'hidden' }}>
                  <View style={{ width: `${path.progressPercent}%`, height: '100%', backgroundColor: colors.maroon }} />
                </View>
              </View>

              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.maroonDark, marginBottom: 6 }}>Curriculum:</Text>
              {path.items.map((item, idx) => (
                <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.line }}>
                  <Text style={{ fontSize: 11, color: item.completed ? colors.muted : colors.maroonDark, textDecorationLine: item.completed ? 'line-through' : 'none', flex: 1, marginRight: 8 }}>
                    {item.completed ? '✓ ' : `${idx + 1}. `}{item.translation?.title}
                  </Text>
                  <Text style={{ fontSize: 9, color: colors.saffron, fontWeight: '800', textTransform: 'uppercase' }}>
                    {item.contentType}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      ) : (
        <Text style={s.empty}>No learning paths currently configured.</Text>
      )
    ) : (
      <View style={{ gap: 12 }}>
        {view === 'explore' && !activeQuery && recommendedFeed.data?.recommendedContentFeed?.length > 0 ? (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '900', color: colors.maroonDark, marginBottom: 8 }}>✨ Recommended for You</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 6 }}>
              {recommendedFeed.data.recommendedContentFeed.map(item => (
                <View key={item.id} style={[s.card, { width: 260, marginRight: 8 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={s.category}>{item.category?.name || item.contentType}</Text>
                    {item.completed && <Text style={{ fontSize: 9, color: colors.success, fontWeight: '800' }}>✓ Completed</Text>}
                  </View>
                  <Text style={[s.title, { fontSize: 13, minHeight: 34 }]} numberOfLines={2}>{item.translation?.title}</Text>
                  <Text style={[s.body, { minHeight: 48 }]} numberOfLines={3}>{item.translation?.summary || item.translation?.body}</Text>
                  <View style={s.actions}>
                    <TouchableOpacity disabled={bookmarkState.loading} style={[s.action, { paddingVertical: 6 }]} onPress={() => save(item.id, 'bookmark')}>
                      <Ionicons name="bookmark-outline" size={12} color={colors.maroon} />
                    </TouchableOpacity>
                    {['video','audio'].includes(item.contentType) && (
                      <TouchableOpacity disabled={bookmarkState.loading} style={[s.action, { paddingVertical: 6 }]} onPress={() => save(item.id, 'watch_later')}>
                        <Ionicons name="time-outline" size={12} color={colors.maroon} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
            <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 12 }} />
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator color={colors.maroon} />
        ) : error ? (
          <Text style={s.empty}>Library could not be loaded.</Text>
        ) : items?.length ? (
          <View style={s.grid}>
            {items.map((item) => (
              <View key={item.id} style={s.card}>
                <View style={s.icon}>
                  <Ionicons name={item.contentType === 'audio' ? 'headset-outline' : item.contentType === 'video' ? 'play-outline' : 'book-outline'} size={22} color={colors.maroon} />
                </View>
                <Text style={s.category}>{item.category?.name || item.contentType}</Text>
                <Text style={s.title}>{item.translation?.title}</Text>
                <Text style={s.body} numberOfLines={4}>{item.translation?.summary || item.translation?.body}</Text>
                <Text style={s.access}>{item.visibility === 'free' ? 'Included' : `${item.visibility} access`}</Text>
                <View style={s.actions}>
                  {view === 'explore' ? (
                    <>
                      <TouchableOpacity disabled={bookmarkState.loading} style={s.action} onPress={() => save(item.id, 'bookmark')}>
                        <Ionicons name="bookmark-outline" size={15} color={colors.maroon} />
                        <Text style={s.actionText}>Save</Text>
                      </TouchableOpacity>
                      {['video','audio'].includes(item.contentType) ? (
                        <TouchableOpacity disabled={bookmarkState.loading} style={s.action} onPress={() => save(item.id, 'watch_later')}>
                          <Ionicons name="time-outline" size={15} color={colors.maroon} /><Text style={s.actionText}>Later</Text>
                        </TouchableOpacity>
                      ) : null}
                    </>
                  ) : (
                    <TouchableOpacity disabled={bookmarkState.loading} style={s.removeAction} onPress={() => save(item.id, view, false)}>
                      <Text style={s.removeText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={s.empty}>{activeQuery ? `No results for “${activeQuery}”.` : 'No saved content yet.'}</Text>
        )}
      </View>
    )}
  </View>;
}

const s = StyleSheet.create({ screen:{gap:12},eyebrow:{color:colors.saffron,fontSize:9,fontWeight:'900',letterSpacing:1},heading:{color:colors.maroonDark,fontSize:26,fontWeight:'900'},intro:{color:colors.muted,fontSize:12,lineHeight:18},search:{flexDirection:'row',borderWidth:1,borderColor:colors.line,borderRadius:16,backgroundColor:colors.paper,overflow:'hidden'},searchInput:{flex:1,paddingHorizontal:14,paddingVertical:12,color:colors.maroonDark,fontSize:13},searchButton:{width:48,alignItems:'center',justifyContent:'center',backgroundColor:colors.maroon},recent:{gap:7},recentChip:{paddingHorizontal:11,paddingVertical:7,borderRadius:999,backgroundColor:colors.softSaffron},recentText:{color:colors.maroon,fontSize:9,fontWeight:'800'},clearChip:{paddingHorizontal:11,paddingVertical:7},clearText:{color:colors.muted,fontSize:9,fontWeight:'800'},filters:{gap:8,paddingVertical:4},filter:{paddingHorizontal:14,paddingVertical:9,borderRadius:999,backgroundColor:colors.paper,borderWidth:1,borderColor:colors.line},filterActive:{backgroundColor:colors.maroon,borderColor:colors.maroon},filterText:{color:colors.muted,fontSize:10,fontWeight:'800'},filterTextActive:{color:colors.paper},notice:{color:colors.success,backgroundColor:'#edf8f0',padding:10,borderRadius:12,fontSize:10,fontWeight:'800'},grid:{gap:12},card:{padding:18,borderRadius:21,backgroundColor:colors.paper,borderWidth:1,borderColor:colors.line,...shadows.card},icon:{width:42,height:42,borderRadius:14,alignItems:'center',justifyContent:'center',backgroundColor:colors.softSaffron},category:{color:colors.saffron,fontSize:9,fontWeight:'900',textTransform:'uppercase',marginTop:12},title:{color:colors.maroonDark,fontSize:16,fontWeight:'900',marginTop:5},body:{color:colors.muted,fontSize:11,lineHeight:17,marginTop:6},access:{color:colors.success,fontSize:9,fontWeight:'900',marginTop:12},actions:{flexDirection:'row',gap:8,marginTop:13},action:{flexDirection:'row',alignItems:'center',gap:5,paddingHorizontal:11,paddingVertical:8,borderRadius:11,backgroundColor:colors.softSaffron},actionText:{color:colors.maroon,fontSize:9,fontWeight:'900'},removeAction:{paddingHorizontal:12,paddingVertical:8,borderRadius:11,backgroundColor:'#fff0f0'},removeText:{color:'#a33',fontSize:9,fontWeight:'900'},empty:{color:colors.muted,textAlign:'center',marginTop:30} });
