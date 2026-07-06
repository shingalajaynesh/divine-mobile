import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Checkbox, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { 
  GET_DIET_PREFERENCE_QUERY, GET_MY_MEAL_PLANS_QUERY, GET_SHOPPING_LIST_QUERY,
  UPDATE_DIET_PREFERENCE_MUTATION, TOGGLE_MEAL_PLAN_MUTATION, 
  ADD_SHOPPING_ITEM_MUTATION, TOGGLE_SHOPPING_ITEM_MUTATION, CLEAR_PURCHASED_SHOPPING_LIST_MUTATION 
} from '../graphql/operations.js';
import { colors, shadows } from '../theme/theme.js';

const PRESET_ALLERGENS = ['Nuts', 'Dairy', 'Gluten', 'Soy', 'Eggs', 'Shellfish', 'Wheat', 'Peanuts'];

export default function DietPlanner({ user }) {
  const userLang = user?.language || 'en';
  const isHi = userLang === 'hi';
  const currentDay = user?.pregnancyDay || 1;

  // GQL Hooks
  const { data: prefData, refetch: refetchPref } = useQuery(GET_DIET_PREFERENCE_QUERY);
  const { data: mealData, refetch: refetchMeals } = useQuery(GET_MY_MEAL_PLANS_QUERY, {
    variables: { dayNumber: currentDay }
  });
  const { data: shoppingData, refetch: refetchShopping } = useQuery(GET_SHOPPING_LIST_QUERY);

  const [updatePref, { loading: updatingPref }] = useMutation(UPDATE_DIET_PREFERENCE_MUTATION);
  const [toggleMeal] = useMutation(TOGGLE_MEAL_PLAN_MUTATION);
  const [addShopping, { loading: addingShopping }] = useMutation(ADD_SHOPPING_ITEM_MUTATION);
  const [toggleShopping] = useMutation(TOGGLE_SHOPPING_ITEM_MUTATION);
  const [clearPurchased] = useMutation(CLEAR_PURCHASED_SHOPPING_LIST_MUTATION);

  // States
  const [dietType, setDietType] = useState('VEG');
  const [allergens, setAllergens] = useState([]);
  const [notes, setNotes] = useState('');
  const [newIngredient, setNewIngredient] = useState('');
  const [newQty, setNewQty] = useState('');

  // Sync preference data
  useEffect(() => {
    if (prefData?.getDietPreference) {
      const p = prefData.getDietPreference;
      setDietType(p.dietType);
      setNotes(p.notes || '');
      try {
        setAllergens(JSON.parse(p.allergens || '[]'));
      } catch (e) {
        setAllergens([]);
      }
    }
  }, [prefData]);

  const toggleAllergen = (item) => {
    const lowerItem = item.toLowerCase();
    if (allergens.includes(lowerItem)) {
      setAllergens(allergens.filter(a => a !== lowerItem));
    } else {
      setAllergens([...allergens, lowerItem]);
    }
  };

  const handleSavePreferences = async () => {
    try {
      await updatePref({
        variables: { input: { dietType, allergens, notes } }
      });
      Alert.alert(isHi ? "सफलता" : "Success", isHi ? "आहार प्राथमिकताओं को सहेज लिया गया है।" : "Diet profile updated!");
      refetchPref();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleToggleMeal = async (mealPlanId, completed) => {
    try {
      await toggleMeal({ variables: { mealPlanId, completed } });
      refetchMeals();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleAddShopping = async () => {
    if (!newIngredient.trim()) return;
    try {
      await addShopping({
        variables: { input: { ingredientName: newIngredient.trim(), quantity: newQty.trim() } }
      });
      setNewIngredient('');
      setNewQty('');
      refetchShopping();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleToggleShopping = async (itemId, purchased) => {
    try {
      await toggleShopping({ variables: { itemId, purchased } });
      refetchShopping();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const handleClearPurchased = async () => {
    try {
      await clearPurchased();
      refetchShopping();
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      {/* Title */}
      <View style={s.hero}>
        <View style={s.badge}>
          <Text style={s.badgeText}>{isHi ? "पोषण और आहार" : "Diet & Nutrition"}</Text>
        </View>
        <Text style={s.heroTitle}>{isHi ? "गर्भावस्था आहार योजना" : "Diet Planner"}</Text>
        <Text style={s.heroSubtitle}>{isHi ? "स्वस्थ शिशु के लिए पौष्टिक भोजन योजना" : "Maternal sattvik diet logging & shopping checklist"}</Text>
      </View>

      {/* Card 1: Preferences */}
      <View style={s.card}>
        <Text style={s.cardTitle}>🥗 {isHi ? "आहार प्रोफाइल" : "Dietary Profile"}</Text>
        
        {/* Selector */}
        <Text style={s.label}>{isHi ? "आहार का प्रकार" : "Diet Type"}</Text>
        <View style={s.pickerRow}>
          {['VEG', 'VEGAN', 'NON_VEG'].map(type => (
            <TouchableOpacity 
              key={type} 
              style={[s.pickerBtn, dietType === type && s.pickerBtnActive]}
              onPress={() => setDietType(type)}
            >
              <Text style={[s.pickerBtnText, dietType === type && s.pickerBtnTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Allergen tags */}
        <Text style={s.label}>{isHi ? "एलर्जी / संवेदनशील सामग्री" : "Allergens / Sensitivities"}</Text>
        <View style={s.tagGrid}>
          {PRESET_ALLERGENS.map(item => {
            const active = allergens.includes(item.toLowerCase());
            return (
              <TouchableOpacity 
                key={item} 
                style={[s.tag, active && s.tagActive]}
                onPress={() => toggleAllergen(item)}
              >
                <Text style={[s.tagText, active && s.tagTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Notes */}
        <Text style={s.label}>{isHi ? "पोषण नोट्स" : "Nutrition Notes"}</Text>
        <TextInput
          style={s.textArea}
          value={notes}
          onChangeText={setNotes}
          placeholder={isHi ? "जैसे: हरी पत्तेदार सब्जियां, दूध आदि..." : "e.g., Prefers iron-rich, avoid dairy..."}
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity style={s.saveBtn} onPress={handleSavePreferences} disabled={updatingPref}>
          {updatingPref ? (
            <ActivityIndicator size="small" color={colors.paper} />
          ) : (
            <Text style={s.saveBtnText}>{isHi ? "प्रोफाइल सहेजें" : "Save Dietary Profile"}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Card 2: Meal Checklist */}
      <View style={s.card}>
        <Text style={s.cardTitle}>📅 {isHi ? `दिवस ${currentDay} आहार डायरी` : `Day ${currentDay} Meal Checklist`}</Text>
        
        {(mealData?.getMyMealPlans || []).map((meal) => (
          <TouchableOpacity 
            key={meal.id} 
            style={[s.mealItem, meal.completed && s.mealItemCompleted]}
            onPress={() => handleToggleMeal(meal.id, !meal.completed)}
          >
            <View style={{ flex: 1 }}>
              <Text style={s.mealTypeBadge}>{meal.mealType}</Text>
              <Text style={[s.mealName, meal.completed && s.mealNameCompleted]}>
                {meal.customMealName || (
                  meal.mealType === 'BREAKFAST' ? (isHi ? "दलिया और भीगे बादाम" : "Iron-rich Oatmeal & Almonds")
                  : meal.mealType === 'LUNCH' ? (isHi ? "पालक सब्जी, दाल और रोटी" : "Green Spinach Sabji, Dal & Roti")
                  : meal.mealType === 'SNACK' ? (isHi ? "नारियल पानी और मखाना" : "Roasted Makhana & Coconut Water")
                  : (isHi ? "मूंग दाल खिचड़ी" : "Light Moong Dal Khichdi")
                )}
              </Text>
            </View>
            <Ionicons 
              name={meal.completed ? "checkbox" : "square-outline"} 
              size={22} 
              color={meal.completed ? colors.success : colors.muted} 
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Card 3: Shopping list */}
      <View style={s.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={s.cardTitle}>🛒 {isHi ? "खरीदारी की सूची" : "Grocery List"}</Text>
          <TouchableOpacity onPress={handleClearPurchased}>
            <Text style={{ color: colors.maroon, fontSize: 11, fontWeight: '800' }}>{isHi ? "साफ करें" : "Clear Checked"}</Text>
          </TouchableOpacity>
        </View>

        {/* Inputs */}
        <TextInput
          style={s.input}
          value={newIngredient}
          onChangeText={setNewIngredient}
          placeholder={isHi ? "सामग्री का नाम (जैसे: पालक)" : "Ingredient name (e.g. Spinach)"}
        />
        <TextInput
          style={s.input}
          value={newQty}
          onChangeText={setNewQty}
          placeholder={isHi ? "मात्रा (जैसे: 250 ग्राम)" : "Quantity (e.g. 250g)"}
        />
        <TouchableOpacity style={s.addBtn} onPress={handleAddShopping} disabled={addingShopping}>
          <Ionicons name="plus" size={16} color={colors.paper} />
          <Text style={s.addBtnText}>{isHi ? "सूची में जोड़ें" : "Add to List"}</Text>
        </TouchableOpacity>

        {/* List */}
        <View style={{ marginTop: 16 }}>
          {(shoppingData?.getShoppingList || []).map(item => (
            <TouchableOpacity 
              key={item.id} 
              style={[s.shoppingItem, item.purchased && s.shoppingItemPurchased]}
              onPress={() => handleToggleShopping(item.id, !item.purchased)}
            >
              <Text style={[s.shoppingItemText, item.purchased && s.shoppingItemTextPurchased]}>
                {item.ingredientName} {item.quantity ? `(${item.quantity})` : ''}
              </Text>
              <Ionicons 
                name={item.purchased ? "checkmark-circle" : "ellipse-outline"} 
                size={20} 
                color={item.purchased ? colors.success : colors.muted} 
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 20, paddingBottom: 60, gap: 20 },
  hero: { marginBottom: 4 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: '#E6FFFA', borderWidth: 1, borderColor: '#319795', marginBottom: 8 },
  badgeText: { color: '#234e52', fontSize: 10, fontWeight: '800' },
  heroTitle: { color: colors.maroonDark, fontSize: 26, fontWeight: '900' },
  heroSubtitle: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  card: { padding: 20, borderRadius: 24, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, ...shadows.card },
  cardTitle: { color: colors.maroonDark, fontSize: 15, fontWeight: '900' },
  label: { color: colors.muted, fontSize: 11, fontWeight: '700', marginTop: 16, marginBottom: 8, textTransform: 'uppercase' },
  pickerRow: { flexDirection: 'row', gap: 8 },
  pickerBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.canvas, alignItems: 'center' },
  pickerBtnActive: { backgroundColor: colors.maroon, borderColor: colors.maroon },
  pickerBtnText: { color: colors.muted, fontSize: 11, fontWeight: '800' },
  pickerBtnTextActive: { color: colors.paper },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.canvas },
  tagActive: { backgroundColor: colors.saffron, borderColor: colors.saffron },
  tagText: { color: colors.muted, fontSize: 11, fontWeight: '600' },
  tagTextActive: { color: colors.paper, fontWeight: '700' },
  textArea: { backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 12, fontSize: 12, color: colors.ink, minHeight: 64, textAlignVertical: 'top' },
  saveBtn: { marginTop: 16, height: 46, borderRadius: 14, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { color: colors.paper, fontSize: 12, fontWeight: '900' },
  mealItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.line, marginTop: 12 },
  mealItemCompleted: { backgroundColor: '#F0FDF4', borderColor: '#bcf0da' },
  mealTypeBadge: { fontSize: 8, fontWeight: '900', color: colors.muted, textTransform: 'uppercase', marginBottom: 2 },
  mealName: { fontSize: 12, fontWeight: '700', color: colors.ink },
  mealNameCompleted: { textDecorationLine: 'line-through', color: '#94a3b8' },
  input: { backgroundColor: colors.canvas, borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 12, color: colors.ink, marginBottom: 8 },
  addBtn: { flexDirection: 'row', gap: 6, height: 40, borderRadius: 10, backgroundColor: colors.maroon, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: colors.paper, fontSize: 11, fontWeight: '800' },
  shoppingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  shoppingItemPurchased: { opacity: 0.6 },
  shoppingItemText: { fontSize: 12, color: colors.ink, fontWeight: '600' },
  shoppingItemTextPurchased: { textDecorationLine: 'line-through', color: '#94a3b8' }
});
