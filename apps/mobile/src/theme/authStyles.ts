import { StyleSheet } from 'react-native';

export const a = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101020' },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: 1, textAlign: 'center' },
  accent: { color: '#A78BFA' },
  tagline: { color: '#9999B5', fontSize: 13, textAlign: 'center', marginTop: 6, marginBottom: 36 },
  input: {
    backgroundColor: '#1D1D32', color: '#fff', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginBottom: 12,
  },
  button: { backgroundColor: '#A78BFA', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  error: { color: '#FF6B8A', fontSize: 13, marginBottom: 8, textAlign: 'center' },
  link: { color: '#A78BFA', textAlign: 'center', marginTop: 22, fontSize: 14 },
});
