import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { 
  GET_SUPPORT_TICKETS_QUERY, 
  CREATE_SUPPORT_TICKET, 
  ADD_SUPPORT_MESSAGE, 
  CLOSE_SUPPORT_TICKET, 
  REQUEST_WHATSAPP_HANDOFF 
} from '../graphql/operations.js';
import { colors, shadows } from '../theme/theme.js';

export default function MobileSupportHub({ user }) {
  const userLang = user?.language || 'en';
  const isHi = userLang === 'hi';

  const [activeTab, setActiveTab] = useState('tickets');
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Queries & Mutations
  const { data, loading, refetch } = useQuery(GET_SUPPORT_TICKETS_QUERY);
  const [createTicket] = useMutation(CREATE_SUPPORT_TICKET, { onCompleted: () => refetch() });
  const [addMessage] = useMutation(ADD_SUPPORT_MESSAGE, {
    onCompleted: (res) => {
      refetch().then(updated => {
        if (selectedTicket) {
          const fresh = updated.data?.getSupportTickets?.find(t => t.id === selectedTicket.id);
          if (fresh) setSelectedTicket(fresh);
        }
      });
    }
  });
  const [closeTicket] = useMutation(CLOSE_SUPPORT_TICKET, {
    onCompleted: (res) => {
      refetch().then(updated => {
        const fresh = updated.data?.getSupportTickets?.find(t => t.id === selectedTicket.id);
        if (fresh) setSelectedTicket(fresh);
      });
    }
  });
  const [requestHandoff] = useMutation(REQUEST_WHATSAPP_HANDOFF, {
    onCompleted: (res) => {
      refetch().then(updated => {
        const fresh = updated.data?.getSupportTickets?.find(t => t.id === selectedTicket.id);
        if (fresh) setSelectedTicket(fresh);
      });
    }
  });

  // Ticket creation states
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('general');

  // Reply state
  const [replyText, setReplyText] = useState('');

  // Rating state
  const [satisfactionScore, setSatisfactionScore] = useState(5);
  const [satisfactionFeedback, setSatisfactionFeedback] = useState('');

  const tickets = data?.getSupportTickets || [];

  const handleCreateTicket = async () => {
    if (!subject || !description) return;
    try {
      await createTicket({
        variables: {
          input: { subject, description, priority, category }
        }
      });
      Alert.alert(isHi ? 'सफलता' : 'Success', isHi ? 'सहायता टिकट दर्ज किया गया है।' : 'Support ticket raised successfully!');
      setSubject('');
      setDescription('');
      setActiveTab('tickets');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleSendReply = async () => {
    if (!replyText || !selectedTicket) return;
    try {
      await addMessage({
        variables: {
          input: { ticketId: selectedTicket.id, message: replyText }
        }
      });
      setReplyText('');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;
    try {
      await closeTicket({
        variables: {
          input: {
            ticketId: selectedTicket.id,
            satisfactionScore,
            satisfactionFeedback
          }
        }
      });
      Alert.alert(isHi ? 'सफलता' : 'Success', isHi ? 'टिकट बंद कर दिया गया।' : 'Ticket closed successfully.');
      setSatisfactionFeedback('');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleWhatsAppHandoff = async () => {
    if (!selectedTicket) return;
    try {
      await requestHandoff({ variables: { id: selectedTicket.id } });
      const text = `Hello support, I need live help with Ticket #${selectedTicket.id}. Subject: ${selectedTicket.subject}`;
      const url = `https://wa.me/919638484545?text=${encodeURIComponent(text)}`;
      Linking.openURL(url);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const getSlaTimeRemaining = (expiryStr) => {
    const diff = new Date(expiryStr) - new Date();
    if (diff <= 0) return isHi ? 'समय समाप्त' : 'SLA Target Breached';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return isHi ? `${hours} घंटे शेष` : `${hours}h remaining`;
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.hero}>
        <Text style={s.heroTitle}>{isHi ? "सहायता केंद्र" : "Helpdesk Support"}</Text>
        <Text style={s.heroSubtitle}>
          {isHi ? "हमारे देखभाल सलाहकारों से संपर्क करें और टिकटों की स्थिति देखें।" : "Track your issues and query status with live advisors."}
        </Text>
      </View>

      {/* Tabs */}
      <View style={s.tabBar}>
        <TouchableOpacity 
          style={[s.tabBtn, activeTab === 'tickets' && s.tabBtnActive]} 
          onPress={() => { setActiveTab('tickets'); setSelectedTicket(null); }}
        >
          <Text style={[s.tabBtnText, activeTab === 'tickets' && s.tabBtnTextActive]}>
            {isHi ? 'मेरे टिकट' : 'My Tickets'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[s.tabBtn, activeTab === 'new' && s.tabBtnActive]} 
          onPress={() => { setActiveTab('new'); setSelectedTicket(null); }}
        >
          <Text style={[s.tabBtnText, activeTab === 'new' && s.tabBtnTextActive]}>
            {isHi ? 'नया टिकट' : 'Raise Ticket'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.maroon} style={{ marginVertical: 30 }} />
      ) : selectedTicket ? (
        // Ticket detail dialogue
        <View style={{ gap: 16 }}>
          <TouchableOpacity style={s.backBtn} onPress={() => setSelectedTicket(null)}>
            <Ionicons name="arrow-back" size={16} color={colors.maroon} />
            <Text style={s.backBtnText}>{isHi ? 'वापस जाएँ' : 'Back to List'}</Text>
          </TouchableOpacity>

          <View style={s.card}>
            <Text style={s.ticketDetailSubject}>{selectedTicket.subject}</Text>
            <View style={{ flexDirection: 'row', gap: 6, marginVertical: 6 }}>
              <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: selectedTicket.status === 'resolved' ? '#DCFCE7' : '#FEF3C7' }}>
                <Text style={{ fontSize: 9, color: selectedTicket.status === 'resolved' ? '#15803D' : '#D97706', fontWeight: 'bold' }}>
                  {selectedTicket.status.toUpperCase()}
                </Text>
              </View>
              <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: colors.canvas }}>
                <Text style={{ fontSize: 9, color: colors.muted, fontWeight: 'bold' }}>{selectedTicket.category.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 10, color: colors.muted }}>SLA: {getSlaTimeRemaining(selectedTicket.slaExpiresAt)}</Text>
          </View>

          {/* Messages list */}
          <View style={[s.card, { minHeight: 200 }]}>
            <ScrollView contentContainerStyle={{ gap: 10 }}>
              {selectedTicket.messages.map(msg => {
                const isSelf = msg.senderType === 'user';
                return (
                  <View 
                    key={msg.id} 
                    style={[
                      s.bubble, 
                      isSelf ? s.bubbleSelf : s.bubbleOther
                    ]}
                  >
                    <Text style={[s.bubbleText, isSelf && { color: colors.paper }]}>{msg.message}</Text>
                    <Text style={[s.bubbleTime, isSelf && { color: '#fda4af' }]}>{new Date(msg.createdAt).toLocaleTimeString()}</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {selectedTicket.status !== 'resolved' ? (
            <View style={{ gap: 12 }}>
              {/* WhatsApp Handoff row */}
              <TouchableOpacity style={s.whatsappBtn} onPress={handleWhatsAppHandoff}>
                <Ionicons name="logo-whatsapp" size={18} color={colors.paper} />
                <Text style={s.whatsappBtnText}>{isHi ? 'व्हाट्सएप चैट हैंडओवर' : 'Handoff to WhatsApp Chat'}</Text>
              </TouchableOpacity>

              {/* Chat Input */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput 
                  style={[s.input, { flex: 1 }]} 
                  placeholder={isHi ? "जवाब लिखें..." : "Type reply..."} 
                  value={replyText} 
                  onChangeText={setReplyText} 
                />
                <TouchableOpacity style={s.sendBtn} onPress={handleSendReply}>
                  <Ionicons name="send" size={18} color={colors.paper} />
                </TouchableOpacity>
              </View>

              {/* Resolve Form */}
              <View style={s.card}>
                <Text style={s.cardTitle}>Rate & Close Ticket</Text>
                
                {/* Custom stars rating selector */}
                <View style={{ flexDirection: 'row', gap: 8, marginVertical: 8 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <TouchableOpacity key={star} onPress={() => setSatisfactionScore(star)}>
                      <Ionicons 
                        name={satisfactionScore >= star ? "star" : "star-outline"} 
                        size={24} 
                        color={colors.saffron} 
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <TextInput 
                  style={s.input} 
                  placeholder="Feedback comment (optional)" 
                  value={satisfactionFeedback} 
                  onChangeText={setSatisfactionFeedback} 
                />
                <TouchableOpacity style={[s.submitBtn, { backgroundColor: colors.error }]} onPress={handleCloseTicket}>
                  <Text style={s.submitBtnText}>Mark Resolved</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={[s.card, { alignItems: 'center', padding: 20 }]}>
              <Ionicons name="checkmark-circle" size={40} color="#16a34a" />
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.maroonDark, marginTop: 8 }}>Ticket Resolved</Text>
              <Text style={{ fontSize: 11, color: colors.muted, textAlign: 'center', marginTop: 4 }}>
                Thank you for the feedback.
              </Text>
            </View>
          )}
        </View>
      ) : activeTab === 'tickets' ? (
        <View style={{ gap: 12 }}>
          {tickets.length === 0 ? (
            <Text style={s.emptyText}>{isHi ? "कोई टिकट उपलब्ध नहीं है।" : "No support tickets raised yet."}</Text>
          ) : (
            tickets.map(ticket => (
              <TouchableOpacity key={ticket.id} style={s.ticketCard} onPress={() => setSelectedTicket(ticket)}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={s.ticketSubject} numberOfLines={1}>{ticket.subject}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.muted} />
                </View>
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 6, alignItems: 'center' }}>
                  <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: ticket.status === 'resolved' ? '#DCFCE7' : '#FEF3C7' }}>
                    <Text style={{ fontSize: 8, color: ticket.status === 'resolved' ? '#15803D' : '#D97706', fontWeight: 'bold' }}>
                      {ticket.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 9, color: colors.muted }}>
                    SLA: {getSlaTimeRemaining(ticket.slaExpiresAt)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      ) : (
        // Raise New ticket form
        <View style={s.card}>
          <Text style={s.cardTitle}>🎫 {isHi ? "सहायता अनुरोध भेजें" : "New Support Ticket"}</Text>
          
          <TextInput style={s.input} placeholder={isHi ? "विषय..." : "Subject (e.g. Diet Plan Query)"} value={subject} onChangeText={setSubject} />
          
          <Text style={{ fontSize: 10, color: colors.muted, marginBottom: 4 }}>Category:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: 12 }}>
            {[['general', 'General'], ['technical', 'App Issue'], ['diet', 'Diet Query']].map(([code, label]) => (
              <TouchableOpacity 
                key={code} 
                style={[s.chip, category === code && s.chipActive]} 
                onPress={() => setCategory(code)}
              >
                <Text style={[s.chipText, category === code && s.chipTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={{ fontSize: 10, color: colors.muted, marginBottom: 4 }}>Priority Level:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: 12 }}>
            {[['low', 'Low'], ['medium', 'Medium'], ['high', 'High (Urgent)']].map(([code, label]) => (
              <TouchableOpacity 
                key={code} 
                style={[s.chip, priority === code && s.chipActive]} 
                onPress={() => setPriority(code)}
              >
                <Text style={[s.chipText, priority === code && s.chipTextActive]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput 
            style={[s.input, { height: 100, textAlignVertical: 'top' }]} 
            placeholder={isHi ? "विवरण लिखें..." : "Please describe your query in detail..."} 
            multiline 
            value={description} 
            onChangeText={setDescription} 
          />

          <TouchableOpacity style={[s.submitBtn, { backgroundColor: '#be123c' }]} onPress={handleCreateTicket}>
            <Text style={s.submitBtnText}>{isHi ? "अनुरोध सबमिट करें" : "Raise Ticket"}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 20, paddingBottom: 60, gap: 20 },
  hero: { marginBottom: 4 },
  heroTitle: { color: colors.maroonDark, fontSize: 26, fontWeight: '900' },
  heroSubtitle: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  tabBar: { flexDirection: 'row', gap: 8 },
  tabBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, alignItems: 'center' },
  tabBtnActive: { backgroundColor: colors.maroon, borderColor: colors.maroon },
  tabBtnText: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  tabBtnTextActive: { color: colors.paper },
  card: { padding: 20, borderRadius: 24, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, ...shadows.card },
  cardTitle: { color: colors.maroonDark, fontSize: 14, fontWeight: '900', marginBottom: 12 },
  emptyText: { color: colors.muted, fontSize: 11, fontStyle: 'italic', textAlign: 'center', marginVertical: 20 },
  input: { height: 44, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 10, fontSize: 12, color: colors.ink, backgroundColor: colors.canvas, marginBottom: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.line },
  chipActive: { backgroundColor: colors.maroon, borderColor: colors.maroon },
  chipText: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  chipTextActive: { color: colors.paper },
  submitBtn: { height: 44, borderRadius: 10, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  submitBtnText: { color: colors.paper, fontSize: 11, fontWeight: '900' },
  ticketCard: { padding: 16, borderRadius: 16, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, ...shadows.card },
  ticketSubject: { color: colors.maroonDark, fontSize: 13, fontWeight: '800', flex: 1 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  backBtnText: { color: colors.maroon, fontSize: 12, fontWeight: '800' },
  ticketDetailSubject: { fontSize: 16, fontWeight: '900', color: colors.maroonDark },
  bubble: { padding: 12, borderRadius: 16, maxWidth: '85%', marginBottom: 8, ...shadows.card },
  bubbleSelf: { alignSelf: 'flex-end', backgroundColor: '#be123c' },
  bubbleOther: { alignSelf: 'flex-start', backgroundColor: '#ffffff', borderWidth: 1, borderColor: colors.line },
  bubbleText: { fontSize: 12, color: colors.ink },
  bubbleTime: { fontSize: 8, color: colors.muted, textAlign: 'right', marginTop: 4 },
  whatsappBtn: { height: 44, borderRadius: 10, backgroundColor: '#25D366', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  whatsappBtnText: { color: colors.paper, fontSize: 11, fontWeight: '900' },
  sendBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#be123c', alignItems: 'center', justifyContent: 'center' }
});
