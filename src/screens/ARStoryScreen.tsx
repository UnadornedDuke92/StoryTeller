import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
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
  ViroSound,
} from '@reactvision/react-viro';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useSettings } from '../context/SettingsContext';
import {
  MARKER_STEPS,
  TEARDROP_FILE,
  TEARDROP_SCALE,
  TEARDROP_POSITION,
} from '../data/stories';

type Nav   = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ARStory'>;

function progressKey(storyId: string) { return `progress_${storyId}`; }
async function saveProgress(storyId: string, step: number) {
  await AsyncStorage.setItem(progressKey(storyId), String(step));
}
async function clearProgress(storyId: string) {
  await AsyncStorage.removeItem(progressKey(storyId));
}

// ---------------------------------------------------------------------------
// Register all 7 markers once at module load
// ---------------------------------------------------------------------------
const targetDefs: Record<string, { source: any; orientation: string; physicalWidth: number }> = {};
MARKER_STEPS.forEach(step => {
  targetDefs[step.targetName] = {
    source: step.markerImage,
    orientation: 'Up',
    physicalWidth: step.physicalWidth,
  };
});
ViroARTrackingTargets.createTargets(targetDefs);

// ---------------------------------------------------------------------------
// Animations & materials
// ---------------------------------------------------------------------------
ViroAnimations.registerAnimations({
  rise:        { properties: { positionY: 0.1 },          duration: 600,  easing: 'EaseOut' },
  tearFloat:   { properties: { rotateY: '+=360' },         duration: 6000 },
  tearCollect: { properties: { scaleX: 1.5, scaleY: 1.5, scaleZ: 1.5, opacity: 0 }, duration: 500, easing: 'EaseOut' },
});

ViroMaterials.createMaterials({
  plane_grid: { diffuseColor: 'rgba(68,136,255,0.12)', lightingModel: 'Constant' },
});

function assetUri(path: string) {
  return { uri: `file:///android_asset/${path.replace(/ /g, '%20')}` };
}

// ---------------------------------------------------------------------------
// Module-level shared state (screen writes, scene reads on re-render)
// ---------------------------------------------------------------------------
const arStoryState = { currentStep: 0, planeViz: false, transitioning: false };

type ModelState = { rotY: number; scaleFactor: number };

const storyCallbacks = {
  onMarkerFound:      () => {},
  onMarkerLost:       () => {},
  onAudioEnd:         () => {},
  onTeardropCollected:() => {},
  resetModel:         () => {},
  rotateModel:        (_delta: number) => {},
  advanceScene:       () => {},
};

