import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { STORIES, MARKER_STEPS } from '../data/stories';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function progressKey(storyId: string) { return `progress_${storyId}`; }

export default function StoriesScreen() {
  const navigation = useNavigation<Nav>();
  const [progress, setProgress] = useState<Record<string, number | null>>({});

  useFocusEffect(useCallback(() => {
    const load = async () => {
      const entries = await Promise.all(
        STORIES.filter(s => s.complete).map(async s => {
          const val = await AsyncStorage.getItem(progressKey(s.id));
          const n = val !== null ? parseInt(val, 10) : null;
          return [s.id, n !== null && n > 0 ? n : null] as [string, number | null];
        }),
      );
      setProgress(Object.fromEntries(entries));
    };
    load();
  }, []));

  return (
    <View style={styles.container}>
      <FlatList
        data={STORIES}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.header}>Historias</Text>}
        renderItem={({ item }) => {
          const savedStep = progress[item.id] ?? null;
          const hasProgress = savedStep !== null;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('StoryDetail', { storyId: item.id })}
              disabled={!item.complete}>
              {/* Colour strip */}
              <View style={[styles.strip, { backgroundColor: item.color }]} />

              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {item.complete ? (
                    hasProgress ? (
                      <View style={styles.badgeProgress}>
                        <Text style={styles.badgeText}>
                          {savedStep! + 1}/{MARKER_STEPS.length}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.badgeReady}>
                        <Text style={styles.badgeText}>AR</Text>
                      </View>
                    )
                  ) : (
                    <View style={styles.badgeSoon}>
                      <Text style={styles.badgeSoonText}>Pronto</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.cardDesc}>{item.description}</Text>

                {item.complete && hasProgress && (
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${((savedStep! + 1) / MARKER_STEPS.length) * 100}%` },
                      ]}
                    />
                  </View>
                )}

                {item.complete && (
                  <Text style={styles.cardCta}>
                    {hasProgress ? 'Continuar  →' : 'Comenzar  →'}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  list:      { padding: 20, paddingBottom: 48 },

  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#111133',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  strip: {
    width: 5,
  },
  cardBody: {
    flex: 1,
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardDesc: {
    fontSize: 12,
    color: '#8899BB',
    lineHeight: 18,
    marginBottom: 10,
  },
  cardCta: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4488FF',
  },

  progressBar: {
    height: 3,
    backgroundColor: 'rgba(68,136,255,0.2)',
    borderRadius: 2,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4488FF',
    borderRadius: 2,
  },

  badgeReady: {
    backgroundColor: '#4488FF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeProgress: {
    backgroundColor: 'rgba(68,136,255,0.25)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(68,136,255,0.5)',
  },
  badgeSoon: {
    backgroundColor: '#2a2a4a',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#3a3a6a',
  },
  badgeText:     { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  badgeSoonText: { color: '#8899BB', fontSize: 11, fontWeight: '600' },
});
