export type ModelConfig = {
  file: string;
  scale: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  animationName?: string;
};

export type MarkerStep = {
  index: number;
  targetName: string;
  markerImage: any;
  physicalWidth: number;
  models: ModelConfig[];
  audioFile: string;
  endChoices?: [string, string];
};

export type Story = {
  id: string;
  title: string;
  description: string;
  color: string;
  complete: boolean;
};

export const TEARDROP_FILE = 'Tear.glb';
export const TEARDROP_SCALE: [number, number, number] = [0.0009, 0.0009, 0.0009];
export const TEARDROP_POSITION: [number, number, number] = [-0.005, 0.1, 0.025];

export const MARKER_STEPS: MarkerStep[] = [
  {
    // Marker 1: camping scene + teardrop
    index: 0,
    targetName: 'fo_marker_1',
    markerImage: require('../../assets/markers/FO-Marker1.png'),
    physicalWidth: 0.15,
    models: [
      { file: 'Camp_backup.glb', scale: [0.003, 0.003, 0.003], position: [0, 0, 0], rotation: [0, -60, 0] },
    ],
    audioFile: 'audio/Audio_Narrador1.wav',
  },
  {
    // Marker 2: Niko (guide) + teardrop
    index: 1,
    targetName: 'fo_marker_2',
    markerImage: require('../../assets/markers/FO-Marker2.png'),
    physicalWidth: 0.15,
    models: [
      { file: 'Niko.glb', scale: [0.03, 0.03, 0.03], position: [0, 0, 0] },
    ],
    audioFile: 'audio/Audio_Narrador2.wav',
  },
  {
    // Marker 3: Tricky_tree + Niko (guide) + teardrop
    index: 2,
    targetName: 'fo_marker_3',
    markerImage: require('../../assets/markers/FO-Marker3.png'),
    physicalWidth: 0.15,
    models: [
      { file: 'Tricky_tree.glb', scale: [0.03, 0.03, 0.03], position: [0, 0, 0] },
      { file: 'Niko.glb', scale: [0.005, 0.005, 0.005], position: [0, -0.012, 0.005] },
    ],
    audioFile: 'audio/Audio_Narrador3.wav',
  },
  {
    // Marker 4: Golem + Niko (guide) + teardrop
    index: 3,
    targetName: 'fo_marker_4',
    markerImage: require('../../assets/markers/FO-Marker4.png'),
    physicalWidth: 0.15,
    models: [
      { file: 'Golem.glb', scale: [0.03, 0.03, 0.03], position: [0, 0, 0] },
      { file: 'Niko.glb', scale: [0.007, 0.007, 0.007], position: [0.015, 0, 0.025], rotation: [0, 200, 0] },
    ],
    audioFile: 'audio/Audio_Narrador4.wav',
  },
  {
    // Marker 5: Female + Male facing opposite sides + Niko (guide) + teardrop
    index: 4,
    targetName: 'fo_marker_5',
    markerImage: require('../../assets/markers/FO-Marker5.png'),
    physicalWidth: 0.15,
    models: [
      { file: 'Female.glb', scale: [0.015, 0.015, 0.015], position: [-0.015, 0, 0.025], rotation: [0, -90, 0] },
      { file: 'Male.glb', scale: [0.015, 0.015, 0.015], position: [0.01, 0, 0.025], rotation: [0, 90, 0] },
      { file: 'Niko.glb', scale: [0.007, 0.007, 0.007], position: [-0.005, 0, 0.035], rotation:[0, 180, 0] },
    ],
    audioFile: 'audio/Audio_Narrador5.wav',
  },
  {
    // Marker 6: Camp scenario + Melancolia + Niko (guide) + teardrop
    index: 5,
    targetName: 'fo_marker_6',
    markerImage: require('../../assets/markers/FO-Marker6.png'),
    physicalWidth: 0.15,
    models: [
      { file: 'Camp_backup.glb', scale: [0.004, 0.004, 0.004], position: [0, -0.01, 0], rotation: [0, -60, 0] },
      { file: 'Melancolia.glb', scale: [0.015, 0.015, 0.015], position: [-0.015, 0.01, 0] },
      { file: 'Niko.glb', scale: [0.007, 0.007, 0.007], position: [0.015, 0, 0.025], rotation: [0, 200, 0] },
    ],
    audioFile: 'audio/Audio_Narrador6.wav',
  },
  {
    // Marker 7: Paths + Niko (guide) + teardrop — final choice step
    index: 6,
    targetName: 'fo_marker_7',
    markerImage: require('../../assets/markers/FO-Marker7.png'),
    physicalWidth: 0.15,
    models: [
      { file: 'Paths.glb', scale: [0.075, 0.075, 0.075], position: [0, 0, 0] },
      { file: 'Niko.glb', scale: [0.03, 0.03, 0.03], position: [0.01, 0, 0] },
    ],
    audioFile: 'audio/Audio_Narrador7.wav',
    endChoices: ['Guardarlas', 'Dejarlas ir'],
  },
];

export const STORIES: Story[] = [
  {
    id: 'las-lagrimas',
    title: 'Las Lágrimas',
    description: 'Un viaje de siete momentos que te llevará a través de la memoria, la pérdida y el reencuentro.',
    color: '#1a3a6b',
    complete: true,
  },
  {
    id: 'el-bosque',
    title: 'El Bosque Antiguo',
    description: 'Descubre los secretos de un bosque que guarda memorias de siglos.',
    color: '#2d6a4f',
    complete: false,
  },
  {
    id: 'el-oceano',
    title: 'El Océano de Estrellas',
    description: 'Explora el cosmos que se extiende sobre tu cabeza.',
    color: '#0d2b45',
    complete: false,
  },
];
