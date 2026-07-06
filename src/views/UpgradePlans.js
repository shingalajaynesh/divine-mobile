import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { gql } from '@apollo/client';
import { colors, shadows } from '../theme/theme.js';

const GET_PLANS_QUERY = gql`
  query GetPlans {
    getPlans {
      id
      name
      description
      price
      billingPeriod
      trialDays
      features
    }
    getMySubscription {
      id
      status
      trialEndDate
      currentPeriodEndDate
      plan {
        id
        name
        price
      }
    }
  }
`;

const START_TRIAL_MUTATION = gql`
  mutation StartTrial($planId: ID!) {
    startTrial(planId: $planId) {
      id
      status
    }
  }
`;

const CREATE_RAZORPAY_ORDER_MUTATION = gql`
  mutation CreateRazorpayOrder($planId: ID!, $couponCode: String) {
    createRazorpayOrder(planId: $planId, couponCode: $couponCode) {
      id
      amount
      currency
      receipt
    }
  }
`;

const VERIFY_RAZORPAY_PAYMENT_MUTATION = gql`
  mutation VerifyRazorpayPayment(
    $planId: ID!
    $razorpayOrderId: String!
    $razorpayPaymentId: String!
    $razorpaySignature: String!
  ) {
    verifyRazorpayPayment(
      planId: $planId
      razorpayOrderId: $razorpayOrderId
      razorpayPaymentId: $razorpayPaymentId
      razorpaySignature: $razorpaySignature
    ) {
      id
      status
    }
  }
`;

const CANCEL_SUBSCRIPTION_MUTATION = gql`
  mutation CancelSubscription {
    cancelSubscription {
      id
      status
    }
  }
`;

