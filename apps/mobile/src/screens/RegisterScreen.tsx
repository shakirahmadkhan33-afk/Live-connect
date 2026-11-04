import React, { useState } from 'react';
import {
  Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { a } from '../theme/authStyles';

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setBusy(true);
    try {
      await register(username.trim(), email.trim(), password);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={a.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={a.inner} keyboardShouldPersistTaps="handled">
        <Text style={a.logo}>Create <Text style={a.accent}>account</Text></Text>
        <Text style={a.tagline}>Join LiveConnect</Text>
        <TextInput style={a.input} placeholder="Username (letters, numbers, _)"
          placeholderTextColor="#77778F" autoCapitalize="none"
          value={username} onChangeText={setUsername} />
        <TextInput style={a.input} placeholder="Email" placeholderTextColor="#77778F"
          autoCapitalize="none" keyboardType="email-address"
          value={email} onChangeText={setEmail} />
        <TextInput style={a.input} placeholder="Password (8+ characters)"
          placeholderTextColor="#77778F" secureTextEntry
          value={password} onChangeText={setPassword} />
        {!!error && <Text style={a.error}>{error}</Text>}
        <TouchableOpacity style={a.button} onPress={submit} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={a.buttonText}>Sign up</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={a.link}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
