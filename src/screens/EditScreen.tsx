import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  PixelRatio,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSharedValue } from 'react-native-reanimated';
import {
  ImageFormat,
  useCanvasRef,
  useImage,
} from '@shopify/react-native-skia';
import { File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library/legacy';
import * as Sharing from 'expo-sharing';
import { colors, fonts, radii, spacing } from '../theme';
import { PRESETS, type Preset } from '../constants/presets';
import { FILTERS, type FilterDef } from '../constants/filters';
import PresetChip from '../components/PresetChip';
import FilterThumb from '../components/FilterThumb';
import CropCanvas, { type FitMode } from '../components/CropCanvas';

type Props = {
  photoUri: string;
  onBack: () => void;
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const FRAME_MAX_W = SCREEN_W - spacing.lg * 2;
const FRAME_MAX_H = SCREEN_H * 0.46;

function fitFrame(ratio: number) {
  let w = FRAME_MAX_W;
  let h = w / ratio;
  if (h > FRAME_MAX_H) {
    h = FRAME_MAX_H;
    w = h * ratio;
  }
  return { width: Math.round(w), height: Math.round(h) };
}

export default function EditScreen({ photoUri, onBack }: Props) {
  const image = useImage(photoUri);
  const canvasRef = useCanvasRef();
  const exportCanvasRef = useCanvasRef();

  const [preset, setPreset] = useState<Preset>(PRESETS[0]);
  const [filter, setFilter] = useState<FilterDef>(FILTERS[0]);
  const [fitMode, setFitMode] = useState<FitMode>('fill');
  const [busy, setBusy] = useState(false);
  const [exportJob, setExportJob] = useState<{
    action: 'save' | 'share';
    width: number;
    height: number;
  } | null>(null);

  const frame = useMemo(() => fitFrame(preset.ratio), [preset]);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const exportScale = useSharedValue(1);
  const exportTranslateX = useSharedValue(0);
  const exportTranslateY = useSharedValue(0);

  useEffect(() => {
    scale.value = 1;
    savedScale.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [preset.id, fitMode]);

  useEffect(() => {
    if (!exportJob) return;
    const timer = setTimeout(async () => {
      try {
        const snapshot = exportCanvasRef.current?.makeImageSnapshot();
        if (!snapshot) throw new Error('Could not capture image');
        const bytes = snapshot.encodeToBytes(ImageFormat.PNG, 100);
        const file = new File(Paths.cache, `framely-${Date.now()}.png`);
        try {
          file.write(bytes);
        } catch {
          file.create({ overwrite: true });
          file.write(bytes);
        }

        if (exportJob.action === 'save') {
          const perm = await MediaLibrary.requestPermissionsAsync(true, [
            'photo',
          ]);
          if (!perm.granted) {
            Alert.alert(
              'Permission needed',
              'Allow photo library access to save your image.'
            );
          } else {
            await MediaLibrary.saveToLibraryAsync(file.uri);
            Alert.alert('Saved', `Exported at ${preset.exportWidth}×${preset.exportHeight} for ${preset.platform}.`);
          }
        } else {
          const available = await Sharing.isAvailableAsync();
          if (available) {
            await Sharing.shareAsync(file.uri, { mimeType: 'image/png' });
          }
        }
      } catch (err) {
        Alert.alert('Something went wrong', String(err));
      } finally {
        setExportJob(null);
        setBusy(false);
      }
    }, 140);
    return () => clearTimeout(timer);
  }, [exportJob]);

  const handleExport = (action: 'save' | 'share') => {
    if (!image || busy) return;
    setBusy(true);
    const pr = PixelRatio.get();
    const exportStyleW = preset.exportWidth / pr;
    const exportStyleH = preset.exportHeight / pr;
    const k = exportStyleW / frame.width;
    exportTranslateX.value = translateX.value * k;
    exportTranslateY.value = translateY.value * k;
    exportScale.value = scale.value;
    setExportJob({ action, width: exportStyleW, height: exportStyleH });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={12}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Edit</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.presetRow}
      >
        {PRESETS.map((p) => (
          <PresetChip
            key={p.id}
            preset={p}
            active={p.id === preset.id}
            image={image}
            onPress={() => setPreset(p)}
          />
        ))}
      </ScrollView>

      <View style={styles.fitModeRow}>
        <Pressable
          onPress={() => setFitMode('fill')}
          style={[styles.fitModeBtn, fitMode === 'fill' && styles.fitModeBtnActive]}
        >
          <Text
            style={[
              styles.fitModeText,
              fitMode === 'fill' && styles.fitModeTextActive,
            ]}
          >
            Fill Frame
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setFitMode('fit')}
          style={[styles.fitModeBtn, fitMode === 'fit' && styles.fitModeBtnActive]}
        >
          <Text
            style={[
              styles.fitModeText,
              fitMode === 'fit' && styles.fitModeTextActive,
            ]}
          >
            Keep Full Photo
          </Text>
        </Pressable>
      </View>

      <View style={styles.canvasArea}>
        {image ? (
          <CropCanvas
            canvasRef={canvasRef}
            image={image}
            frameWidth={frame.width}
            frameHeight={frame.height}
            scale={scale}
            savedScale={savedScale}
            translateX={translateX}
            translateY={translateY}
            savedTranslateX={savedTranslateX}
            savedTranslateY={savedTranslateY}
            colorMatrix={filter.matrix}
            fitMode={fitMode}
          />
        ) : (
          <ActivityIndicator color={colors.accent} />
        )}
        <Text style={styles.hint}>
          {fitMode === 'fill'
            ? 'Pinch to zoom, drag to reposition'
            : 'Full photo kept, edges filled with a blur'}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <FilterThumb
            key={f.id}
            filter={f}
            image={image}
            active={f.id === filter.id}
            onPress={() => setFilter(f)}
          />
        ))}
      </ScrollView>

      <View style={styles.exportBar}>
        <Pressable
          style={[styles.exportBtn, styles.exportBtnGhost]}
          onPress={() => handleExport('share')}
          disabled={busy || !image}
        >
          <Text style={styles.exportBtnGhostText}>Share</Text>
        </Pressable>
        <Pressable
          onPress={() => handleExport('save')}
          disabled={busy || !image}
          style={({ pressed }) => [
            styles.exportBtn,
            styles.exportBtnPrimary,
            pressed && styles.exportBtnPrimaryPressed,
            { flex: 1 },
          ]}
        >
          {busy ? (
            <ActivityIndicator color={colors.bg} />
          ) : (
            <Text style={styles.exportBtnText}>Save to Photos</Text>
          )}
        </Pressable>
      </View>

      {exportJob && image && (
        <View style={styles.hiddenExport} pointerEvents="none">
          <CropCanvas
            canvasRef={exportCanvasRef}
            image={image}
            frameWidth={exportJob.width}
            frameHeight={exportJob.height}
            scale={exportScale}
            savedScale={exportScale}
            translateX={exportTranslateX}
            translateY={exportTranslateY}
            savedTranslateX={exportTranslateX}
            savedTranslateY={exportTranslateY}
            colorMatrix={filter.matrix}
            fitMode={fitMode}
            interactive={false}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  backText: {
    color: colors.textDim,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  headerTitle: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 15,
  },
  presetRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  fitModeRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 4,
    marginBottom: spacing.sm,
  },
  fitModeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
  },
  fitModeBtnActive: {
    backgroundColor: colors.accent,
  },
  fitModeText: {
    color: colors.textDim,
    fontFamily: fonts.semiBold,
    fontSize: 12,
  },
  fitModeTextActive: {
    color: colors.bg,
  },
  canvasArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  hint: {
    color: colors.textFaint,
    fontFamily: fonts.regular,
    fontSize: 11,
    marginTop: spacing.sm,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  exportBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
  },
  exportBtn: {
    borderRadius: radii.lg,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportBtnGhost: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  exportBtnGhostText: {
    color: colors.text,
    fontFamily: fonts.semiBold,
    fontSize: 15,
  },
  exportBtnPrimary: {
    backgroundColor: colors.accent,
  },
  exportBtnPrimaryPressed: {
    backgroundColor: colors.accentPressed,
  },
  exportBtnText: {
    color: colors.bg,
    fontFamily: fonts.bold,
    fontSize: 15,
  },
  hiddenExport: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0,
    zIndex: -1,
  },
});
