import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  return (
    <View style={{ flex: 1, backgroundColor: '#101020', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>@{user?.username}</Text>
      <TouchableOpacity
        onPress={logout}
        style={{ marginTop: 24, backgroundColor: '#F04467', paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}
