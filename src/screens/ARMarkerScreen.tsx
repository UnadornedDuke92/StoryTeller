import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  ImageSourcePropType,
  Vibration,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroARImageMarker,
  ViroARTrackingTargets,
  ViroARPlane,
  Viro3DObject,
  ViroAmbientLight,
  ViroDirectionalLight,
  ViroAnimations,
  ViroMaterials,
  ViroNode,
  ViroBox,
} from '@reactvision/react-viro';
import { useNavigation } from '@react-navigation/native';
import { useSettings } from '../context/SettingsContext';

// ---------------------------------------------------------------------------
// 1. REGISTER YOUR MARKERS
//    source: require() path to the image in assets/markers/
//    physicalWidth: real-world printed width in METRES (e.g. 0.15 = 15 cm)
// ---------------------------------------------------------------------------
ViroARTrackingTargets.createTargets({
  sample_marker: {
    source: require('../../assets/markers/FO-Marker1.png'),
    orientation: 'Up',
    physicalWidth: 0.15,
  },
});

ViroAnimations.registerAnimations({
  spin: { properties: { rotateY: '+=360' }, duration: 4000 },
  rise: { properties: { positionY: 0.1 }, duration: 600, easing: 'EaseOut' },
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
      target: 'sample_marker',
      label: 'Sample Story',
      image: require('../../assets/markers/Marker1.png'),
      modelFile: 'camping_buscraft_ambience.glb',
      scale: [0.005, 0.005, 0.005],
    },
  ];

function assetUri(path: string) {
  return { uri: `file:///android_asset/${path}` };
}

ViroMaterials.createMaterials({
  plane_grid: {
    diffuseColor: 'rgba(68,136,255,0.12)',
    lightingModel: 'Constant',
  },
});

// Module-level — updated by the screen before AR session starts.
const arSettings = { planeViz: false };

// ---------------------------------------------------------------------------
// Module-level callbacks — set by the screen, called by the AR scene.
// ---------------------------------------------------------------------------
const sceneCallbacks = {
  onMarkerFound: (_target: string) => { },
  onMarkerLost: (_target: string) => { },
  resetModel: () => { },
  rotateModel: (_target: string, _delta: number) => { },
};

type ModelState = { rotY: number; scaleFactor: number };

