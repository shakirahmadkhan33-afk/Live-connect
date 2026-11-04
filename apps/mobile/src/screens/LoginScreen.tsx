import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { a } from '../theme/authStyles';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    setBusy(true);
    try {
      await login(identifier.trim(), password);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={a.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={a.inner} keyboardShouldPersistTaps="handled">
        <Text style={a.logo}>LIVE<Text style={a.accent}>CONNECT</Text></Text>
        <Text style={a.tagline}>Go Live. Connect. Talk.</Text>
        <TextInput style={a.input} placeholder="Username, email or phone"
          placeholderTextColor="#77778F" autoCapitalize="none"
          value={identifier} onChangeText={setIdentifier} />
        <TextInput style={a.input} placeholder="Password" placeholderTextColor="#77778F"
          secureTextEntry value={password} onChangeText={setPassword} />
        {!!error && <Text style={a.error}>{error}</Text>}
        <TouchableOpacity style={a.button} onPress={submit} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={a.buttonText}>Log in</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={a.link}>No account? Create one</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
