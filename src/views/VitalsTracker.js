import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { 
  GET_WELLNESS_DATA_QUERY, 
  LOG_VITALS_MUTATION, 
  ADD_APPOINTMENT_MUTATION, 
  DELETE_APPOINTMENT_MUTATION, 
  ADD_MEDICINE_MUTATION, 
  TOGGLE_MEDICINE_MUTATION, 
  DELETE_MEDICINE_MUTATION, 
  ADD_BAG_ITEM_MUTATION, 
  TOGGLE_BAG_ITEM_MUTATION, 
  CLEAR_BAG_ITEMS_MUTATION 
} from '../graphql/operations.js';
import { colors, shadows } from '../theme/theme.js';

const SYMPTOM_OPTIONS = ['Nausea', 'Fatigue', 'Backache', 'Swelling', 'Headache', 'Heartburn', 'Mood Swings', 'Insomnia'];

export default function MobileVitalsTracker({ user }) {
  const userLang = user?.language || 'en';
  const isHi = userLang === 'hi';

  const [activeTab, setActiveTab] = useState('vitals');

  // GraphQL
  const { data, loading, refetch } = useQuery(GET_WELLNESS_DATA_QUERY);
  const [logVitals] = useMutation(LOG_VITALS_MUTATION, { onCompleted: () => refetch() });
  const [addAppointment] = useMutation(ADD_APPOINTMENT_MUTATION, { onCompleted: () => refetch() });
  const [deleteAppointment] = useMutation(DELETE_APPOINTMENT_MUTATION, { onCompleted: () => refetch() });
  const [addMedicine] = useMutation(ADD_MEDICINE_MUTATION, { onCompleted: () => refetch() });
  const [toggleMedicine] = useMutation(TOGGLE_MEDICINE_MUTATION, { onCompleted: () => refetch() });
  const [deleteMedicine] = useMutation(DELETE_MEDICINE_MUTATION, { onCompleted: () => refetch() });
  const [addBagItem] = useMutation(ADD_BAG_ITEM_MUTATION, { onCompleted: () => refetch() });
  const [toggleBagItem] = useMutation(TOGGLE_BAG_ITEM_MUTATION, { onCompleted: () => refetch() });
  const [clearPackedBagItems] = useMutation(CLEAR_BAG_ITEMS_MUTATION, { onCompleted: () => refetch() });

  // Vitals states
  const [weight, setWeight] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [kicks, setKicks] = useState('');
  const [sugar, setSugar] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);

  // Medicine states
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medTime, setMedTime] = useState('08:00');

  // Appointment states
  const [appTitle, setAppTitle] = useState('');
  const [appDoctor, setAppDoctor] = useState('');
  const [appDate, setAppDate] = useState('');
  const [appNotes, setAppNotes] = useState('');

  // Hospital Bag states
  const [bagItemName, setBagItemName] = useState('');
  const [bagCategory, setBagCategory] = useState('mother');

  const logs = data?.getMyVitals || [];
  const appointments = data?.getAppointments || [];
  const medicines = data?.getMedicineReminders || [];
  const bagItems = data?.getHospitalBagItems || [];

  const handleVitalsSubmit = async () => {
    if (!weight && !systolic && !diastolic && !kicks && !sugar && selectedSymptoms.length === 0) return;
    try {
      await logVitals({
        variables: {
          input: {
            weight: weight ? parseFloat(weight) : null,
            systolicBp: systolic ? parseInt(systolic) : null,
            diastolicBp: diastolic ? parseInt(diastolic) : null,
            kickCount: kicks ? parseInt(kicks) : null,
            bloodSugar: sugar ? parseFloat(sugar) : null,
            symptoms: selectedSymptoms
          }
        }
      });
      Alert.alert(isHi ? 'सफलता' : 'Success', isHi ? 'दैनिक लॉग सहेजा गया।' : 'Daily entry saved successfully.');
      setWeight('');
      setSystolic('');
      setDiastolic('');
      setKicks('');
      setSugar('');
      setSelectedSymptoms([]);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleAddAppointment = async () => {
    if (!appTitle || !appDate) return;
    try {
      await addAppointment({
        variables: {
          input: {
            title: appTitle,
            doctorName: appDoctor,
            appointmentDate: new Date(appDate).toISOString(),
            notes: appNotes
          }
        }
      });
      Alert.alert(isHi ? 'सफलता' : 'Success', isHi ? 'अप्वाइंटमेंट जोड़ा गया।' : 'Appointment scheduled.');
      setAppTitle('');
      setAppDoctor('');
      setAppDate('');
      setAppNotes('');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleAddMedicine = async () => {
    if (!medName || !medDosage) return;
    try {
      await addMedicine({
        variables: {
          input: {
            name: medName,
            dosage: medDosage,
            timeOfDay: medTime
          }
        }
      });
      Alert.alert(isHi ? 'सफलता' : 'Success', isHi ? 'दवा सहेजी गई।' : 'Reminder added.');
      setMedName('');
      setMedDosage('');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleAddBagItem = async () => {
    if (!bagItemName) return;
    try {
      await addBagItem({
        variables: {
          input: { itemName: bagItemName, category: bagCategory }
        }
      });
      setBagItemName('');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const toggleSymptom = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const packedCount = bagItems.filter(i => i.packed).length;
  const totalBagItems = bagItems.length;
  const packedPercentage = totalBagItems > 0 ? Math.round((packedCount / totalBagItems) * 100) : 0;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Title */}
      <View style={s.hero}>
        <Text style={s.heroTitle}>{isHi ? "मातृत्व कल्याण" : "Pregnancy Wellness"}</Text>
        <Text style={s.heroSubtitle}>
          {isHi ? "अपने स्वास्थ्य वाइटल्स, अपॉइंटमेंट और अस्पताल पैकिंग बैग का प्रबंधन करें।" : "Manage your vitals logs, clinic schedules, and packing checklists."}
        </Text>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabBar}>
        {['vitals', 'medicines', 'appointments', 'bag'].map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[s.tabBtn, activeTab === tab && s.tabBtnActive]} 
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[s.tabBtnText, activeTab === tab && s.tabBtnTextActive]}>
              {tab === 'vitals' ? (isHi ? 'वाइटल्स' : 'Vitals') :
               tab === 'medicines' ? (isHi ? 'दवाइयाँ' : 'Meds') :
               tab === 'appointments' ? (isHi ? 'अप्वाइंटमेंट' : 'Visits') :
               (isHi ? 'अस्पताल बैग' : 'Bag')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={colors.maroon} style={{ marginVertical: 30 }} />
      ) : activeTab === 'vitals' ? (
        <View style={{ gap: 16 }}>
          {/* Logger form */}
          <View style={s.card}>
            <Text style={s.cardTitle}>📝 {isHi ? "दैनिक स्वास्थ्य वाइटल्स" : "Log Daily Vitals"}</Text>
            
            <TextInput style={s.input} placeholder={isHi ? "वजन (kg) e.g. 64.5" : "Weight (kg) e.g. 64.5"} value={weight} onChangeText={setWeight} keyboardType="numeric" />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput style={[s.input, { flex: 1 }]} placeholder={isHi ? "सिस्टोलिक" : "Systolic BP"} value={systolic} onChangeText={setSystolic} keyboardType="numeric" />
              <TextInput style={[s.input, { flex: 1 }]} placeholder={isHi ? "डायस्टोलिक" : "Diastolic BP"} value={diastolic} onChangeText={setDiastolic} keyboardType="numeric" />
            </View>
            <TextInput style={s.input} placeholder={isHi ? "बेबी किक काउंट (2h)" : "Baby Kick Count (2h)"} value={kicks} onChangeText={setKicks} keyboardType="numeric" />
            <TextInput style={s.input} placeholder={isHi ? "रक्त शर्करा (mg/dL)" : "Blood Sugar (mg/dL)"} value={sugar} onChangeText={setSugar} keyboardType="numeric" />

            {/* Symptoms list */}
            <Text style={{ fontSize: 10, fontWeight: '800', color: colors.muted, marginVertical: 6, textTransform: 'uppercase' }}>
              {isHi ? "आज के लक्षण" : "Symptoms Experiencing Today"}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
              {SYMPTOM_OPTIONS.map(symptom => {
                const selected = selectedSymptoms.includes(symptom);
                return (
                  <TouchableOpacity 
                    key={symptom} 
                    style={[s.chip, selected && { backgroundColor: '#be123c', borderColor: '#be123c' }]}
                    onPress={() => toggleSymptom(symptom)}
                  >
                    <Text style={[s.chipText, selected && { color: colors.paper }]}>{symptom}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={[s.submitBtn, { backgroundColor: '#be123c' }]} onPress={handleVitalsSubmit}>
              <Text style={s.submitBtnText}>{isHi ? "स्वास्थ्य लॉग सहेजें" : "Save Vitals Log"}</Text>
            </TouchableOpacity>
          </View>

          {/* History list */}
          <View style={s.card}>
            <Text style={s.cardTitle}>📈 {isHi ? "इतिहास" : "Wellness Log History"}</Text>
            {logs.length === 0 ? (
              <Text style={s.emptyText}>{isHi ? "कोई पुराना लॉग नहीं है।" : "No wellness entries saved yet."}</Text>
            ) : (
              logs.map(log => {
                let symptomsList = [];
                try {
                  symptomsList = JSON.parse(log.symptoms || '[]');
                } catch (e) {
                  symptomsList = [];
                }

                return (
                  <View key={log.id} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line }}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.saffron }}>
                      📅 {new Date(log.loggedAt).toLocaleDateString()}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.ink, marginTop: 4 }}>
                      Weight: {log.weight ? `${log.weight} kg` : '-'} • BP: {log.systolicBp && log.diastolicBp ? `${log.systolicBp}/${log.diastolicBp}` : '-'} • Kicks: {log.kickCount !== null ? log.kickCount : '-'}
                    </Text>
                    {symptomsList.length > 0 && (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                        {symptomsList.map(s => (
                          <View key={s} style={{ backgroundColor: '#F3E8FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                            <Text style={{ fontSize: 8, color: '#6B21A8', fontWeight: '800' }}>{s}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        </View>
      ) : activeTab === 'medicines' ? (
        <View style={{ gap: 16 }}>
          {/* Add Medicine form */}
          <View style={s.card}>
            <Text style={s.cardTitle}>💊 {isHi ? "दवा शेड्यूल जोड़ें" : "Add Medicine"}</Text>
            <TextInput style={s.input} placeholder="Medicine Name (e.g. Folic Acid)" value={medName} onChangeText={setMedName} />
            <TextInput style={s.input} placeholder="Dosage (e.g. 1 Tablet)" value={medDosage} onChangeText={setMedDosage} />
            
            <Text style={{ fontSize: 10, color: colors.muted, marginBottom: 4 }}>Remind Daily At:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: 12 }}>
              {['06:00', '08:00', '13:00', '18:00', '21:00', '22:00'].map(t => (
                <TouchableOpacity 
                  key={t} 
                  style={[s.chip, medTime === t && s.chipActive]} 
                  onPress={() => setMedTime(t)}
                >
                  <Text style={[s.chipText, medTime === t && s.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={s.submitBtn} onPress={handleAddMedicine}>
              <Text style={s.submitBtnText}>Add Reminder</Text>
            </TouchableOpacity>
          </View>

          {/* Medicines list */}
          <View style={s.card}>
            <Text style={s.cardTitle}>🗓️ {isHi ? "दैनिक दवाइयाँ सूची" : "Daily Pill Schedule"}</Text>
            {medicines.length === 0 ? (
              <Text style={s.emptyText}>No pills schedule configured.</Text>
            ) : (
              medicines.map(med => (
                <View key={med.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.line }}>
                  <View>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: med.active ? colors.maroonDark : colors.muted, textDecorationLine: med.active ? 'none' : 'line-through' }}>{med.name}</Text>
                    <Text style={{ fontSize: 11, color: colors.muted }}>{med.dosage} · At {med.timeOfDay}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity onPress={() => toggleMedicine({ variables: { id: med.id, active: !med.active } })}>
                      <Ionicons name={med.active ? "checkbox" : "checkbox-outline"} size={20} color={colors.maroon} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteMedicine({ variables: { id: med.id } })}>
                      <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      ) : activeTab === 'appointments' ? (
        <View style={{ gap: 16 }}>
          {/* Add appointment form */}
          <View style={s.card}>
            <Text style={s.cardTitle}>🏥 {isHi ? "डॉक्टर अपॉइंटमेंट जोड़ें" : "Schedule Checkup"}</Text>
            <TextInput style={s.input} placeholder="Purpose (e.g. Ultrasound Scan)" value={appTitle} onChangeText={setAppTitle} />
            <TextInput style={s.input} placeholder="Doctor Name" value={appDoctor} onChangeText={setAppDoctor} />
            <TextInput style={s.input} placeholder="Date (e.g. YYYY-MM-DD HH:MM)" value={appDate} onChangeText={setAppDate} />
            <TextInput style={s.input} placeholder="Special Doctor Notes" value={appNotes} onChangeText={setAppNotes} />
            
            <TouchableOpacity style={s.submitBtn} onPress={handleAddAppointment}>
              <Text style={s.submitBtnText}>Add Appointment</Text>
            </TouchableOpacity>
          </View>

          {/* Appointments list */}
          <View style={s.card}>
            <Text style={s.cardTitle}>📅 {isHi ? "आगामी चेकअप्स" : "Upcoming Visits"}</Text>
            {appointments.length === 0 ? (
              <Text style={s.emptyText}>No checkups scheduled.</Text>
            ) : (
              appointments.map(app => (
                <View key={app.id} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: 13, fontWeight: '850', color: colors.maroonDark }}>{app.title}</Text>
                    <TouchableOpacity onPress={() => deleteAppointment({ variables: { id: app.id } })}>
                      <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                  <Text style={{ fontSize: 11, color: colors.saffron, marginTop: 2 }}>
                    🩺 {app.doctorName || 'Care Team'} • 📅 {new Date(app.appointmentDate).toLocaleString()}
                  </Text>
                  {app.notes && (
                    <Text style={{ fontSize: 11, color: colors.muted, fontStyle: 'italic', marginTop: 4 }}>"{app.notes}"</Text>
                  )}
                </View>
              ))
            )}
          </View>
        </View>
      ) : (
        /* Hospital Bag */
        <View style={{ gap: 16 }}>
          {/* Packing Progress */}
          <View style={s.card}>
            <Text style={s.cardTitle}>🎒 Packing Progress</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{packedPercentage}% Packed</Text>
              <TouchableOpacity onPress={() => clearPackedBagItems()}>
                <Text style={{ fontSize: 10, color: colors.error, fontWeight: 'bold' }}>Clear Packed</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.canvas, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${packedPercentage}%`, backgroundColor: colors.maroon }} />
            </View>
          </View>

          {/* Add item */}
          <View style={s.card}>
            <Text style={s.cardTitle}>➕ Add Packing Item</Text>
            <TextInput style={s.input} placeholder="Item Name (e.g. Diapers)" value={bagItemName} onChangeText={setBagItemName} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: 12 }}>
              {[['mother', '🤰 Mother'], ['baby', '👶 Baby'], ['partner', '👨 Partner']].map(([code, label]) => (
                <TouchableOpacity 
                  key={code} 
                  style={[s.chip, bagCategory === code && s.chipActive]} 
                  onPress={() => setBagCategory(code)}
                >
                  <Text style={[s.chipText, bagCategory === code && s.chipTextActive]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={s.submitBtn} onPress={handleAddBagItem}>
              <Text style={s.submitBtnText}>Add Packing Item</Text>
            </TouchableOpacity>
          </View>

          {/* Pack lists */}
          {['mother', 'baby', 'partner'].map(cat => {
            const items = bagItems.filter(i => i.category === cat);
            const label = cat === 'mother' ? '🤰 For Mother' : cat === 'baby' ? '👶 For Baby' : '👨 For Partner / Docs';

            return (
              <View key={cat} style={s.card}>
                <Text style={[s.cardTitle, { fontSize: 12, borderBottomWidth: 1, borderBottomColor: colors.line, paddingBottom: 6 }]}>{label}</Text>
                {items.length === 0 ? (
                  <Text style={s.emptyText}>No items added</Text>
                ) : (
                  items.map(item => (
                    <TouchableOpacity 
                      key={item.id} 
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 }}
                      onPress={() => toggleBagItem({ variables: { id: item.id, packed: !item.packed } })}
                    >
                      <Ionicons name={item.packed ? "checkbox" : "square-outline"} size={18} color={colors.maroon} />
                      <Text style={{ fontSize: 12, color: item.packed ? colors.muted : colors.ink, textDecorationLine: item.packed ? 'line-through' : 'none' }}>
                        {item.itemName}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            );
          })}
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
  tabBar: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line },
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
  submitBtnText: { color: colors.paper, fontSize: 11, fontWeight: '900' }
});
