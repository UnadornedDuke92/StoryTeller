import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { STORIES, MARKER_STEPS } from '../data/stories';

type Nav   = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'StoryDetail'>;

function progressKey(storyId: string) { return `progress_${storyId}`; }

export default function StoryDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();
  const story      = STORIES.find(s => s.id === route.params.storyId);

  const [savedStep, setSavedStep] = useState<number | null>(null);

  useFocusEffect(useCallback(() => {
    if (!story?.complete) { return; }
    AsyncStorage.getItem(progressKey(story.id)).then(val => {
      const n = val !== null ? parseInt(val, 10) : null;
      setSavedStep(n !== null && n > 0 ? n : null);
    });
  }, [story]));

  const startFresh = async () => {
    if (!story) { return; }
    await AsyncStorage.removeItem(progressKey(story.id));
    navigation.navigate('ARStory', { storyId: story.id, initialStep: 0 });
  };

  const continueStory = () => {
    if (!story || savedStep === null) { return; }
    navigation.navigate('ARStory', { storyId: story.id, initialStep: savedStep });
  };

  if (!story) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Historia no encontrada.</Text>
      </View>
    );
  }

  const savedMarkerLabel = savedStep !== null
    ? `Marcador ${savedStep + 1} / ${MARKER_STEPS.length}`
    : null;

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

            {/* Saved checkpoint */}
            {savedMarkerLabel ? (
              <View style={styles.checkpointBlock}>
                <Text style={styles.checkpointTitle}>Progreso guardado</Text>
                <Text style={styles.checkpointSub}>Continuarás desde el {savedMarkerLabel}</Text>

                <TouchableOpacity style={styles.continueButton} onPress={continueStory}>
                  <Text style={styles.continueButtonText}>Continuar  →</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.resetButton} onPress={startFresh}>
                  <Text style={styles.resetButtonText}>Reiniciar desde el principio</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.startButton} onPress={startFresh}>
                <Text style={styles.startButtonText}>Comenzar AR  →</Text>
              </TouchableOpacity>
            )}
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

  checkpointBlock: {
    backgroundColor: '#111133',
    borderRadius: 16,
    padding: 20,
    marginTop: 28,
    borderWidth: 1,
    borderColor: 'rgba(68,136,255,0.3)',
  },
  checkpointTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4488FF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  checkpointSub: {
    fontSize: 14,
    color: '#AABBCC',
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: '#4488FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  continueButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  resetButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a4a',
  },
  resetButtonText: { color: '#8899BB', fontSize: 14, fontWeight: '600' },

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
