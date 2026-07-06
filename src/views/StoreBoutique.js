import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { 
  GET_STORE_DATA_QUERY, 
  ADD_TO_CART_MUTATION, 
  UPDATE_CART_QUANTITY_MUTATION, 
  REMOVE_FROM_CART_MUTATION, 
  ADD_ADDRESS_MUTATION, 
  PLACE_ORDER_MUTATION 
} from '../graphql/operations.js';
import { colors, shadows } from '../theme/theme.js';

export default function MobileStoreBoutique({ user }) {
  const userLang = user?.language || 'en';
  const isHi = userLang === 'hi';

  const [activeTab, setActiveTab] = useState('catalog');
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressFormOpen, setAddressFormOpen] = useState(false);

  // Address creation states
  const [fullName, setFullName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');

  // Queries & Mutations
  const { data, loading, refetch } = useQuery(GET_STORE_DATA_QUERY);
  const [addToCart] = useMutation(ADD_TO_CART_MUTATION, { onCompleted: () => refetch() });
  const [updateCartQty] = useMutation(UPDATE_CART_QUANTITY_MUTATION, { onCompleted: () => refetch() });
  const [removeFromCart] = useMutation(REMOVE_FROM_CART_MUTATION, { onCompleted: () => refetch() });
  const [addAddress] = useMutation(ADD_ADDRESS_MUTATION, { onCompleted: () => refetch() });
  const [placeOrder] = useMutation(PLACE_ORDER_MUTATION, {
    onCompleted: () => {
      refetch();
      Alert.alert(isHi ? 'सफलता' : 'Success', isHi ? 'ऑर्डर सफलतापूर्वक सबमिट किया गया!' : 'Order created successfully!');
      setActiveTab('orders');
    }
  });

  const products = data?.getProducts || [];
  const cartItems = data?.getCart || [];
  const addresses = data?.getAddresses || [];
  const orders = data?.getMyOrders || [];

  const cartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, curr) => acc + (curr.quantity * parseFloat(curr.product.price)), 0);

  const handleAddToCart = async (productId) => {
    try {
      await addToCart({ variables: { input: { productId, quantity: 1 } } });
      Alert.alert(isHi ? 'कार्ट' : 'Cart', isHi ? 'उत्पाद कार्ट में जोड़ा गया।' : 'Item added to shopping cart.');
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleQtyChange = async (productId, currentQty, delta) => {
    const nextQty = currentQty + delta;
    if (nextQty <= 0) {
      try {
        await removeFromCart({ variables: { productId } });
      } catch (e) {
        Alert.alert('Error', e.message);
      }
    } else {
      try {
        await updateCartQty({ variables: { input: { productId, quantity: nextQty } } });
      } catch (e) {
        Alert.alert('Error', e.message);
      }
    }
  };

  const handleSaveAddress = async () => {
    if (!fullName || !addressLine1 || !city || !state || !postalCode || !phone) {
      Alert.alert('Error', 'Please fill in all address details');
      return;
    }
    try {
      await addAddress({
        variables: {
          input: { fullName, addressLine1, city, state, postalCode, phone }
        }
      });
      setFullName('');
      setAddressLine1('');
      setCity('');
      setState('');
      setPostalCode('');
      setPhone('');
      setAddressFormOpen(false);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      Alert.alert('Error', 'Please select a shipping destination address');
      return;
    }
    try {
      await placeOrder({ variables: { addressId: selectedAddressId } });
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.hero}>
        <Text style={s.heroTitle}>{isHi ? "बुटीक स्टोर" : "Maternal Boutique"}</Text>
        <Text style={s.heroSubtitle}>
          {isHi ? "अनुशंसित Garbh Sanskar पुस्तकें और सहायक सामग्री।" : "Pregnancy kits, guidance books, and organic nutrition."}
        </Text>
      </View>

      {/* Tabs */}
      <View style={s.tabBar}>
        <TouchableOpacity 
          style={[s.tabBtn, activeTab === 'catalog' && s.tabBtnActive]} 
          onPress={() => setActiveTab('catalog')}
        >
          <Text style={[s.tabBtnText, activeTab === 'catalog' && s.tabBtnTextActive]}>
            {isHi ? 'उत्पाद सूची' : 'Catalogue'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[s.tabBtn, activeTab === 'cart' && s.tabBtnActive]} 
          onPress={() => setActiveTab('cart')}
        >
          <Text style={[s.tabBtnText, activeTab === 'cart' && s.tabBtnTextActive]}>
            {isHi ? `कार्ट (${cartCount})` : `Cart (${cartCount})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[s.tabBtn, activeTab === 'orders' && s.tabBtnActive]} 
          onPress={() => setActiveTab('orders')}
        >
          <Text style={[s.tabBtnText, activeTab === 'orders' && s.tabBtnTextActive]}>
            {isHi ? 'ऑर्डर' : 'Orders'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.maroon} style={{ marginVertical: 30 }} />
      ) : activeTab === 'catalog' ? (
        // Catalogue
        <View style={{ gap: 16 }}>
          {products.map(prod => {
            const outOfStock = prod.inventoryCount <= 0;
            return (
              <View key={prod.id} style={s.productCard}>
                <Image 
                  source={{ uri: prod.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c' }} 
                  style={s.productImg} 
                />
                <View style={s.productInfo}>
                  <Text style={s.productTitle}>{prod.title}</Text>
                  <Text style={s.productDesc} numberOfLines={2}>{prod.description}</Text>
                  
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <Text style={s.productPrice}>₹{prod.price}</Text>
                    {prod.inventoryCount <= 5 && prod.inventoryCount > 0 && (
                      <Text style={s.stockLabel}>Only {prod.inventoryCount} left!</Text>
                    )}
                  </View>

                  <TouchableOpacity 
                    style={[s.addBtn, outOfStock && { backgroundColor: '#cbd5e1' }]} 
                    disabled={outOfStock}
                    onPress={() => handleAddToCart(prod.id)}
                  >
                    <Text style={s.addBtnText}>{outOfStock ? 'Out of Stock' : (isHi ? 'कार्ट में जोड़ें' : 'Add to Cart')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      ) : activeTab === 'cart' ? (
        // Cart and address details
        <View style={{ gap: 16 }}>
          {cartItems.length === 0 ? (
            <Text style={s.emptyText}>{isHi ? "आपकी कार्ट खाली है।" : "Your cart is empty."}</Text>
          ) : (
            <View style={{ gap: 12 }}>
              <View style={s.card}>
                <Text style={s.cardTitle}>Cart Items</Text>
                {cartItems.map(item => (
                  <View key={item.id} style={s.cartRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.cartItemTitle}>{item.product?.title}</Text>
                      <Text style={s.cartItemPrice}>₹{item.product?.price} each</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <TouchableOpacity onPress={() => handleQtyChange(item.productId, item.quantity, -1)}>
                        <Ionicons name="remove-circle-outline" size={22} color={colors.maroon} />
                      </TouchableOpacity>
                      <Text style={s.cartQty}>{item.quantity}</Text>
                      <TouchableOpacity onPress={() => handleQtyChange(item.productId, item.quantity, 1)}>
                        <Ionicons name="add-circle-outline" size={22} color={colors.maroon} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                <Divider />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                  <Text style={{ fontWeight: 'bold' }}>Subtotal:</Text>
                  <Text style={{ fontWeight: 'bold', color: colors.maroon, fontSize: 16 }}>₹{cartSubtotal}</Text>
                </View>
              </View>

              {/* Shipping address select box */}
              <View style={s.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={s.cardTitle}>Shipping Destination</Text>
                  <TouchableOpacity onPress={() => setAddressFormOpen(!addressFormOpen)}>
                    <Text style={{ color: colors.maroon, fontSize: 12, fontWeight: 'bold' }}>+ New Address</Text>
                  </TouchableOpacity>
                </View>

                {addressFormOpen && (
                  <View style={{ gap: 8, marginBottom: 16, backgroundColor: colors.canvas, padding: 12, borderRadius: 12 }}>
                    <TextInput style={s.input} placeholder="Recipient Name" value={fullName} onChangeText={setFullName} />
                    <TextInput style={s.input} placeholder="Address Line 1" value={addressLine1} onChangeText={setAddressLine1} />
                    <TextInput style={s.input} placeholder="City" value={city} onChangeText={setCity} />
                    <TextInput style={s.input} placeholder="State" value={state} onChangeText={setState} />
                    <TextInput style={s.input} placeholder="PIN / Postal Code" value={postalCode} onChangeText={setPostalCode} />
                    <TextInput style={s.input} placeholder="Phone Number" value={phone} onChangeText={setPhone} />
                    <TouchableOpacity style={s.saveAddressBtn} onPress={handleSaveAddress}>
                      <Text style={s.saveAddressBtnText}>Save Address</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {addresses.length === 0 ? (
                  <Text style={{ fontSize: 11, fontStyle: 'italic', color: colors.muted }}>No addresses added yet.</Text>
                ) : (
                  addresses.map(addr => {
                    const selected = selectedAddressId === addr.id;
                    return (
                      <TouchableOpacity 
                        key={addr.id} 
                        style={[s.addressTile, selected && s.addressTileActive]} 
                        onPress={() => setSelectedAddressId(addr.id)}
                      >
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: selected ? colors.maroon : colors.ink }}>{addr.fullName}</Text>
                        <Text style={{ fontSize: 11, color: colors.muted }}>{addr.addressLine1}, {addr.city} - {addr.postalCode}</Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>

              <TouchableOpacity 
                style={[s.checkoutBtn, !selectedAddressId && { backgroundColor: '#cbd5e1' }]} 
                disabled={!selectedAddressId}
                onPress={handleCheckout}
              >
                <Text style={s.checkoutBtnText}>Checkout Order</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        // Order history
        <View style={{ gap: 12 }}>
          {orders.length === 0 ? (
            <Text style={s.emptyText}>{isHi ? "कोई ऑर्डर नहीं मिला।" : "No orders placed yet."}</Text>
          ) : (
            orders.map(order => (
              <View key={order.id} style={s.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', color: colors.maroon }}>Order #{order.id.substring(0, 6).toUpperCase()}</Text>
                  <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: '#DCFCE7' }}>
                    <Text style={{ fontSize: 8, color: '#15803D', fontWeight: 'bold' }}>{order.status.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 10, color: colors.muted, marginTop: 4 }}>Date: {new Date(order.createdAt).toLocaleDateString()}</Text>
                
                <Divider />
                
                {order.items.map(item => (
                  <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 }}>
                    <Text style={{ fontSize: 11 }}>{item.product?.title} (x{item.quantity})</Text>
                    <Text style={{ fontSize: 11, fontWeight: 'bold' }}>₹{item.price * item.quantity}</Text>
                  </View>
                ))}

                <Divider />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold' }}>Grand Total:</Text>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.maroon }}>₹{order.totalAmount}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.line, marginVertical: 12 }} />;
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 20, paddingBottom: 60, gap: 20 },
  hero: { marginBottom: 4 },
  heroTitle: { color: colors.maroonDark, fontSize: 26, fontWeight: '900' },
  heroSubtitle: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  tabBar: { flexDirection: 'row', gap: 6 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, alignItems: 'center' },
  tabBtnActive: { backgroundColor: colors.maroon, borderColor: colors.maroon },
  tabBtnText: { color: colors.muted, fontSize: 10, fontWeight: '800' },
  tabBtnTextActive: { color: colors.paper },
  productCard: { borderRadius: 24, backgroundColor: colors.paper, overflow: 'hidden', borderWidth: 1, borderColor: colors.line, ...shadows.card },
  productImg: { height: 150, width: '100%', objectFit: 'cover' },
  productInfo: { padding: 16 },
  productTitle: { fontSize: 15, fontWeight: '900', color: colors.maroonDark },
  productDesc: { fontSize: 11, color: colors.muted, marginTop: 4 },
  productPrice: { fontSize: 16, fontWeight: '900', color: colors.maroon },
  stockLabel: { fontSize: 9, color: colors.error, fontWeight: 'bold' },
  addBtn: { height: 38, borderRadius: 8, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  addBtnText: { color: colors.paper, fontSize: 11, fontWeight: '900' },
  card: { padding: 20, borderRadius: 24, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, ...shadows.card },
  cardTitle: { fontSize: 13, fontWeight: '900', color: colors.maroonDark },
  emptyText: { color: colors.muted, fontSize: 11, fontStyle: 'italic', textAlign: 'center', marginVertical: 20 },
  cartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line },
  cartItemTitle: { fontSize: 12, fontWeight: 'bold', color: colors.ink },
  cartItemPrice: { fontSize: 10, color: colors.muted, marginTop: 2 },
  cartQty: { fontSize: 13, fontWeight: 'bold', width: 20, textAlign: 'center' },
  input: { height: 40, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.line, borderRadius: 8, fontSize: 11, color: colors.ink, backgroundColor: colors.paper, marginBottom: 6 },
  saveAddressBtn: { height: 36, borderRadius: 8, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  saveAddressBtnText: { color: colors.paper, fontSize: 10, fontWeight: '900' },
  addressTile: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.line, marginTop: 6 },
  addressTileActive: { borderColor: colors.maroon, backgroundColor: '#fff5f5' },
  checkoutBtn: { height: 46, borderRadius: 10, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  checkoutBtnText: { color: colors.paper, fontSize: 12, fontWeight: '900' }
});