// ---------------------------------------------------------------------------
// AR Scene
// ---------------------------------------------------------------------------
function ARMarkerScene() {
  const [modelStates, setModelStates] = useState<Record<string, ModelState>>({});
  const pinchStartScale = useRef<Record<string, number>>({});

  // Let the screen trigger a reset / rotation from outside the scene
  sceneCallbacks.resetModel = () => setModelStates({});
  sceneCallbacks.rotateModel = (target: string, delta: number) =>
    setModelStates(prev => {
      const curr = prev[target] ?? { rotY: 0, scaleFactor: 1 };
      return { ...prev, [target]: { ...curr, rotY: curr.rotY + delta } };
    });

  const getState = (target: string): ModelState =>
    modelStates[target] ?? { rotY: 0, scaleFactor: 1 };

  const handlePinch = (target: string, pinchState: number, scaleFactor: number) => {
    if (pinchState === 1) {
      pinchStartScale.current[target] = getState(target).scaleFactor;
      return;
    }
    const base = pinchStartScale.current[target] ?? 1;
    const clamped = Math.max(0.2, Math.min(8, base * scaleFactor));
    setModelStates(prev => {
      const curr = prev[target] ?? { rotY: 0, scaleFactor: 1 };
      return { ...prev, [target]: { ...curr, scaleFactor: clamped } };
    });
  };

  return (
    <ViroARScene>
      <ViroAmbientLight color="#ffffff" intensity={400} />
      <ViroDirectionalLight color="#ffffff" direction={[0, -1, -0.2]} castsShadow intensity={1000} />

      {arSettings.planeViz && (
        <ViroARPlane minHeight={0.1} minWidth={0.1} alignment="Horizontal">
          <ViroBox scale={[1, 0.002, 1]} materials={['plane_grid']} />
        </ViroARPlane>
      )}

      {MARKERS.map(marker => {
        const state = getState(marker.target);
        const s = marker.scale[0] * state.scaleFactor;
        const appliedScale: [number, number, number] = [s, s, s];

        return (
          <ViroARImageMarker
            key={marker.target}
            target={marker.target}
            onAnchorFound={() => sceneCallbacks.onMarkerFound(marker.target)}
            onAnchorRemoved={() => sceneCallbacks.onMarkerLost(marker.target)}>

            {marker.modelFile ? (
              // Outer node: rise animation when marker first appears
              <ViroNode position={[0, 0, 0]} animation={{ name: 'rise', run: true, loop: false }}>
                {/* Inner node: user-controlled rotation + scale */}
                <ViroNode rotation={[0, state.rotY, 0]} scale={appliedScale}>
                  <Viro3DObject
                    source={assetUri(`models/${marker.modelFile}`)}
                    resources={[]}
                    position={[0, 0, 0]}
                    scale={[1, 1, 1]}
                    type="GLB"
                    highAccuracyEvents
                    onPinch={(pinchState, scaleFactor) =>
                      handlePinch(marker.target, pinchState, scaleFactor)
                    }
                  />
                </ViroNode>
              </ViroNode>
            ) : null}
          </ViroARImageMarker>
        );
      })}
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
const ROTATE_STEP = 5;   // degrees on a single tap
const ROTATE_HOLD_DELAY = 350;  // ms before continuous spin starts
const ROTATE_INTERVAL = 16;   // ms between steps during hold
const ROTATE_HOLD_STEP = 3;    // degrees per interval tick

type PermState = 'checking' | 'granted' | 'denied';

export default function ARMarkerScreen() {
  const navigation = useNavigation();
  const { settings } = useSettings();
  const [perm, setPerm] = useState<PermState>('checking');
  const [detected, setDetected] = useState<Record<string, boolean>>({});
  const hintOpacity = useRef(new Animated.Value(0)).current;
  const holdTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'android') { setPerm('granted'); return; }
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA).then(result => {
      setPerm(result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied');
    });
  }, []);

  const startRotation = (direction: 1 | -1) => {
    const target = MARKERS[0].target;
    sceneCallbacks.rotateModel(target, direction * ROTATE_STEP);
    holdTimeout.current = setTimeout(() => {
      holdInterval.current = setInterval(() => {
        sceneCallbacks.rotateModel(target, direction * ROTATE_HOLD_STEP);
      }, ROTATE_INTERVAL);
    }, ROTATE_HOLD_DELAY);
  };

  const stopRotation = () => {
    if (holdTimeout.current) { clearTimeout(holdTimeout.current); holdTimeout.current = null; }
    if (holdInterval.current) { clearInterval(holdInterval.current); holdInterval.current = null; }
  };

  const anyDetected = Object.values(detected).some(Boolean);

  arSettings.planeViz = settings.planeViz;

  sceneCallbacks.onMarkerFound = (target: string) =>
    setDetected(prev => ({ ...prev, [target]: true }));
  sceneCallbacks.onMarkerLost = (target: string) =>
    setDetected(prev => ({ ...prev, [target]: false }));

  // Haptic feedback when first marker is detected
  useEffect(() => {
    if (anyDetected && settings.haptics) {
      Vibration.vibrate(200);
    }
  }, [anyDetected, settings.haptics]);

  // Show gesture hint briefly when a marker is first found
  useEffect(() => {
    if (anyDetected) {
      Animated.sequence([
        Animated.timing(hintOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.delay(2500),
        Animated.timing(hintOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anyDetected]);

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
        <TouchableOpacity style={styles.permBack} onPress={() => navigation.goBack()}>
          <Text style={styles.permBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        autofocus
        pbrEnabled
        hdrEnabled={settings.highQuality}
        bloomEnabled={settings.highQuality}
        shadowsEnabled={settings.highQuality}
        initialScene={{ scene: ARMarkerScene }}
        style={StyleSheet.absoluteFill}
      />

      {/* Scanner frame — hidden once marker is found */}
      {!anyDetected && <ScannerFrame />}

      {/* Detected banner */}
      {anyDetected && (
        <View style={styles.foundBanner}>
          <Text style={styles.foundText}>Marker detected</Text>
        </View>
      )}

      {/* Gesture hint — fades in then auto-hides */}
      <Animated.View
        style={[styles.gestureHint, { opacity: hintOpacity }]}
        pointerEvents="none">
        <Text style={styles.gestureHintText}>Pinch to scale</Text>
      </Animated.View>

      {/* Rotation buttons — visible when a model is shown */}
      {anyDetected && (
        <View style={styles.rotationControls}>
          <TouchableOpacity
            style={styles.rotateButton}
            onPressIn={() => startRotation(-1)}
            onPressOut={stopRotation}>
            <Text style={styles.rotateButtonText}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rotateButton}
            onPressIn={() => startRotation(1)}
            onPressOut={stopRotation}>
            <Text style={styles.rotateButtonText}>›</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reset button — only visible when a model is shown */}
      {anyDetected && (
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => sceneCallbacks.resetModel()}>
          <Text style={styles.resetText}>↺  Reset</Text>
        </TouchableOpacity>
      )}

      {/* Bottom cards */}
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
  container: { flex: 1, backgroundColor: '#0a0a1a' },

  // --- Permission screens ---
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
  permBack: {
    marginTop: 8,
    backgroundColor: '#4488FF',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  permBackText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

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
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
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

  // --- Gesture hint ---
  gestureHint: {
    position: 'absolute',
    top: 160,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  gestureHintText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },

  // --- Rotation buttons ---
  rotationControls: {
    position: 'absolute',
    bottom: 160,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  rotateButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(68,136,255,0.5)',
  },
  rotateButtonText: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '300',
  },

  // --- Reset button ---
  resetButton: {
    position: 'absolute',
    top: 52,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  resetText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
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
