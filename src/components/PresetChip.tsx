import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Canvas,
  FilterMode,
  Image as SkiaImage,
  MipmapMode,
  type SkImage,
} from '@shopify/react-native-skia';
import { colors, fonts, radii, spacing } from '../theme';
import type { Preset } from '../constants/presets';

const HQ_SAMPLING = { filter: FilterMode.Linear, mipmap: MipmapMode.Linear };

type Props = {
  preset: Preset;
  active: boolean;
  image: SkImage | null;
  onPress: () => void;
};

const FRAME_HEIGHT = 54;
const FRAME_MIN_WIDTH = 38;
const FRAME_MAX_WIDTH = 118;
const CARD_MIN_WIDTH = 62;

function frameSize(ratio: number) {
  const raw = FRAME_HEIGHT * ratio;
  const width = Math.round(
    Math.min(FRAME_MAX_WIDTH, Math.max(FRAME_MIN_WIDTH, raw))
  );
  return { width, height: FRAME_HEIGHT };
}

export default function PresetChip({ preset, active, image, onPress }: Props) {
  const { width, height } = frameSize(preset.ratio);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.wrap, { minWidth: Math.max(width, CARD_MIN_WIDTH) }]}
    >
      <View
        style={[
          styles.frame,
          { width, height },
          active && styles.frameActive,
        ]}
      >
        {image && (
          <Canvas style={{ width, height }}>
            <SkiaImage
              image={image}
              x={0}
              y={0}
              width={width}
              height={height}
              fit="cover"
              sampling={HQ_SAMPLING}
            />
          </Canvas>
        )}
        {active && <View style={styles.activeDot} />}
      </View>
      <Text
        style={[styles.platform, active && styles.platformActive]}
        numberOfLines={1}
      >
        {preset.platform.toUpperCase()}
      </Text>
      <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
        {preset.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  frame: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  frameActive: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  activeDot: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  platform: {
    fontFamily: fonts.semiBold,
    fontSize: 9,
    letterSpacing: 0.8,
    color: colors.textFaint,
    marginBottom: 2,
  },
  platformActive: {
    color: colors.accent,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.textDim,
  },
  labelActive: {
    color: colors.text,
  },
});
