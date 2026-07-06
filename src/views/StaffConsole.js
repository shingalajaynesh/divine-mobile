import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, List } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { gql } from '@apollo/client';
import { colors, shadows } from '../theme/theme.js';

const GET_CRM_USERS_QUERY = gql`
  query GetCrmUsers {
    getCrmUsers {
      id
      displayName
      email
      phone
      pregnancyStartDate
      pregnancyDay
    }
  }
`;

const GET_CRM_NOTES_QUERY = gql`
  query GetCrmNotes($userId: ID!) {
    getCrmNotes(userId: $userId) {
      id
      note
      createdAt
      author {
        displayName
      }
    }
  }
`;

const ADD_CRM_NOTE_MUTATION = gql`
  mutation AddCrmNote($userId: ID!, $note: String!) {
    addCrmNote(userId: $userId, note: $note) {
      id
      note
    }
  }
`;

export default function MobileStaffConsole({ user }) {
  const [crmSearch, setCrmSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [newNote, setNewNote] = useState('');

  // Queries & Mutations
  const { data, loading, refetch } = useQuery(GET_CRM_USERS_QUERY);
  const notesQuery = useQuery(GET_CRM_NOTES_QUERY, {
    variables: { userId: selectedUser?.id },
    skip: !selectedUser
  });
  const [addCrmNote] = useMutation(ADD_CRM_NOTE_MUTATION, {
    onCompleted: () => {
      notesQuery.refetch();
      setNewNote('');
      Alert.alert('Success', 'Clinical coaching note added');
    }
  });

  const crmUsers = data?.getCrmUsers || [];
  const crmNotes = notesQuery.data?.getCrmNotes || [];

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedUser) return;
    try {
      await addCrmNote({ variables: { userId: selectedUser.id, note: newNote.trim() } });
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const filteredUsers = crmUsers.filter(u => {
    const q = crmSearch.toLowerCase();
    return u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.hero}>
        <Text style={s.heroTitle}>🩺 Staff Console</Text>
        <Text style={s.heroSubtitle}>Clinical coaching, pregnancy CRM directory, and member files.</Text>
      </View>

      {selectedUser ? (
        <View style={s.card}>
          <TouchableOpacity style={s.backBtn} onPress={() => setSelectedUser(null)}>
            <Ionicons name="arrow-back" size={16} color={colors.maroon} />
            <Text style={s.backText}>Back to Directory</Text>
          </TouchableOpacity>

          <Text style={s.patientName}>{selectedUser.displayName}</Text>
          <Text style={{ fontSize: 11, color: colors.muted }}>{selectedUser.email} · Day {selectedUser.pregnancyDay}</Text>

          <Divider />

          <Text style={s.sectionTitle}>Add Coaching Note</Text>
          <TextInput 
            style={s.textArea} 
            placeholder="Type clinical adjustments or tips..." 
            value={newNote}
            onChangeText={setNewNote}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity style={s.saveBtn} onPress={handleAddNote}>
            <Text style={s.saveBtnText}>Save Coaching Note</Text>
          </TouchableOpacity>

          <Divider />

          <Text style={s.sectionTitle}>Past Clinical Notes</Text>
          {notesQuery.loading ? (
            <ActivityIndicator color={colors.maroon} />
          ) : crmNotes.length === 0 ? (
            <Text style={s.emptyText}>No coaching notes registered yet.</Text>
          ) : (
            crmNotes.map(n => (
              <View key={n.id} style={s.noteItem}>
                <Text style={s.noteMeta}>{n.author?.displayName} · {new Date(n.createdAt).toLocaleDateString()}</Text>
                <Text style={s.noteText}>"{n.note}"</Text>
              </View>
            ))
          )}
        </View>
      ) : (
        <View>
          <TextInput 
            style={s.input} 
            placeholder="Search directory by name or email..." 
            value={crmSearch}
            onChangeText={setCrmSearch}
          />

          {loading ? (
            <ActivityIndicator color={colors.maroon} style={{ marginVertical: 30 }} />
          ) : (
            filteredUsers.map(u => (
              <TouchableOpacity key={u.id} style={s.userTile} onPress={() => setSelectedUser(u)}>
                <View>
                  <Text style={s.userTileName}>{u.displayName}</Text>
                  <Text style={s.userTileSub}>{u.email} · Day {u.pregnancyDay || 'Not set'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.muted} />
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 14 }} />;
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 20, paddingBottom: 60, gap: 20 },
  hero: { marginBottom: 4 },
  heroTitle: { color: colors.maroonDark, fontSize: 26, fontWeight: '900' },
  heroSubtitle: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  card: { padding: 20, borderRadius: 24, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, ...shadows.card },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  backText: { color: colors.maroon, fontSize: 11, fontWeight: 'bold' },
  patientName: { fontSize: 18, fontWeight: '900', color: colors.maroonDark },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: colors.maroonDark, marginBottom: 8 },
  textArea: { height: 70, borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 8, fontSize: 11, backgroundColor: colors.canvas, color: colors.ink, textAlignVertical: 'top' },
  saveBtn: { height: 36, borderRadius: 8, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveBtnText: { color: colors.paper, fontSize: 11, fontWeight: 'bold' },
  emptyText: { color: colors.muted, fontSize: 11, fontStyle: 'italic', marginVertical: 10 },
  noteItem: { padding: 10, borderRadius: 8, backgroundColor: '#fdfdfd', borderWidth: 1, borderColor: colors.line, marginBottom: 8 },
  noteMeta: { fontSize: 9, fontWeight: 'bold', color: colors.muted },
  noteText: { fontSize: 11, color: colors.ink, marginTop: 2 },
  input: { height: 40, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 8, fontSize: 11, color: colors.ink, backgroundColor: colors.paper, marginBottom: 16 },
  userTile: { padding: 14, borderRadius: 12, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, ...shadows.card },
  userTileName: { fontSize: 12, fontWeight: 'bold', color: colors.ink },
  userTileSub: { fontSize: 10, color: colors.muted, marginTop: 2 }
});
