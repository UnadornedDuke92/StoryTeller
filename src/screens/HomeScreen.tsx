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
import { STORIES } from '../data/stories';

type Nav = NativeStackNavigationProp<RootStackParamList>;

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
          <Text style={styles.heroButtonText}>Free AR Session</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Historias</Text>
      {STORIES.map(story => (
        <TouchableOpacity
          key={story.id}
          style={[styles.card, { backgroundColor: story.color }]}
          onPress={() => navigation.navigate('StoryDetail', { storyId: story.id })}>
          {!story.complete && (
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Próximamente</Text>
            </View>
          )}
          <Text style={styles.cardTitle}>{story.title}</Text>
          <Text style={styles.cardDesc}>{story.description}</Text>
          <Text style={styles.cardCta}>{story.complete ? 'Ver en AR →' : '…'}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  content:   { padding: 20, paddingBottom: 40 },

  hero: {
    backgroundColor: '#111133',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 32,
  },
  heroTitle: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 1 },
  heroSub:   { fontSize: 14, color: '#AADDFF', marginTop: 6, marginBottom: 24, textAlign: 'center' },
  heroButton: {
    backgroundColor: '#4488FF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
    marginTop: 10,
  },
  heroButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 16 },

  card: { borderRadius: 16, padding: 20, marginBottom: 12 },

  comingSoonBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  comingSoonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  cardTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  cardDesc:  { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4, marginBottom: 12 },
  cardCta:   { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
});
