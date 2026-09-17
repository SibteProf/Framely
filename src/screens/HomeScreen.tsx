import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { colors, fonts, radii, spacing } from '../theme';

type Props = {
  onPickPhoto: (uri: string) => void;
};

export default function HomeScreen({ onPickPhoto }: Props) {
  const handlePick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      onPickPhoto(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.hero}>
        <Image
          source={require('../../assets/app-mark.png')}
          style={styles.appIcon}
        />
        <Text style={styles.title}>Framely</Text>
        <Text style={styles.subtitle}>
          Crop and frame your photos to the exact size every platform wants,
          so nothing gets cut off, ever again.
        </Text>
      </View>

      <View style={styles.previewRow}>
        <MiniFrame ratio={1} label="Feed" />
        <MiniFrame ratio={4 / 5} label="Portrait" />
        <MiniFrame ratio={9 / 16} label="Story" />
        <MiniFrame ratio={16 / 9} label="Cover" />
      </View>

      <Pressable
        onPress={handlePick}
        style={({ pressed }) => [
          styles.cta,
          pressed && styles.ctaPressed,
        ]}
      >
        <Text style={styles.ctaText}>Choose a Photo</Text>
      </Pressable>
    </View>
  );
}

function MiniFrame({ ratio, label }: { ratio: number; label: string }) {
  const base = 30;
  const w = ratio >= 1 ? base : base * ratio;
  const h = ratio >= 1 ? base / ratio : base;
  return (
    <View style={styles.miniFrameWrap}>
      <View style={[styles.miniFrame, { width: w, height: h }]} />
      <Text style={styles.miniFrameLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl * 1.5,
    paddingBottom: spacing.xl,
  },
  hero: {
    alignItems: 'flex-start',
  },
  appIcon: {
    width: 60,
    height: 60,
    borderRadius: radii.md,
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 52,
    marginBottom: spacing.md,
  },
  subtitle: {
    color: colors.textDim,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 320,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  miniFrameWrap: {
    alignItems: 'center',
  },
  miniFrame: {
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: 4,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  miniFrameLabel: {
    color: colors.textFaint,
    fontFamily: fonts.medium,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: radii.lg,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaPressed: {
    backgroundColor: colors.accentPressed,
  },
  ctaText: {
    color: colors.bg,
    fontFamily: fonts.bold,
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
