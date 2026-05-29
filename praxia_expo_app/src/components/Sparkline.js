import React from 'react';
import { View, Text } from 'react-native';
import { AppColors } from '../constants/theme';

/**
 * Mini sparkline using proportional bar chart.
 * data: array of numbers, last item is the "current" value (darkest bar).
 */
export default function Sparkline({
  data = [40, 55, 50, 65, 60, 70, 75],
  color = AppColors.primary,
  width = 58,
  height = 22,
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const barCount = data.length;
  const barWidth = Math.floor((width - (barCount - 1) * 2) / barCount);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', width, height, gap: 2 }}>
      {data.map((val, i) => {
        const normalised = (val - min) / range; // 0 to 1
        const barH = Math.max(3, Math.round(normalised * height * 0.75 + height * 0.25));
        const isLast = i === barCount - 1;
        return (
          <View
            key={i}
            style={{
              width: barWidth,
              height: barH,
              borderRadius: 3,
              backgroundColor: color,
              opacity: isLast ? 1 : 0.3 + (i / barCount) * 0.5,
            }}
          />
        );
      })}
    </View>
  );
}
