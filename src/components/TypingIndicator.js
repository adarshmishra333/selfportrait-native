import React, { useRef, useEffect } from 'react';
import { View, Animated } from 'react-native';

const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -6, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    };

    animate(dot1, 0);
    animate(dot2, 150);
    animate(dot3, 300);
  }, []);

  return (
    <View style={{ flexDirection: 'row', padding: 12 }}>
      <View style={{
        backgroundColor: '#E8E8EA',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        flexDirection: 'row',
      }}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#9CA3AF',
              marginHorizontal: 3,
              transform: [{ translateY: dot }],
            }}
          />
        ))}
      </View>
    </View>
  );
};

export default TypingIndicator;

