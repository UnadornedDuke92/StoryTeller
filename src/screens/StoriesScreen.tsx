import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { STORIES } from '../data/stories';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function StoriesScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <FlatList
        data={STORIES}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.header}>Tus historias</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('StoryDetail', { storyId: item.id })}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowDesc}>{item.description}</Text>
            </View>
            {item.complete ? (
              <View style={styles.readyBadge}>
                <Text style={styles.readyBadgeText}>AR</Text>
              </View>
            ) : (
              <View style={styles.soonBadge}>
                <Text style={styles.soonBadgeText}>Pronto</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.freeButton}
            onPress={() => navigation.navigate('AR')}>
            <Text style={styles.freeButtonText}>Free AR Session</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  list:      { padding: 20, paddingBottom: 40 },

  header: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', marginBottom: 20 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111133',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  dot:     { width: 44, height: 44, borderRadius: 22, marginRight: 14 },
  rowText: { flex: 1 },
  rowTitle:{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  rowDesc: { fontSize: 12, color: '#8899BB', marginTop: 3 },

  readyBadge: {
    backgroundColor: '#4488FF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  readyBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

  soonBadge: {
    backgroundColor: '#2a2a4a',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#3a3a6a',
  },
  soonBadgeText: { color: '#8899BB', fontSize: 11, fontWeight: '600' },

  freeButton: {
    backgroundColor: '#4488FF',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  freeButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
});
