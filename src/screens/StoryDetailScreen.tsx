import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { STORIES } from '../data/stories';

type Nav   = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'StoryDetail'>;

export default function StoryDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();
  const story      = STORIES.find(s => s.id === route.params.storyId);

  if (!story) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Historia no encontrada.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Coloured header */}
      <View style={[styles.header, { backgroundColor: story.color }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        {!story.complete && (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonBadgeText}>Próximamente</Text>
          </View>
        )}

        <Text style={styles.title}>{story.title}</Text>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.description}>{story.description}</Text>

        {story.complete ? (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Marcadores</Text>
              <Text style={styles.infoValue}>7</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Duración estimada</Text>
              <Text style={styles.infoValue}>~15 min</Text>
            </View>
            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => navigation.navigate('ARStory', { storyId: story.id })}>
              <Text style={styles.startButtonText}>Comenzar AR  →</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.comingSoonBlock}>
            <Text style={styles.comingSoonBlockText}>
              Esta historia estará disponible próximamente.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  content:   { paddingBottom: 48 },

  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    minHeight: 200,
    justifyContent: 'flex-end',
  },
  backButton: {
    position: 'absolute',
    top: 52,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: '#FFFFFF', fontSize: 26, lineHeight: 30 },

  comingSoonBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  comingSoonBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  title: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },

  body:        { padding: 24 },
  description: { fontSize: 15, color: '#AABBCC', lineHeight: 22, marginBottom: 28 },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  infoLabel: { fontSize: 14, color: '#8899BB' },
  infoValue: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
  divider:   { height: 1, backgroundColor: '#1a1a3a' },

  startButton: {
    backgroundColor: '#4488FF',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 28,
  },
  startButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },

  comingSoonBlock: {
    backgroundColor: '#111133',
    borderRadius: 14,
    padding: 24,
    marginTop: 16,
    alignItems: 'center',
  },
  comingSoonBlockText: { color: '#8899BB', fontSize: 14, textAlign: 'center', lineHeight: 22 },

  errorText: { color: '#FFFFFF', textAlign: 'center', marginTop: 60, fontSize: 16 },
});
