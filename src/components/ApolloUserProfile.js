import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './styles.js';

export default function ApolloUserProfile({ user }) {
  if (!user) return null;

  return (
    <View style={styles.headerProfileTextContainer}>
      <Text style={styles.headerProfileName} numberOfLines={1}>{user.displayName}</Text>
      <Text style={styles.headerProfileSub} numberOfLines={1}>
        {user.role?.roleType || 'Mother'}
      </Text>
    </View>
  );
}
