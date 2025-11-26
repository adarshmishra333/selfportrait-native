import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

export default function TabButton({ label, isActive, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: isActive ? '#3B82F6' : '#E5E7EB',
      }}
    >
      <Text
        style={{
          color: isActive ? '#FFFFFF' : '#6B7280',
          fontWeight: '600',
          fontSize: 14,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

