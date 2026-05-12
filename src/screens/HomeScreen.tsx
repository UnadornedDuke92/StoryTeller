import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FEATURED = [
  { id: '1', title: 'The Forest Path', desc: 'A journey through an ancient wood.', color: '#2d6a4f' },
  { id: '2', title: 'Ocean of Stars', desc: 'Explore the cosmos above your head.', color: '#1a3a6b' },
  { id: '3', title: 'Lost City', desc: 'Uncover ruins hidden in plain sight.', color: '#6b3a1a' },
];

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>StoryTeller</Text>
        <Text style={styles.heroSub}>Bring stories to life in your world</Text>
        <TouchableOpacity
          style={styles.heroButton}
          onPress={() => navigation.navigate('AR')}>
          <Text style={styles.heroButtonText}>Launch AR Experience</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Featured Stories</Text>
      {FEATURED.map(story => (
        <TouchableOpacity
          key={story.id}
          style={[styles.card, { backgroundColor: story.color }]}
          onPress={() => navigation.navigate('AR')}>
          <Text style={styles.cardTitle}>{story.title}</Text>
          <Text style={styles.cardDesc}>{story.desc}</Text>
          <Text style={styles.cardCta}>View in AR →</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: '#111133',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  heroSub: {
    fontSize: 14,
    color: '#AADDFF',
    marginTop: 6,
    marginBottom: 24,
    textAlign: 'center',
  },
  heroButton: {
    backgroundColor: '#4488FF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
    marginBottom: 12,
  },
  cardCta: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