export default function MobileUpgradePlans({ user }) {
  const userLang = user?.language || 'en';
  const isHi = userLang === 'hi';

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(null);

  // Queries & Mutations
  const { data, loading, refetch } = useQuery(GET_PLANS_QUERY);
  const [startTrial] = useMutation(START_TRIAL_MUTATION, { onCompleted: () => { refetch(); Alert.alert('Success', 'Trial started!'); } });
  const [createRazorpayOrder] = useMutation(CREATE_RAZORPAY_ORDER_MUTATION);
  const [verifyRazorpayPayment] = useMutation(VERIFY_RAZORPAY_PAYMENT_MUTATION, { onCompleted: () => { refetch(); setCheckoutModalOpen(false); Alert.alert('Success', 'Subscribed successfully!'); } });
  const [cancelSub] = useMutation(CANCEL_SUBSCRIPTION_MUTATION, { onCompleted: () => { refetch(); Alert.alert('Success', 'Subscription cancelled'); } });

  const plans = data?.getPlans || [];
  const currentSub = data?.getMySubscription;

  const handleStartTrial = async (planId) => {
    try {
      await startTrial({ variables: { planId } });
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleValidateCoupon = async () => {
    if (!couponCode) return;
    Alert.alert('Coupon Applied', '50% discount code validated!');
    setCouponDiscount({ percent: 50 });
  };

  const handleSubscribeSubmit = async () => {
    if (!selectedPlan) return;
    try {
      const orderRes = await createRazorpayOrder({
        variables: { planId: selectedPlan.id, couponCode: couponDiscount ? couponCode : null }
      });
      const orderData = orderRes.data.createRazorpayOrder;

      // Simulated sandbox dialog
      Alert.alert(
        'Razorpay Sandbox Checkout',
        `Simulate secure payment for Order ID: ${orderData.id}\nAmount: ₹${orderData.amount / 100}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Pay Securely',
            onPress: async () => {
              try {
                await verifyRazorpayPayment({
                  variables: {
                    planId: selectedPlan.id,
                    razorpayOrderId: orderData.id,
                    razorpayPaymentId: 'pay_mock_' + Math.random().toString(36).substring(2, 9),
                    razorpaySignature: 'mock_signature'
                  }
                });
              } catch (err) {
                Alert.alert('Verification Failed', err.message);
              }
            }
          }
        ]
      );
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const getSubPeriodStatus = () => {
    if (!currentSub) return isHi ? 'निःशुल्क (डेमो)' : 'Free Tier (Demo)';
    if (currentSub.status === 'trialing') {
      const days = Math.ceil((new Date(currentSub.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24));
      return isHi ? `ट्रायल अवधि: ${days} दिन शेष` : `Trialing: ${days} days remaining`;
    }
    if (currentSub.status === 'cancelled') {
      return isHi ? 'रद्द (अवधि समाप्त होने का इंतज़ार)' : 'Cancelled (Expires soon)';
    }
    return isHi ? 'सक्रिय सदस्यता' : 'Active Premium Subscription';
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.hero}>
        <Text style={s.heroTitle}>{isHi ? "सदस्यता योजना" : "Upgrade Plans"}</Text>
        <Text style={s.heroSubtitle}>
          {isHi ? "प्रीमियम Garbh Sanskar दैनिक मार्गदर्शन सक्रिय करें।" : "Unlock full pregnancy daily guides and expert consultations."}
        </Text>
      </View>

      {/* Status banner */}
      <View style={s.banner}>
        <Text style={s.bannerSubtitle}>{isHi ? 'आपकी वर्तमान स्थिति' : 'Current Status'}</Text>
        <Text style={s.bannerTitle}>{getSubPeriodStatus()}</Text>
        {currentSub && (
          <Text style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>
            Expires on {new Date(currentSub.currentPeriodEndDate).toLocaleDateString()}
          </Text>
        )}
        {currentSub && currentSub.status !== 'cancelled' && (
          <TouchableOpacity style={s.cancelBtn} onPress={() => cancelSub()}>
            <Text style={s.cancelBtnText}>Cancel Renewal</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.maroon} style={{ marginVertical: 30 }} />
      ) : (
        plans.map(plan => {
          const isActive = currentSub?.plan?.id === plan.id;
          return (
            <View key={plan.id} style={[s.card, isActive && { borderColor: colors.maroon, borderWidth: 2 }]}>
              {isActive && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>Active Plan</Text>
                </View>
              )}
              <Text style={s.planTitle}>{plan.name}</Text>
              <Text style={s.planDesc}>{plan.description}</Text>

              <Text style={s.planPrice}>
                ₹{plan.price}<Text style={{ fontSize: 13, color: colors.muted }}> / {plan.billingPeriod}</Text>
              </Text>

              <View style={s.featuresList}>
                {plan.features.map((feat, idx) => (
                  <View key={idx} style={s.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
                    <Text style={s.featureText}>{feat.replace(/_/g, ' ')}</Text>
                  </View>
                ))}
              </View>

              <View style={{ gap: 8, marginTop: 12 }}>
                {!currentSub && (
                  <TouchableOpacity style={s.trialBtn} onPress={() => handleStartTrial(plan.id)}>
                    <Text style={s.trialBtnText}>Start {plan.trialDays}-Day Free Trial</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity 
                  style={s.subBtn} 
                  onPress={() => { setSelectedPlan(plan); setCheckoutModalOpen(true); }}
                >
                  <Text style={s.subBtnText}>Activate Membership</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {/* Checkout Upgrade Modal simulated in-view overlay */}
      {checkoutModalOpen && selectedPlan && (
        <View style={s.overlayCard}>
          <Text style={s.cardTitle}>Complete Upgrade</Text>
          <Text style={{ fontSize: 11, color: colors.muted, marginBottom: 8 }}>
            Selected: {selectedPlan.name} (₹{selectedPlan.price})
          </Text>

          <TextInput 
            style={s.input} 
            placeholder="Promo Coupon Code (e.g. GARBH50)" 
            value={couponCode} 
            onChangeText={setCouponCode} 
          />
          <TouchableOpacity style={s.couponBtn} onPress={handleValidateCoupon}>
            <Text style={{ color: colors.paper, fontSize: 10, fontWeight: 'bold' }}>Apply Coupon</Text>
          </TouchableOpacity>

          {couponDiscount && (
            <Text style={{ fontSize: 11, color: '#16a34a', marginVertical: 6 }}>
              Discount Applied! Final Price: ₹{selectedPlan.price * 0.5}
            </Text>
          )}

          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <TouchableOpacity style={[s.subBtn, { flex: 1, backgroundColor: '#16a34a' }]} onPress={handleSubscribeSubmit}>
              <Text style={s.subBtnText}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[s.subBtn, { flex: 1, backgroundColor: '#cbd5e1' }]} 
              onPress={() => { setCheckoutModalOpen(false); setCouponDiscount(null); setCouponCode(''); }}
            >
              <Text style={[s.subBtnText, { color: colors.ink }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
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
  banner: { padding: 20, borderRadius: 24, backgroundColor: '#fff5f5', borderWidth: 1, borderColor: '#ffe4e6' },
  bannerSubtitle: { fontSize: 9, textTransform: 'uppercase', color: colors.maroon, fontWeight: 'bold', letterSpacing: 1 },
  bannerTitle: { fontSize: 18, fontWeight: '900', color: colors.maroonDark, marginTop: 4 },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.error, alignSelf: 'flex-start', marginTop: 12 },
  cancelBtnText: { color: colors.error, fontSize: 10, fontWeight: 'bold' },
  card: { padding: 24, borderRadius: 24, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, ...shadows.card, position: 'relative' },
  badge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: '#fff5f5' },
  badgeText: { fontSize: 9, color: colors.maroon, fontWeight: 'bold' },
  planTitle: { fontSize: 18, fontWeight: '900', color: colors.maroonDark },
  planDesc: { fontSize: 11, color: colors.muted, marginTop: 4 },
  planPrice: { fontSize: 24, fontWeight: '900', color: colors.maroon, marginVertical: 14 },
  featuresList: { gap: 8, marginVertical: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { fontSize: 11, color: colors.ink },
  trialBtn: { height: 40, borderRadius: 10, borderWidth: 1, borderColor: colors.maroon, alignItems: 'center', justifyContent: 'center' },
  trialBtnText: { color: colors.maroon, fontSize: 11, fontWeight: '800' },
  subBtn: { height: 40, borderRadius: 10, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center' },
  subBtnText: { color: colors.paper, fontSize: 11, fontWeight: '900' },
  overlayCard: { padding: 20, borderRadius: 24, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, ...shadows.card },
  cardTitle: { fontSize: 13, fontWeight: '900', color: colors.maroonDark, marginBottom: 8 },
  input: { height: 40, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 8, fontSize: 11, color: colors.ink, backgroundColor: colors.canvas },
  couponBtn: { height: 32, borderRadius: 8, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center', width: 100, marginTop: 6 }
});