// ---------------------------------------------------------------------------
// AR Scene
// ---------------------------------------------------------------------------
function ARStoryScene() {
  const [, setSceneTick] = useState(0);
  const [modelStates,  setModelStates]  = useState<Record<string, ModelState>>({});
  const [audioStarted, setAudioStarted] = useState(false);
  const [tearState,         setTearState]         = useState<'idle' | 'collecting' | 'collected'>('idle');
  const pinchStartScale = useRef<Record<string, number>>({});
  const collectTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = MARKER_STEPS[arStoryState.currentStep] ?? MARKER_STEPS[0];

  // Register callbacks so the screen can drive the scene
  storyCallbacks.resetModel = () => setModelStates({});
  storyCallbacks.rotateModel = (delta: number) => {
    const key = step.targetName;
    setModelStates(prev => {
      const curr = prev[key] ?? { rotY: 0, scaleFactor: 1 };
      return { ...prev, [key]: { ...curr, rotY: curr.rotY + delta } };
    });
  };
  storyCallbacks.advanceScene = () => {
    if (collectTimer.current) { clearTimeout(collectTimer.current); collectTimer.current = null; }

    // Phase 1: clear the old marker immediately so ARCore releases the anchor cleanly
    arStoryState.transitioning = true;
    setAudioStarted(false);
    setTearState('idle');
    setModelStates({});
    setSceneTick(t => t + 1);

    // Phase 2: after the native anchor is released, mount the new marker
    setTimeout(() => {
      arStoryState.transitioning = false;
      setSceneTick(t => t + 1);
    }, 400);
  };

  const getState = (key: string): ModelState =>
    modelStates[key] ?? { rotY: 0, scaleFactor: 1 };

  const handlePinch = (key: string, pinchState: number, scaleFactor: number) => {
    if (pinchState === 1) { pinchStartScale.current[key] = getState(key).scaleFactor; return; }
    const base    = pinchStartScale.current[key] ?? 1;
    const clamped = Math.max(0.2, Math.min(8, base * scaleFactor));
    setModelStates(prev => {
      const curr = prev[key] ?? { rotY: 0, scaleFactor: 1 };
      return { ...prev, [key]: { ...curr, scaleFactor: clamped } };
    });
  };

  const handleTeardropTap = () => {
    if (tearState !== 'idle') return;
    setTearState('collecting');
    collectTimer.current = setTimeout(() => {
      setTearState('collected');
      storyCallbacks.onTeardropCollected();
    }, 450);
  };

  const modelState = getState(step.targetName);

  return (
    <ViroARScene>
      <ViroAmbientLight    color="#ffffff" intensity={400} />
      <ViroDirectionalLight color="#ffffff" direction={[0, -1, -0.2]} castsShadow intensity={1000} />

      {arStoryState.planeViz && (
        <ViroARPlane minHeight={0.1} minWidth={0.1} alignment="Horizontal">
          <ViroBox scale={[1, 0.002, 1]} materials={['plane_grid']} />
        </ViroARPlane>
      )}

      {/* Ambient narration — starts on first marker find, stays mounted even if tracking drops */}
      {!arStoryState.transitioning && audioStarted && (
        <ViroSound
          key={step.index}
          source={assetUri(step.audioFile)}
          paused={false}
          loop={false}
          volume={1}
          onFinish={() => storyCallbacks.onAudioEnd()}
        />
      )}

      {/* Marker hidden during 400ms transition so ARCore releases the old anchor cleanly */}
      {!arStoryState.transitioning && (
      <ViroARImageMarker
        key={step.targetName}
        target={step.targetName}
        onAnchorFound={()  => { if (!audioStarted) { setAudioStarted(true); } storyCallbacks.onMarkerFound(); }}
        onAnchorRemoved={() => { storyCallbacks.onMarkerLost(); }}>

        {/* Story models for this step */}
        {step.models.length > 0 && (
          <ViroNode position={[0, 0, 0]} animation={{ name: 'rise', run: true, loop: false }}>
            <ViroNode
              rotation={[0, modelState.rotY, 0]}
              scale={[modelState.scaleFactor, modelState.scaleFactor, modelState.scaleFactor]}>
              {step.models.map((model, i) => (
                <Viro3DObject
                  key={i}
                  source={assetUri(`models/${model.file}`)}
                  resources={[]}
                  position={model.position ?? [0, 0, 0]}
                  rotation={model.rotation ?? [0, 0, 0]}
                  scale={model.scale}
                  type="GLB"
                  highAccuracyEvents
                  onPinch={i === 0
                    ? (pinchState, scaleFactor) => handlePinch(step.targetName, pinchState, scaleFactor)
                    : undefined
                  }
                />
              ))}
            </ViroNode>
          </ViroNode>
        )}

        {/* Teardrop collectible — present on all 7 markers */}
        {tearState !== 'collected' && (
          <ViroNode
            position={TEARDROP_POSITION}
            opacity={1}
            animation={{
              name: tearState === 'collecting' ? 'tearCollect' : 'tearFloat',
              run: true,
              loop: tearState === 'idle',
            }}>
            <Viro3DObject
              source={assetUri(`models/${TEARDROP_FILE}`)}
              resources={[]}
              position={[0, 0, 0]}
              scale={TEARDROP_SCALE}
              type="GLB"
              onClick={handleTeardropTap}
            />
          </ViroNode>
        )}
      </ViroARImageMarker>
      )}
    </ViroARScene>
  );
}

// ---------------------------------------------------------------------------
// Pulsing scanner frame
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
// Rotation constants
// ---------------------------------------------------------------------------
const ROTATE_STEP       = 30;
const ROTATE_HOLD_DELAY = 350;
const ROTATE_INTERVAL   = 16;
const ROTATE_HOLD_STEP  = 3;

