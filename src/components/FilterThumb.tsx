import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Canvas,
  ColorMatrix,
  Fill,
  Image as SkiaImage,
  type SkImage,
} from '@shopify/react-native-skia';
import { colors, fonts, spacing } from '../theme';
import type { FilterDef } from '../constants/filters';

type Props = {
  filter: FilterDef;
  image: SkImage | null;
  active: boolean;
  onPress: () => void;
};

const SIZE = 56;

export default function FilterThumb({ filter, image, active, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <View style={[styles.ring, active && styles.ringActive]}>
        <View style={styles.swatch}>
          {image ? (
            <Canvas style={{ width: SIZE, height: SIZE }}>
              <Fill color={colors.surfaceAlt} />
              <SkiaImage
                image={image}
                x={0}
                y={0}
                width={SIZE}
                height={SIZE}
                fit="cover"
              >
                <ColorMatrix matrix={filter.matrix} />
              </SkiaImage>
            </Canvas>
          ) : (
            <View style={[styles.swatch, { backgroundColor: colors.surfaceAlt }]} />
          )}
        </View>
      </View>
      <Text style={[styles.label, active && { color: colors.text }]} numberOfLines={1}>
        {filter.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    width: 68,
    marginRight: spacing.sm,
  },
  ring: {
    width: SIZE + 6,
    height: SIZE + 6,
    borderRadius: (SIZE + 6) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ringActive: {
    borderColor: colors.accent,
  },
  swatch: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    overflow: 'hidden',
  },
  label: {
    marginTop: spacing.xs,
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textDim,
  },
});
