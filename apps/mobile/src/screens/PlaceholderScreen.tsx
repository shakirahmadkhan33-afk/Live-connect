import React from 'react';
import { View, Text } from 'react-native';

export default function PlaceholderScreen({ route }: any) {
  return (
    <View style={{ flex: 1, backgroundColor: '#101020', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>{route.name}</Text>
      <Text style={{ color: '#9999B5', marginTop: 8 }}>Coming soon</Text>
    </View>
  );
}
