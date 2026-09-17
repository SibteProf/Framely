import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';
import {
  Blur,
  Canvas,
  ColorMatrix,
  Fill,
  FilterMode,
  Group,
  Image as SkiaImage,
  Line,
  MipmapMode,
  Rect,
  rect,
  rrect,
  vec,
  type SkImage,
} from '@shopify/react-native-skia';
import { colors, radii } from '../theme';

export type FitMode = 'fill' | 'fit';

const HQ_SAMPLING = { filter: FilterMode.Linear, mipmap: MipmapMode.Linear };

type Props = {
  canvasRef: React.RefObject<any>;
  image: SkImage;
  frameWidth: number;
  frameHeight: number;
  scale: SharedValue<number>;
  savedScale: SharedValue<number>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  savedTranslateX: SharedValue<number>;
  savedTranslateY: SharedValue<number>;
  colorMatrix: number[];
  fitMode?: FitMode;
  interactive?: boolean;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;

export default function CropCanvas({
  canvasRef,
  image,
  frameWidth,
  frameHeight,
  scale,
  savedScale,
  translateX,
  translateY,
  savedTranslateX,
  savedTranslateY,
  colorMatrix,
  fitMode = 'fill',
  interactive = true,
}: Props) {
  const imgW = image.width();
  const imgH = image.height();
  const baseScale = Math.max(frameWidth / imgW, frameHeight / imgH);
  const containScale = Math.min(frameWidth / imgW, frameHeight / imgH);
  const centeredTransform = [
    { translateX: frameWidth / 2 },
    { translateY: frameHeight / 2 },
  ];
  const clipShape = useMemo(
    () =>
      rrect(
        rect(0, 0, frameWidth, frameHeight),
        interactive ? radii.md : 0,
        interactive ? radii.md : 0
      ),
    [frameWidth, frameHeight, interactive]
  );

  const transform = useDerivedValue(() => {
    return [
      { translateX: frameWidth / 2 },
      { translateY: frameHeight / 2 },
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: baseScale * scale.value },
    ];
  }, [frameWidth, frameHeight, baseScale]);

  const composedGesture = useMemo(() => {
    const clamp = (v: number, min: number, max: number) => {
      'worklet';
      return Math.min(Math.max(v, min), max);
    };

    const bounds = (userScale: number) => {
      'worklet';
      const dw = imgW * baseScale * userScale;
      const dh = imgH * baseScale * userScale;
      return {
        maxX: Math.max(0, (dw - frameWidth) / 2),
        maxY: Math.max(0, (dh - frameHeight) / 2),
      };
    };

    const pan = Gesture.Pan()
      .onUpdate((e) => {
        const { maxX, maxY } = bounds(scale.value);
        translateX.value = clamp(
          savedTranslateX.value + e.translationX,
          -maxX,
          maxX
        );
        translateY.value = clamp(
          savedTranslateY.value + e.translationY,
          -maxY,
          maxY
        );
      })
      .onEnd(() => {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      });

    const pinch = Gesture.Pinch()
      .onUpdate((e) => {
        scale.value = clamp(savedScale.value * e.scale, MIN_SCALE, MAX_SCALE);
        const { maxX, maxY } = bounds(scale.value);
        translateX.value = clamp(translateX.value, -maxX, maxX);
        translateY.value = clamp(translateY.value, -maxY, maxY);
      })
      .onEnd(() => {
        savedScale.value = scale.value;
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      });

    return Gesture.Simultaneous(pan, pinch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgW, imgH, baseScale, frameWidth, frameHeight]);

  const canvas = (
    <Canvas
      ref={canvasRef}
      style={{ width: frameWidth, height: frameHeight }}
    >
      <Fill color={colors.surfaceAlt} />
      <Group clip={clipShape}>
        {fitMode === 'fill' ? (
          <Group transform={transform}>
            <SkiaImage
              image={image}
              x={-imgW / 2}
              y={-imgH / 2}
              width={imgW}
              height={imgH}
              fit="fill"
              sampling={HQ_SAMPLING}
            >
              <ColorMatrix matrix={colorMatrix} />
            </SkiaImage>
          </Group>
        ) : (
          <>
            <Group
              transform={[...centeredTransform, { scale: baseScale }]}
            >
              <SkiaImage
                image={image}
                x={-imgW / 2}
                y={-imgH / 2}
                width={imgW}
                height={imgH}
                fit="fill"
                sampling={HQ_SAMPLING}
              >
                <Blur blur={26} />
              </SkiaImage>
            </Group>
            <Rect
              x={0}
              y={0}
              width={frameWidth}
              height={frameHeight}
              color="rgba(14,14,18,0.4)"
            />
            <Group
              transform={[...centeredTransform, { scale: containScale }]}
            >
              <SkiaImage
                image={image}
                x={-imgW / 2}
                y={-imgH / 2}
                width={imgW}
                height={imgH}
                fit="fill"
                sampling={HQ_SAMPLING}
              >
                <ColorMatrix matrix={colorMatrix} />
              </SkiaImage>
            </Group>
          </>
        )}
      </Group>
      {interactive && <ViewfinderBrackets width={frameWidth} height={frameHeight} />}
    </Canvas>
  );

  if (!interactive || fitMode !== 'fill') {
    return canvas;
  }

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={{ width: frameWidth, height: frameHeight }}>{canvas}</View>
    </GestureDetector>
  );
}

function ViewfinderBrackets({ width, height }: { width: number; height: number }) {
  const len = Math.min(22, width * 0.15, height * 0.15);
  const c = colors.text;
  const sw = 2.5;
  return (
    <>
      {/* top-left */}
      <Line p1={vec(1, len)} p2={vec(1, 1)} color={c} strokeWidth={sw} />
      <Line p1={vec(1, 1)} p2={vec(len, 1)} color={c} strokeWidth={sw} />
      {/* top-right */}
      <Line p1={vec(width - 1, len)} p2={vec(width - 1, 1)} color={c} strokeWidth={sw} />
      <Line p1={vec(width - len, 1)} p2={vec(width - 1, 1)} color={c} strokeWidth={sw} />
      {/* bottom-left */}
      <Line p1={vec(1, height - len)} p2={vec(1, height - 1)} color={c} strokeWidth={sw} />
      <Line p1={vec(1, height - 1)} p2={vec(len, height - 1)} color={c} strokeWidth={sw} />
      {/* bottom-right */}
      <Line p1={vec(width - 1, height - len)} p2={vec(width - 1, height - 1)} color={c} strokeWidth={sw} />
      <Line p1={vec(width - len, height - 1)} p2={vec(width - 1, height - 1)} color={c} strokeWidth={sw} />
    </>
  );
}
