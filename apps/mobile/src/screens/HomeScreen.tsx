import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const liveUsers = [
  { name: 'Sarah', color: '#F472B6', emoji: '👩🏻' },
  { name: 'Ahmed', color: '#60A5FA', emoji: '👨🏻' },
  { name: 'Ayesha', color: '#A78BFA', emoji: '👩🏽' },
  { name: 'Ali', color: '#34D399', emoji: '👨🏽' },
  { name: 'Maria', color: '#FBBF24', emoji: '👩🏼' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={s.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 24 }}
    >
      <View style={s.header}>
        <View>
          <Text style={s.logo}>LIVE<Text style={s.logoAccent}>CONNECT</Text></Text>
          <Text style={s.tagline}>Go Live. Connect. Talk.</Text>
        </View>
        <TouchableOpacity style={s.coins}>
          <Text style={s.coinText}>{'\u{1F4B0}'} 250</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.notification}>
          <Text style={s.bell}>♧</Text>
        </TouchableOpacity>
      </View>

      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Live Now (Demo)</Text>
        <Text style={s.seeAll}>See all  →</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.liveList}>
        {liveUsers.map((u, i) => (
          <TouchableOpacity key={u.name} style={s.liveUser}>
            <View style={[s.avatarRing, { borderColor: u.color }]}>
              <View style={[s.avatar, { backgroundColor: u.color }]}>
                <Text style={s.avatarEmoji}>{u.emoji}</Text>
              </View>
              {i === 0 && <View style={s.liveDot} />}
            </View>
            <Text style={s.userName}>{u.name}</Text>
            <Text style={s.liveLabel}>LIVE</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Featured Live (Demo)</Text>
        <Text style={s.seeAll}>Explore  →</Text>
      </View>

      <TouchableOpacity style={s.featureCard} activeOpacity={0.9}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=900' }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <View style={s.imageOverlay}>
          <View style={s.liveBadge}>
            <View style={s.redDot} />
            <Text style={s.liveBadgeText}>LIVE NOW</Text>
          </View>
          <View style={s.viewerBadge}>
            <Text style={s.viewerText}>👁  2.4K watching</Text>
          </View>
          <View style={s.featureBottom}>
            <Text style={s.featureTitle}>Music & Chill Night 🎵</Text>
            <Text style={s.featureSubtitle}>Join the conversation and meet new friends</Text>
            <View style={s.hostRow}>
              <View style={s.hostAvatar}><Text>🎤</Text></View>
              <Text style={s.hostName}>Live Music Room</Text>
              <View style={s.joinButton}><Text style={s.joinText}>JOIN LIVE →</Text></View>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>Recommended for You</Text>
        <Text style={s.seeAll}>See all  →</Text>
      </View>

      <View style={s.recommendCard}>
        <View style={s.recommendIcon}><Text style={{ fontSize: 27 }}>🎮</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={s.recommendTitle}>Gaming & Fun</Text>
          <Text style={s.recommendSubtitle}>Discover creators playing live</Text>
        </View>
        <Text style={s.arrow}>→</Text>
      </View>

      <View style={s.recommendCard}>
        <View style={[s.recommendIcon, { backgroundColor: '#33234C' }]}>
          <Text style={{ fontSize: 27 }}>💬</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.recommendTitle}>Voice Rooms</Text>
          <Text style={s.recommendSubtitle}>Talk, listen and make friends</Text>
        </View>
        <Text style={s.arrow}>→</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#101020' },
  header: { paddingHorizontal: 20, paddingBottom: 14, flexDirection: 'row', alignItems: 'center' },
  logo: { color: '#FFFFFF', fontSize: 23, fontWeight: '900', letterSpacing: 1 },
  logoAccent: { color: '#A78BFA' },
  tagline: { color: '#9999B5', fontSize: 11, marginTop: 3 },
  coins: { marginLeft: 'auto', backgroundColor: '#29243F', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 20 },
  coinText: { color: '#FFD76A', fontWeight: 'bold', fontSize: 12 },
  notification: {
    marginLeft: 10, width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#29243F', alignItems: 'center', justifyContent: 'center',
  },
  bell: { color: 'white', fontSize: 21 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginTop: 17, marginBottom: 14,
  },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  seeAll: { color: '#A78BFA', fontSize: 12 },
  liveList: { paddingHorizontal: 15, gap: 17, paddingBottom: 8 },
  liveUser: { alignItems: 'center', width: 65 },
  avatarRing: {
    width: 62, height: 62, borderRadius: 31, borderWidth: 2.5,
    alignItems: 'center', justifyContent: 'center',
  },
  avatar: { width: 53, height: 53, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 28 },
  liveDot: {
    position: 'absolute', right: -1, top: 0, width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#FF416C', borderWidth: 2, borderColor: '#101020',
  },
  userName: { color: '#E5E5F0', fontSize: 11, marginTop: 7 },
  liveLabel: {
    color: '#FFFFFF', backgroundColor: '#F04467', fontSize: 8, fontWeight: 'bold',
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5, marginTop: 4,
  },
  featureCard: { marginHorizontal: 16, height: 300, borderRadius: 22, overflow: 'hidden', backgroundColor: '#1D1D32' },
  imageOverlay: { flex: 1, padding: 15, backgroundColor: 'rgba(10,10,25,0.20)' },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: '#E83E60', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
  },
  redDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'white', marginRight: 6 },
  liveBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  viewerBadge: { alignSelf: 'flex-end', backgroundColor: 'rgba(0,0,0,0.55)', padding: 7, borderRadius: 8 },
  viewerText: { color: 'white', fontSize: 11 },
  featureBottom: { marginTop: 'auto' },
  featureTitle: { color: 'white', fontSize: 21, fontWeight: 'bold' },
  featureSubtitle: { color: '#E5E5F0', fontSize: 11, marginTop: 5 },
  hostRow: { flexDirection: 'row', alignItems: 'center', marginTop: 13 },
  hostAvatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#A78BFA',
    alignItems: 'center', justifyContent: 'center',
  },
  hostName: { color: 'white', fontSize: 11, fontWeight: '600', marginLeft: 8, flex: 1 },
  joinButton: { backgroundColor: '#A78BFA', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 20 },
  joinText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  recommendCard: {
    marginHorizontal: 16, marginBottom: 10, padding: 13, borderRadius: 16,
    backgroundColor: '#1D1D32', flexDirection: 'row', alignItems: 'center',
  },
  recommendIcon: {
    width: 48, height: 48, borderRadius: 13, backgroundColor: '#263653',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  recommendTitle: { color: 'white', fontSize: 13, fontWeight: 'bold' },
  recommendSubtitle: { color: '#9292AC', fontSize: 10, marginTop: 4 },
  arrow: { color: '#A78BFA', fontSize: 22, paddingHorizontal: 5 },
});
