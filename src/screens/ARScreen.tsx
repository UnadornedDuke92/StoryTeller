import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, PermissionsAndroid, Platform, ActivityIndicator } from 'react-native';
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroARPlane,
  ViroText,
  ViroSphere,
  ViroBox,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroNode,
  ViroAnimations,
  ViroMaterials,
  ViroARPlaneSelector,
} from '@reactvision/react-viro';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '../context/SettingsContext';

ViroAnimations.registerAnimations({
  spin: { properties: { rotateY: '+=360' }, duration: 3000 },
});

ViroMaterials.createMaterials({
  orb_blue:   { diffuseColor: '#4488FF', lightingModel: 'Blinn' },
  orb_gold:   { diffuseColor: '#FFD700', lightingModel: 'Blinn' },
  orb_purple: { diffuseColor: '#CC44FF', lightingModel: 'Blinn' },
  orb_green:  { diffuseColor: '#44FF88', lightingModel: 'Blinn' },
  orb_red:    { diffuseColor: '#FF4466', lightingModel: 'Blinn' },
  plane_grid: { diffuseColor: 'rgba(68,136,255,0.12)', lightingModel: 'Constant' },
});

const freeSceneSettings = { planeViz: false };

const STORY_ORBS = [
  { id: 0, position: [-0.35, 0.0, -1.5] as [number, number, number], material: 'orb_blue',   story: 'Once upon\na time...' },
  { id: 1, position: [0,    0.15, -1.5] as [number, number, number], material: 'orb_gold',   story: 'A hero\narose.' },
  { id: 2, position: [0.35, 0.0, -1.5]  as [number, number, number], material: 'orb_purple', story: 'And the world\nchanged forever.' },
];

const PLACED_MATERIALS = ['orb_green', 'orb_red', 'orb_blue', 'orb_gold', 'orb_purple'] as const;

type PlacedOrb = { id: number; position: [number, number, number]; material: string };
type ARAnchor = { position: [number, number, number]; [key: string]: unknown };

function ARScene() {
  const [tappedOrb, setTappedOrb] = useState<number | null>(null);
  const [placedOrbs, setPlacedOrbs] = useState<PlacedOrb[]>([]);
  const [counter, setCounter] = useState(0);

  const handlePlaneTap = (anchor: ARAnchor) => {
    const pos: [number, number, number] = [
      anchor.position[0],
      anchor.position[1] + 0.06,
      anchor.position[2],
    ];
    setPlacedOrbs(prev => [
      ...prev,
      { id: counter, position: pos, material: PLACED_MATERIALS[counter % PLACED_MATERIALS.length] },
    ]);
    setCounter(c => c + 1);
  };

  const hintText =
    placedOrbs.length === 0
      ? 'Tap story orbs  ·  Scan floor to place your own'
      : `${placedOrbs.length} orb${placedOrbs.length !== 1 ? 's' : ''} placed`;

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={200} />
      <ViroDirectionalLight color="#ffffff" direction={[0, -1, -0.2]} intensity={400} />

      {freeSceneSettings.planeViz && (
        <ViroARPlane minHeight={0.1} minWidth={0.1} alignment="Horizontal">
          <ViroBox scale={[1, 0.002, 1]} materials={['plane_grid']} />
        </ViroARPlane>
      )}

      <ViroText
        text="StoryTeller AR"
        position={[0, 0.55, -1.5]}
        scale={[0.55, 0.55, 0.55]}
        style={arTextStyles.title}
      />
      <ViroText
        text={hintText}
        position={[0, 0.38, -1.5]}
        scale={[0.28, 0.28, 0.28]}
        style={arTextStyles.hint}
      />

      {STORY_ORBS.map(orb => (
        <ViroNode key={orb.id} position={orb.position}>
          <ViroSphere
            radius={0.075}
            materials={[orb.material]}
            animation={{ name: 'spin', run: true, loop: true }}
            onClick={() => setTappedOrb(prev => (prev === orb.id ? null : orb.id))}
          />
          {tappedOrb === orb.id && (
            <ViroText
              text={orb.story}
              position={[0, 0.17, 0]}
              scale={[0.28, 0.28, 0.28]}
              style={arTextStyles.story}
            />
          )}
        </ViroNode>
      ))}

      <ViroARPlaneSelector onPlaneSelected={handlePlaneTap}>
        {placedOrbs.map(orb => (
          <ViroNode key={orb.id} position={orb.position}>
            <ViroSphere
              radius={0.06}
              materials={[orb.material]}
              animation={{ name: 'spin', run: true, loop: true }}
            />
          </ViroNode>
        ))}
      </ViroARPlaneSelector>
    </ViroARScene>
  );
}

const arTextStyles = {
  title: { fontFamily: 'Arial', fontSize: 22, color: '#FFFFFF', fontWeight: 'bold' as const, textAlign: 'center' as const, textAlignVertical: 'center' as const },
  hint:  { fontFamily: 'Arial', fontSize: 14, color: '#AADDFF', textAlign: 'center' as const, textAlignVertical: 'center' as const },
  story: { fontFamily: 'Arial', fontSize: 16, color: '#FFFFFF', textAlign: 'center' as const, textAlignVertical: 'center' as const },
};

type PermState = 'checking' | 'granted' | 'denied';

export default function ARScreen() {
  const navigation = useNavigation();
  const { settings } = useSettings();
  const [perm, setPerm] = useState<PermState>('checking');

  freeSceneSettings.planeViz = settings.planeViz;

  useEffect(() => {
    if (Platform.OS !== 'android') { setPerm('granted'); return; }
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA).then(result => {
      setPerm(result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied');
    });
  }, []);

  if (perm === 'checking') {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#4488FF" />
        <Text style={styles.permText}>Requesting camera access…</Text>
      </View>
    );
  }

  if (perm === 'denied') {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.permTitle}>Camera access required</Text>
        <Text style={styles.permText}>Please allow camera permission to use AR.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        autofocus
        hdrEnabled={settings.highQuality}
        bloomEnabled={settings.highQuality}
        shadowsEnabled={settings.highQuality}
        initialScene={{ scene: ARScene }}
        style={StyleSheet.absoluteFill}
      />
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  permTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  permText: {
    fontSize: 14,
    color: '#8899BB',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginTop: 4,
  },
  backButton: {
    marginTop: 8,
    backgroundColor: '#4488FF',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 52,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
