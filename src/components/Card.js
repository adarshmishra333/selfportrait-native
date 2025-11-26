import React from 'react';
import { View } from 'react-native';

export default function Card({ children, style }) {
  return (
    <View
      style={[
        {
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
          marginBottom: 12,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

