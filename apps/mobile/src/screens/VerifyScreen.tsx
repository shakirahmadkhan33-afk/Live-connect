import React, { useEffect, useState } from 'react';
import {
  Text, TextInput, TouchableOpacity, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../context/AuthContext';
import { apiSendCode, apiVerifyCode } from '../services/api';
import { a } from '../theme/authStyles';

export default function VerifyScreen() {
  const { user, refreshUser, logout } = useAuth();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [wait, setWait] = useState(0);

  const token = async () => (await SecureStore.getItemAsync('lc_access')) || '';

  const send = async () => {
    setError('');
    setInfo('');
    setBusy(true);
    try {
      const r = await apiSendCode(await token());
      if (r.alreadyVerified) { await refreshUser(); return; }
      setInfo('Code sent to ' + (user?.email || 'your email'));
      setWait(60);
    } catch (e: any) {
      setError(e.message);
      if (String(e.message).includes('wait a minute')) setWait(60);
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setError('');
    if (code.length !== 6) { setError('Enter the 6-digit code'); return; }
    setBusy(true);
    try {
      await apiVerifyCode(await token(), code);
      await refreshUser();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => { send(); }, []);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  return (
    <KeyboardAvoidingView style={a.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={a.inner} keyboardShouldPersistTaps="handled">
        <Text style={a.logo}>Verify <Text style={a.accent}>email</Text></Text>
        <Text style={a.tagline}>{info || 'Enter the 6-digit code we emailed you'}</Text>
        <TextInput style={a.input} placeholder="123456" placeholderTextColor="#77778F"
          keyboardType="number-pad" maxLength={6} value={code}
          onChangeText={(t) => setCode(t.replace(/[^0-9]/g, ''))} />
        {!!error && <Text style={a.error}>{error}</Text>}
        <TouchableOpacity style={a.button} onPress={verify} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={a.buttonText}>Verify</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={send} disabled={busy || wait > 0}>
          <Text style={a.link}>{wait > 0 ? 'Resend code in ' + wait + 's' : 'Resend code'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={logout}>
          <Text style={a.link}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
