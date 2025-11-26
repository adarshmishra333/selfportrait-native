import React, { useRef, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';

const ChatBubble = ({ sender, text, timestamp, isNew = false }) => {
  const fadeAnim = useRef(new Animated.Value(isNew ? 0 : 1)).current;
  const slideAnim = useRef(new Animated.Value(isNew ? 20 : 0)).current;

  useEffect(() => {
    if (isNew) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isNew]);

  const isAI = sender === 'ai';

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        alignItems: isAI ? 'flex-start' : 'flex-end',
        marginVertical: 6,
        marginHorizontal: 12,
      }}
    >
      <View
        style={{
          maxWidth: '80%',
          backgroundColor: isAI ? '#F2F3F5' : '#DCEBFF',
          borderRadius: 16,
          borderBottomLeftRadius: isAI ? 4 : 16,
          borderBottomRightRadius: isAI ? 16 : 4,
          paddingHorizontal: 16,
          paddingVertical: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        <Text
          style={{
            color: '#1F2937',
            fontSize: 15,
            lineHeight: 22,
          }}
        >
          {text}
        </Text>
      </View>
      {timestamp && (
        <Text
          style={{
            fontSize: 11,
            color: '#9CA3AF',
            marginTop: 4,
            marginHorizontal: 4,
          }}
        >
          {timestamp}
        </Text>
      )}
    </Animated.View>
  );
};

export default ChatBubble;

