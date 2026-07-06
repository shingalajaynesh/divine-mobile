import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase.js';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './styles.js';

export default function FirebaseSignInModal({ visible, onClose }) {
  const [activeTab, setActiveTab] = useState('email-login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose();
      setEmail('');
      setPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Check details.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!email || !password || !displayName) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      onClose();
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    if (activeTab === 'email-login') {
      return (
        <View style={{ width: '100%' }}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.textInput}
            placeholder="mother@example.com"
            placeholderTextColor="#a3a3a3"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.textInput}
            placeholder="••••••••"
            placeholderTextColor="#a3a3a3"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleEmailLogin} disabled={loading}>
            <LinearGradient
              colors={['#f97316', '#f43f5e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButtonGradient}
            >
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitButtonText}>Log In</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }

    if (activeTab === 'email-signup') {
      return (
        <View style={{ width: '100%' }}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Jane Doe"
            placeholderTextColor="#a3a3a3"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.textInput}
            placeholder="mother@example.com"
            placeholderTextColor="#a3a3a3"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.textInput}
            placeholder="••••••••"
            placeholderTextColor="#a3a3a3"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleEmailSignUp} disabled={loading}>
            <LinearGradient
              colors={['#f97316', '#f43f5e']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButtonGradient}
            >
              {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitButtonText}>Register</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  const handleCancel = () => {
    setErrorMsg('');
    setEmail('');
    setPassword('');
    setDisplayName('');
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} style={{ width: '100%' }}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sign In / Join</Text>
            <Text style={styles.modalSubtitle}>Access your Divine Garbh Sanskar account</Text>

            {errorMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Custom Tab Bar */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 15, borderBottomWidth: 1, borderBottomColor: '#e5e5e5', width: '100%' }}>
              <TouchableOpacity onPress={() => { setActiveTab('email-login'); setErrorMsg(''); }} style={{ paddingBottom: 10, borderBottomWidth: activeTab === 'email-login' ? 2 : 0, borderBottomColor: '#f43f5e' }}>
                <Text style={{ fontWeight: activeTab === 'email-login' ? 'bold' : 'normal', color: activeTab === 'email-login' ? '#f43f5e' : '#737373' }}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setActiveTab('email-signup'); setErrorMsg(''); }} style={{ paddingBottom: 10, borderBottomWidth: activeTab === 'email-signup' ? 2 : 0, borderBottomColor: '#f43f5e' }}>
                <Text style={{ fontWeight: activeTab === 'email-signup' ? 'bold' : 'normal', color: activeTab === 'email-signup' ? '#f43f5e' : '#737373' }}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {renderForm()}

            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} disabled={loading}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
