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

const featured = STORIES.find(s => s.complete) ?? STORIES[0];

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroEyebrow}>Bienvenido a</Text>
        <Text style={styles.heroTitle}>StoryTeller</Text>
        <Text style={styles.heroSub}>
          Explora historias que cobran vida frente a tus ojos a través de la realidad aumentada.
        </Text>
      </View>

      {/* How it works */}
      <Text style={styles.sectionTitle}>¿Cómo funciona?</Text>
      <View style={styles.stepsCard}>
        {[
          { n: '1', text: 'Imprime los marcadores de la historia' },
          { n: '2', text: 'Abre la historia y apunta la cámara al marcador' },
          { n: '3', text: 'Recoge las lágrimas y avanza por la historia' },
        ].map(step => (
          <View key={step.n} style={styles.stepRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{step.n}</Text>
            </View>
            <Text style={styles.stepText}>{step.text}</Text>
          </View>
        ))}
      </View>

      {/* Featured story */}
      <Text style={styles.sectionTitle}>Historia destacada</Text>
      <TouchableOpacity
        style={[styles.featuredCard, { backgroundColor: featured.color }]}
        onPress={() => navigation.navigate('StoryDetail', { storyId: featured.id })}>
        <Text style={styles.featuredLabel}>DISPONIBLE AHORA</Text>
        <Text style={styles.featuredTitle}>{featured.title}</Text>
        <Text style={styles.featuredDesc}>{featured.description}</Text>
        <View style={styles.featuredCta}>
          <Text style={styles.featuredCtaText}>Comenzar  →</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  content:   { padding: 20, paddingBottom: 48 },

  hero: {
    paddingVertical: 36,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  heroEyebrow: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4488FF',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 14,
  },
  heroSub: {
    fontSize: 15,
    color: '#AABBCC',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8899BB',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 28,
  },

  stepsCard: {
    backgroundColor: '#111133',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(68,136,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(68,136,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: { color: '#4488FF', fontSize: 14, fontWeight: '700' },
  stepText:      { flex: 1, fontSize: 14, color: '#AABBCC', lineHeight: 20 },

  featuredCard: {
    borderRadius: 20,
    padding: 24,
  },
  featuredLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  featuredTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  featuredDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    marginBottom: 20,
  },
  featuredCta: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  featuredCtaText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});
