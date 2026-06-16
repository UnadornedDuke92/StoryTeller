import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { MARKER_STEPS } from '../data/stories';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MARKER_LABELS = [
  'El campamento',
  'El guía',
  'El árbol misterioso',
  'El Gólem',
  'El encuentro',
  'La melancolía',
  'El camino',
];

const MARKER_IMAGES = [
  require('../../assets/markers/FO-Marker1.png'),
  require('../../assets/markers/FO-Marker2.png'),
  require('../../assets/markers/FO-Marker3.png'),
  require('../../assets/markers/FO-Marker4.png'),
  require('../../assets/markers/FO-Marker5.png'),
  require('../../assets/markers/FO-Marker6.png'),
  require('../../assets/markers/FO-Marker7.png'),
];

export default function MarkersScreen() {
  const navigation = useNavigation<Nav>();

  const shareMarker = async (index: number) => {
    const label = MARKER_LABELS[index];
    await Share.share({
      title: `Marcador ${index + 1} — ${label}`,
      message:
        `StoryTeller: Las Lágrimas\n` +
        `Marcador ${index + 1} — ${label}\n\n` +
        `Imprime este marcador y escanéalo con la cámara para vivir la experiencia AR.`,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Marcadores</Text>
        <Text style={styles.subtitle}>
          Imprime estos marcadores y escanéalos con la cámara para vivir la historia.
        </Text>
      </View>

      <View style={styles.list}>
        {MARKER_STEPS.map((step, i) => (
          <View key={step.targetName} style={styles.card}>
            <View style={styles.imageWrapper}>
              <Image
                source={MARKER_IMAGES[i]}
                style={styles.markerImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.markerNumber}>Marcador {i + 1}</Text>
              <Text style={styles.markerLabel}>{MARKER_LABELS[i]}</Text>
              <Text style={styles.markerInstruction}>
                Imprime y escanea con la cámara
              </Text>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => shareMarker(i)}>
                <Text style={styles.shareButtonText}>Compartir  ↑</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  content:   { paddingBottom: 48 },

  header: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    backgroundColor: '#111133',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a3a',
  },
  backButton: {
    marginBottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { color: '#FFFFFF', fontSize: 26, lineHeight: 30 },
  title:    { fontSize: 28, fontWeight: '800', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#8899BB', lineHeight: 20 },

  list: { padding: 20, gap: 12 },

  card: {
    flexDirection: 'row',
    backgroundColor: '#111133',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e1e44',
  },
  imageWrapper: {
    width: 110,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerImage: {
    width: 100,
    height: 100,
  },
  cardBody: {
    flex: 1,
    padding: 14,
  },
  markerNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4488FF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  markerLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  markerInstruction: {
    fontSize: 12,
    color: '#8899BB',
    lineHeight: 16,
    marginBottom: 12,
  },
  shareButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(68,136,255,0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(68,136,255,0.3)',
  },
  shareButtonText: {
    color: '#4488FF',
    fontSize: 12,
    fontWeight: '700',
  },
});
