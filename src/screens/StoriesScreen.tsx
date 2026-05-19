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

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STORIES = [
  { id: '1', title: 'The Forest Path',   desc: 'A journey through an ancient wood.', color: '#2d6a4f', orbs: 3 },
  { id: '2', title: 'Ocean of Stars',    desc: 'Explore the cosmos above your head.', color: '#1a3a6b', orbs: 5 },
  { id: '3', title: 'Lost City',         desc: 'Uncover ruins hidden in plain sight.', color: '#6b3a1a', orbs: 4 },
  { id: '4', title: 'The Time Garden',   desc: 'Watch seasons change around you.', color: '#4a1a6b', orbs: 6 },
  { id: '5', title: 'Deep Sea',          desc: 'Dive into the ocean floor.', color: '#0d2b45', orbs: 4 },
];

export default function StoriesScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <FlatList
        data={STORIES}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.header}>Your Stories</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('ARMarker')}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowDesc}>{item.desc}</Text>
            </View>
            <View style={styles.orbBadge}>
              <Text style={styles.scanIcon}>⬡</Text>
              <Text style={styles.orbLabel}>scan</Text>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.markerButton}
              onPress={() => navigation.navigate('ARMarker')}>
              <Text style={styles.markerButtonText}>Scan Marker</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.newButton}
              onPress={() => navigation.navigate('AR')}>
              <Text style={styles.newButtonText}>Free AR Session</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111133',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  dot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 14,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rowDesc: {
    fontSize: 12,
    color: '#8899BB',
    marginTop: 3,
  },
  orbBadge: {
    alignItems: 'center',
    marginLeft: 8,
  },
  orbCount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4488FF',
  },
  orbLabel: {
    fontSize: 10,
    color: '#8899BB',
  },
  scanIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4488FF',
  },
  footer: {
    marginTop: 16,
    gap: 10,
  },
  markerButton: {
    backgroundColor: '#CC44FF',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  markerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  newButton: {
    backgroundColor: '#4488FF',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  newButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
