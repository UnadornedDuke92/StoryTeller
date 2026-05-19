import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  ImageSourcePropType,
} from 'react-native';
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroARImageMarker,
  ViroARTrackingTargets,
  Viro3DObject,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroAnimations,
  ViroNode,
} from '@reactvision/react-viro';
import { useNavigation } from '@react-navigation/native';

// ---------------------------------------------------------------------------
// 1. REGISTER YOUR MARKERS
//    source: require() path to the image in assets/markers/
//    physicalWidth: real-world printed width in METRES (e.g. 0.15 = 15 cm)
// ---------------------------------------------------------------------------
ViroARTrackingTargets.createTargets({
  sample_marker: {
    source: require('../../assets/markers/Marker1.png'),
    orientation: 'Up',
    physicalWidth: 0.15,
  },
});

ViroAnimations.registerAnimations({
  spin: { properties: { rotateY: '+=360' }, duration: 4000 },
  rise: { properties: { positionY: 0.1 },   duration: 600, easing: 'EaseOut' },
});

// ---------------------------------------------------------------------------
// 2. MARKER → MODEL MAPPING
//    image:     shown in the bottom card so the user knows what to scan
//    modelFile: filename inside android/app/src/main/assets/models/
//               set to null until you drop in the .glb file
//    scale:     [x,y,z] in metres — tune until the model looks right
// ---------------------------------------------------------------------------
const MARKERS: Array<{
  target: string;
  label: string;
  image: ImageSourcePropType;
  modelFile: string | null;
  scale: [number, number, number];
}> = [
  {
    target:    'sample_marker',
    label:     'Sample Story',
    image:     require('../../assets/markers/Marker1.png'),
    modelFile: 'forest_lighting_wip.glb',
    scale:     [0.005, 0.005, 0.005],
  },
];

function assetUri(path: string) {
  return { uri: `file:///android_asset/${path}` };
}

// ---------------------------------------------------------------------------
// Module-level callbacks — set by the screen, called by the AR scene.
// This avoids the ViroARSceneNavigator "scene must be () => Element" constraint.
// ---------------------------------------------------------------------------
const sceneCallbacks = {
  onMarkerFound: (_target: string) => {},
  onMarkerLost:  (_target: string) => {},
};

// ---------------------------------------------------------------------------
// AR Scene
// ---------------------------------------------------------------------------
function ARMarkerScene() {
  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={200} />
      <ViroDirectionalLight color="#ffffff" direction={[0, -1, -0.2]} intensity={400} />

      {MARKERS.map(marker => (
        <ViroARImageMarker
          key={marker.target}
          target={marker.target}
          onAnchorFound={()  => sceneCallbacks.onMarkerFound(marker.target)}
          onAnchorRemoved={() => sceneCallbacks.onMarkerLost(marker.target)}>

          {marker.modelFile ? (
            <ViroNode
              position={[0, 0, 0]}
              animation={{ name: 'rise', run: true, loop: false }}>
              <Viro3DObject
                source={assetUri(`models/${marker.modelFile}`)}
                resources={[]}
                position={[0, 0, 0]}
                scale={marker.scale}
                type="GLB"
                animation={{ name: 'spin', run: true, loop: true }}
              />
            </ViroNode>
          ) : null}
        </ViroARImageMarker>
      ))}
    </ViroARScene>
  );
}

// ---------------------------------------------------------------------------
// Pulsing scanner frame shown before any marker is detected
// ---------------------------------------------------------------------------
function ScannerFrame() {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);

  const corner = (pos: object) => (
    <Animated.View style={[styles.corner, pos, { opacity: pulse }]} />
  );

  return (
    <View style={styles.scannerFrame} pointerEvents="none">
      {corner(styles.cornerTL)}
      {corner(styles.cornerTR)}
      {corner(styles.cornerBL)}
      {corner(styles.cornerBR)}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Bottom card — shows marker thumbnail + scan status
// ---------------------------------------------------------------------------
function MarkerCard({
  marker,
  detected,
}: {
  marker: (typeof MARKERS)[number];
  detected: boolean;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: detected ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [detected, fadeAnim]);

  return (
    <View style={styles.card}>
      <Image source={marker.image} style={styles.markerThumb} resizeMode="contain" />
      <View style={styles.cardText}>
        <Text style={styles.cardLabel}>{marker.label}</Text>
        <Text style={styles.cardSub}>Scan this marker</Text>
      </View>

      {/* Scanning indicator */}
      <Animated.View style={[styles.statusBadge, styles.badgeFound, { opacity: fadeAnim }]}>
        <Text style={styles.badgeText}>Found</Text>
      </Animated.View>
      <Animated.View style={[styles.statusBadge, styles.badgeScanning, { opacity: Animated.subtract(1, fadeAnim) }]}>
        <Text style={styles.badgeText}>Scanning...</Text>
      </Animated.View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function ARMarkerScreen() {
  const navigation = useNavigation();
  const [detected, setDetected] = useState<Record<string, boolean>>({});

  const anyDetected = Object.values(detected).some(Boolean);

  sceneCallbacks.onMarkerFound = (target: string) =>
    setDetected(prev => ({ ...prev, [target]: true }));
  sceneCallbacks.onMarkerLost = (target: string) =>
    setDetected(prev => ({ ...prev, [target]: false }));

  return (
    <View style={styles.container}>
      {/* Full-screen AR */}
      <ViroARSceneNavigator
        autofocus
        initialScene={{ scene: ARMarkerScene }}
        style={StyleSheet.absoluteFill}
      />

      {/* Scanner frame — hidden once marker is found */}
      {!anyDetected && <ScannerFrame />}

      {/* "Marker found" banner */}
      {anyDetected && (
        <View style={styles.foundBanner}>
          <Text style={styles.foundText}>Marker detected</Text>
        </View>
      )}

      {/* Bottom cards — one per marker */}
      <View style={styles.cardRow}>
        {MARKERS.map(marker => (
          <MarkerCard
            key={marker.target}
            marker={marker}
            detected={!!detected[marker.target]}
          />
        ))}
      </View>

      {/* Close button */}
      <TouchableOpacity style={styles.close} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const CORNER_SIZE = 28;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  // --- Scanner frame ---
  scannerFrame: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    width: 200,
    height: 200,
    marginLeft: -100,
    marginTop: -100,
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: '#4488FF',
  },
  cornerTL: { top: 0,    left: 0,  borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
  cornerTR: { top: 0,    right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS },
  cornerBL: { bottom: 0, left: 0,  borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS },

  // --- Found banner ---
  foundBanner: {
    position: 'absolute',
    top: 110,
    alignSelf: 'center',
    backgroundColor: 'rgba(34,197,94,0.85)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  foundText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // --- Bottom cards ---
  cardRow: {
    position: 'absolute',
    bottom: 32,
    left: 16,
    right: 16,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,10,26,0.88)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(68,136,255,0.3)',
  },
  markerThumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    marginRight: 12,
  },
  cardText: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardSub: {
    fontSize: 12,
    color: '#8899BB',
    marginTop: 2,
  },

  // --- Status badges (layered, faded in/out) ---
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    position: 'absolute',
    right: 12,
  },
  badgeFound: {
    backgroundColor: 'rgba(34,197,94,0.9)',
  },
  badgeScanning: {
    backgroundColor: 'rgba(68,136,255,0.7)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // --- Close button ---
  close: {
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
  closeText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
});
