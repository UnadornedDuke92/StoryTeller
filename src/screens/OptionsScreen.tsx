import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

type RowSwitchProps = { label: string; sub?: string; value: boolean; onToggle: (v: boolean) => void };

function RowSwitch({ label, sub, value, onToggle }: RowSwitchProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#333355', true: '#4488FF' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

export default function OptionsScreen() {
  const [haptics, setHaptics] = useState(true);
  const [sound, setSound] = useState(true);
  const [planeViz, setPlaneViz] = useState(false);
  const [highQuality, setHighQuality] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Options</Text>

      <Text style={styles.section}>AR Settings</Text>
      <View style={styles.card}>
        <RowSwitch
          label="Show Plane Guides"
          sub="Visualize detected surfaces"
          value={planeViz}
          onToggle={setPlaneViz}
        />
        <View style={styles.divider} />
        <RowSwitch
          label="High Quality Rendering"
          sub="Better visuals, more battery usage"
          value={highQuality}
          onToggle={setHighQuality}
        />
      </View>

      <Text style={styles.section}>Experience</Text>
      <View style={styles.card}>
        <RowSwitch label="Haptic Feedback" value={haptics} onToggle={setHaptics} />
        <View style={styles.divider} />
        <RowSwitch label="Sound Effects" value={sound} onToggle={setSound} />
      </View>

      <Text style={styles.section}>About</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Version</Text>
          <Text style={styles.rowValue}>0.0.1</Text>
        </View>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowLabel}>Privacy Policy</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.row}>
          <Text style={styles.rowLabel}>Open Source Licences</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  section: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8899BB',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 24,
  },
  card: {
    backgroundColor: '#111133',
    borderRadius: 14,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
  },
  rowSub: {
    fontSize: 12,
    color: '#8899BB',
    marginTop: 2,
  },
  rowValue: {
    fontSize: 15,
    color: '#8899BB',
  },
  chevron: {
    fontSize: 20,
    color: '#8899BB',
  },
  divider: {
    height: 1,
    backgroundColor: '#1e1e44',
    marginLeft: 16,
  },
});
