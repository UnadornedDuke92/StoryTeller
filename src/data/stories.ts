export type ModelConfig = {
  file: string;
  scale: [number, number, number];
  position?: [number, number, number];
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

export const TEARDROP_FILE = 'frozen_tear.glb';
export const TEARDROP_SCALE: [number, number, number] = [0.002, 0.002, 0.002];
export const TEARDROP_POSITION: [number, number, number] = [0.1, 0.06, 0];

export const MARKER_STEPS: MarkerStep[] = [
  {
    // Marker 1: camping scene + teardrop (teardrop is smaller but visible)
    index: 0,
    targetName: 'fo_marker_1',
    markerImage: require('../../assets/markers/FO-Marker1.png'),
    physicalWidth: 0.15,
    models: [
      { file: 'camping_buscraft_ambience.glb', scale: [0.003, 0.003, 0.003], position: [0, 0, 0] },
    ],
    audioFile: 'audio/Audio_Narrador1.wav',
  },
  {
    // Marker 2: Project 2 + teardrop
    index: 1,
    targetName: 'fo_marker_2',
    markerImage: require('../../assets/markers/FO-Marker2.png'),
    physicalWidth: 0.15,
    models: [
      { file: 'Project 2.glb', scale: [0.005, 0.005, 0.005], position: [0, 0, 0] },
    ],
    audioFile: 'audio/Audio_Narrador2.wav',
  },
  {
    // Marker 3: teardrop only — both scene models TBD
    index: 2,
    targetName: 'fo_marker_3',
    markerImage: require('../../assets/markers/FO-Marker3.png'),
    physicalWidth: 0.15,
    models: [],
    audioFile: 'audio/Audio_Narrador3.wav',
  },
  {
    // Marker 4: golem (left) + Project 2 (right) + teardrop
    index: 3,
    targetName: 'fo_marker_4',
    markerImage: require('../../assets/markers/FO-Marker4.png'),
    physicalWidth: 0.15,
    models: [
      { file: 'ricky_the_golem.glb',  scale: [0.005, 0.005, 0.005], position: [-0.1, 0, 0] },
      { file: 'Project 2.glb',        scale: [0.005, 0.005, 0.005], position: [0.1, 0, 0] },
    ],
    audioFile: 'audio/Audio_Narrador4.wav',
  },
  {
    // Marker 5: Project 2 + teardrop — second model TBD
    index: 4,
    targetName: 'fo_marker_5',
    markerImage: require('../../assets/markers/FO-Marker5.png'),
    physicalWidth: 0.15,
    models: [
      { file: 'Project 2.glb', scale: [0.005, 0.005, 0.005], position: [0, 0, 0] },
    ],
    audioFile: 'audio/Audio_Narrador5.wav',
  },
  {
    // Marker 6: Project 2 + teardrop — second model TBD
    index: 5,
    targetName: 'fo_marker_6',
    markerImage: require('../../assets/markers/FO-Marker6.png'),
    physicalWidth: 0.15,
    models: [
      { file: 'Project 2.glb', scale: [0.005, 0.005, 0.005], position: [0, 0, 0] },
    ],
    audioFile: 'audio/Audio_Narrador6.wav',
  },
  {
    // Marker 7: Project 2 + teardrop — second model TBD; final choice step
    index: 6,
    targetName: 'fo_marker_7',
    markerImage: require('../../assets/markers/FO-Marker7.png'),
    physicalWidth: 0.15,
    models: [
      { file: 'Project 2.glb', scale: [0.005, 0.005, 0.005], position: [0, 0, 0] },
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
