import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppColors } from '../constants/theme';

/**
 * Arc gauge using the two-semicircle technique.
 * Renders a 270° arc (opens at bottom) showing the health score.
 *
 * @param {number} score    0–100
 * @param {number} size     Outer diameter in pixels (default 140)
 * @param {number} stroke   Border/stroke width (default 13)
 */
export default function HealthGauge({ score = 78, size = 140, stroke = 13 }) {
  const scoreColor =
    score >= 70 ? AppColors.accent :
    score >= 50 ? AppColors.warning : AppColors.danger;

  const emptyColor = '#E8ECF0';
  const R = size / 2;

  // Arc spans 270°. The gap (90°) is at the bottom.
  // We split the arc into two 135° halves.
  // Right half covers score 0–50%, left half covers 50–100%.
  const arcTotal = 270;
  const filledDeg = (score / 100) * arcTotal; // 0–270

  // Right semicircle: clipped to show only the right half of the circle.
  // We rotate the inner ring to "fill" rightFill degrees.
  const rightFill = Math.min(filledDeg, 135); // 0–135
  const leftFill = Math.max(0, filledDeg - 135); // 0–135

  // rotation of the inner ring:
  // At 0 fill → ring starts at start edge (0 of arc = 135° from top of circle)
  // We add offset so arc starts at -135° from the right-clip seam
  const rightRotation = rightFill - 135; // -135 to 0 deg
  const leftRotation = -leftFill; // 0 to -135 deg

  const half = R;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* ── Background arc (full gray C-shape) ─────────────────────── */}
      {/* Right background half */}
      <View
        pointerEvents="none"
        style={[styles.halfClipRight, { width: half, height: size, left: half, top: 0 }]}
      >
        <View
          style={[
            styles.ring,
            {
              width: size, height: size, borderRadius: R,
              borderWidth: stroke, borderColor: emptyColor,
              left: -half, top: 0,
              transform: [{ rotate: '45deg' }],
            },
          ]}
        />
      </View>
      {/* Left background half */}
      <View
        pointerEvents="none"
        style={[styles.halfClipLeft, { width: half, height: size, left: 0, top: 0 }]}
      >
        <View
          style={[
            styles.ring,
            {
              width: size, height: size, borderRadius: R,
              borderWidth: stroke, borderColor: emptyColor,
              left: 0, top: 0,
              transform: [{ rotate: '45deg' }],
            },
          ]}
        />
      </View>

      {/* ── Filled arc (score color) ─────────────────────────────────── */}
      {/* Right filled half */}
      {rightFill > 0 && (
        <View
          pointerEvents="none"
          style={[styles.halfClipRight, { width: half, height: size, left: half, top: 0 }]}
        >
          <View
            style={[
              styles.ring,
              {
                width: size, height: size, borderRadius: R,
                borderWidth: stroke, borderColor: scoreColor,
                left: -half, top: 0,
                transform: [{ rotate: `${45 + rightRotation}deg` }],
              },
            ]}
          />
        </View>
      )}
      {/* Left filled half */}
      {leftFill > 0 && (
        <View
          pointerEvents="none"
          style={[styles.halfClipLeft, { width: half, height: size, left: 0, top: 0 }]}
        >
          <View
            style={[
              styles.ring,
              {
                width: size, height: size, borderRadius: R,
                borderWidth: stroke, borderColor: scoreColor,
                left: 0, top: 0,
                transform: [{ rotate: `${45 + leftRotation}deg` }],
              },
            ]}
          />
        </View>
      )}

      {/* ── Center score text ────────────────────────────────────────── */}
      <View style={styles.centerText} pointerEvents="none">
        <Text style={[styles.scoreNum, { color: AppColors.text }]}>{score}</Text>
        <Text style={styles.scoreMax}>/100</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  halfClipRight: {
    position: 'absolute',
    overflow: 'hidden',
  },
  halfClipLeft: {
    position: 'absolute',
    overflow: 'hidden',
  },
  ring: {
    position: 'absolute',
  },
  centerText: {
    alignItems: 'center',
    marginTop: 10,
  },
  scoreNum: {
    fontSize: 40,
    fontWeight: '900',
    lineHeight: 44,
  },
  scoreMax: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