type PermState = 'checking' | 'granted' | 'denied';

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function ARStoryScreen() {
  const navigation            = useNavigation<Nav>();
  const route                 = useRoute<Route>();
  const { storyId, initialStep = 0 } = route.params;
  const { settings } = useSettings();

  const [perm,          setPerm]          = useState<PermState>('checking');
  const [currentStep,   setCurrentStep]   = useState(initialStep);
  const [markerFound,   setMarkerFound]   = useState(false);
  const [audioFinished, setAudioFinished] = useState(false);
  const [teardropDone,  setTeardropDone]  = useState(false);

  const hintOpacity  = useRef(new Animated.Value(0)).current;
  const holdTimeout  = useRef<ReturnType<typeof setTimeout>  | null>(null);
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep module-level state in sync
  arStoryState.currentStep = currentStep;
  arStoryState.planeViz    = settings.planeViz;

  // Wire screen-level callbacks
  storyCallbacks.onMarkerFound       = () => setMarkerFound(true);
  storyCallbacks.onMarkerLost        = () => setMarkerFound(false);
  storyCallbacks.onAudioEnd          = () => setAudioFinished(true);
  storyCallbacks.onTeardropCollected = () => setTeardropDone(true);

  // Camera permission
  useEffect(() => {
    if (Platform.OS !== 'android') { setPerm('granted'); return; }
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA).then(result => {
      setPerm(result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied');
    });
  }, []);

  // Gesture hint when marker first found
  useEffect(() => {
    if (markerFound) {
      Animated.sequence([
        Animated.timing(hintOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.delay(2500),
        Animated.timing(hintOpacity, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerFound]);

  // Rotation button helpers
  const startRotation = (direction: 1 | -1) => {
    storyCallbacks.rotateModel(direction * ROTATE_STEP);
    holdTimeout.current = setTimeout(() => {
      holdInterval.current = setInterval(() => {
        storyCallbacks.rotateModel(direction * ROTATE_HOLD_STEP);
      }, ROTATE_INTERVAL);
    }, ROTATE_HOLD_DELAY);
  };
  const stopRotation = () => {
    if (holdTimeout.current)  { clearTimeout(holdTimeout.current);   holdTimeout.current  = null; }
    if (holdInterval.current) { clearInterval(holdInterval.current); holdInterval.current = null; }
  };

  const advance = () => {
    const next = currentStep + 1;
    arStoryState.currentStep = next;
    setCurrentStep(next);
    setMarkerFound(false);
    setAudioFinished(false);
    setTeardropDone(false);
    storyCallbacks.advanceScene();
    saveProgress(storyId, next);
  };

  const finish = (choice: string) => {
    console.log('Story ended with choice:', choice);
    clearProgress(storyId);
    navigation.navigate('MainTabs');
  };

  const exitAndSave = () => {
    saveProgress(storyId, currentStep);
    navigation.goBack();
  };

  const step = MARKER_STEPS[currentStep];

  // ----------- Permission screens -----------
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
        <Text style={styles.permTitle}>Se requiere acceso a la cámara</Text>
        <Text style={styles.permText}>Permite el permiso de cámara para usar AR.</Text>
        <TouchableOpacity style={styles.permBack} onPress={() => navigation.goBack()}>
          <Text style={styles.permBackText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isLastStep    = currentStep === MARKER_STEPS.length - 1;
  const readyToAdvance = markerFound && audioFinished && teardropDone;
  const showNext      = readyToAdvance && !isLastStep;
  const showChoices   = readyToAdvance && isLastStep && !!step.endChoices;

  // ----------- AR experience -----------
  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        autofocus
        pbrEnabled
        hdrEnabled={settings.highQuality}
        bloomEnabled={settings.highQuality}
        shadowsEnabled={settings.highQuality}
        initialScene={{ scene: ARStoryScene }}
        style={StyleSheet.absoluteFill}
      />

      {/* Step counter */}
      <View style={styles.stepBar}>
        <Text style={styles.stepText}>Marcador {currentStep + 1} / {MARKER_STEPS.length}</Text>
      </View>

      {/* Scanner frame */}
      {!markerFound && <ScannerFrame />}

      {/* Found banner */}
      {markerFound && (
        <View style={styles.foundBanner}>
          <Text style={styles.foundText}>Marcador detectado</Text>
        </View>
      )}

      {/* Gesture hint */}
      <Animated.View style={[styles.gestureHint, { opacity: hintOpacity }]} pointerEvents="none">
        <Text style={styles.gestureHintText}>Pellizca para escalar  ·  Toca la lágrima para recogerla</Text>
      </Animated.View>

      {/* Model controls */}
      {markerFound && (
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

      {/* Reset */}
      {markerFound && (
        <TouchableOpacity style={styles.resetButton} onPress={() => storyCallbacks.resetModel()}>
          <Text style={styles.resetText}>↺  Reset</Text>
        </TouchableOpacity>
      )}

      {/* Bottom marker card */}
      <View style={styles.cardRow}>
        <View style={styles.card}>
          <Image source={step.markerImage} style={styles.markerThumb} resizeMode="contain" />
          <View style={styles.cardText}>
            <Text style={styles.cardLabel}>Marcador {currentStep + 1}</Text>
            <Text style={styles.cardSub}>
              {!markerFound
                ? 'Escanea este marcador'
                : !teardropDone
                  ? 'Recoge la lágrima para continuar'
                  : !audioFinished
                    ? 'Reproduciendo narración…'
                    : 'Listo — avanza al siguiente'}
            </Text>
          </View>
          {teardropDone && (
            <View style={styles.teardropBadge}>
              <Text style={styles.teardropBadgeText}>💧 Recogida</Text>
            </View>
          )}
        </View>
      </View>

      {/* Next button */}
      {showNext && (
        <TouchableOpacity style={styles.nextButton} onPress={advance}>
          <Text style={styles.nextButtonText}>Siguiente  →</Text>
        </TouchableOpacity>
      )}

      {/* Final choices */}
      {showChoices && step.endChoices && (
        <View style={styles.choiceRow}>
          <TouchableOpacity
            style={[styles.choiceButton, styles.choiceKeep]}
            onPress={() => finish(step.endChoices![0])}>
            <Text style={styles.choiceText}>{step.endChoices[0]}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.choiceButton, styles.choiceLet]}
            onPress={() => finish(step.endChoices![1])}>
            <Text style={styles.choiceText}>{step.endChoices[1]}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Close — saves progress so the user can continue later */}
      <TouchableOpacity style={styles.close} onPress={exitAndSave}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const CORNER_SIZE      = 28;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#0a0a1a' },
  centered:   { alignItems: 'center', justifyContent: 'center', gap: 12 },

  // Permission
  permTitle:    { fontSize: 20, fontWeight: '700', color: '#FFFFFF', textAlign: 'center', paddingHorizontal: 32 },
  permText:     { fontSize: 14, color: '#8899BB', textAlign: 'center', paddingHorizontal: 32, marginTop: 4 },
  permBack:     { marginTop: 8, backgroundColor: '#4488FF', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 24 },
  permBackText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },

  // Step bar
  stepBar: {
    position: 'absolute',
    top: 52,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stepText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

  // Scanner frame
  scannerFrame: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    width: 200,
    height: 200,
    marginLeft: -100,
    marginTop: -100,
  },
  corner:   { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE, borderColor: '#4488FF' },
  cornerTL: { top: 0,    left: 0,  borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
  cornerTR: { top: 0,    right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS },
  cornerBL: { bottom: 0, left: 0,  borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS },

  // Found banner
  foundBanner: {
    position: 'absolute',
    top: 110,
    alignSelf: 'center',
    backgroundColor: 'rgba(34,197,94,0.85)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  foundText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  // Gesture hint
  gestureHint: {
    position: 'absolute',
    top: 160,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  gestureHintText: { color: '#FFFFFF', fontSize: 12, fontWeight: '500' },

  // Rotation controls
  rotationControls: {
    position: 'absolute',
    bottom: 175,
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
  rotateButtonText: { color: '#FFFFFF', fontSize: 32, lineHeight: 36, fontWeight: '300' },

  // Reset
  resetButton: {
    position: 'absolute',
    top: 52,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  resetText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

  // Bottom card
  cardRow: { position: 'absolute', bottom: 32, left: 16, right: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10,10,26,0.88)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(68,136,255,0.3)',
  },
  markerThumb: { width: 56, height: 56, borderRadius: 8, backgroundColor: '#FFFFFF', marginRight: 12 },
  cardText:    { flex: 1 },
  cardLabel:   { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  cardSub:     { fontSize: 12, color: '#8899BB', marginTop: 2 },

  teardropBadge: {
    backgroundColor: 'rgba(68,136,255,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  teardropBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

  // Next button
  nextButton: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: '#4488FF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
  },
  nextButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  // Final choices
  choiceRow: {
    position: 'absolute',
    bottom: 120,
    left: 24,
    right: 24,
    flexDirection: 'row',
    gap: 12,
  },
  choiceButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  choiceKeep: { backgroundColor: '#4488FF' },
  choiceLet:  { backgroundColor: '#CC44FF' },
  choiceText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  // Close
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
