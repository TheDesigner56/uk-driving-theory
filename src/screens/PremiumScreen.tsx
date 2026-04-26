import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { Colors } from '../theme/colors';
import { storage } from '../engine/storage';

type TierType = 'free' | 'premium' | 'supreme';

interface TierFeature {
  name: string;
  free?: boolean;
  premium?: boolean;
  supreme?: boolean;
}

const TIERS: { key: TierType; name: string; price: string; color: string; popular?: boolean }[] = [
  { key: 'free', name: 'Free', price: '£0', color: Colors.textSecondary },
  { key: 'premium', name: 'Premium', price: '£4.99 one-time', color: Colors.primary, popular: true },
  { key: 'supreme', name: 'Supreme', price: '£9.99 one-time', color: Colors.secondary },
];

const FEATURES: TierFeature[] = [
  { name: 'Practice Questions', free: true, premium: true, supreme: true },
  { name: 'Hazard Perception Simulator', free: true, premium: true, supreme: true },
  { name: 'Active Recall Flashcards', free: true, premium: true, supreme: true },
  { name: 'Daily Challenges', free: true, premium: true, supreme: true },
  { name: 'Basic Progress Dashboard', free: true, premium: true, supreme: true },
  { name: 'Full Question Bank (700+)', premium: true, supreme: true },
  { name: 'FSRS Spaced Repetition', premium: true, supreme: true },
  { name: 'Interleaved Practice Mode', premium: true, supreme: true },
  { name: 'Elaborative Interrogation', premium: true, supreme: true },
  { name: '85+ Hazard Perception Clips', premium: true, supreme: true },
  { name: 'Pass Guarantee', premium: true, supreme: true },
  { name: 'Voiceover / Audio Mode', premium: true, supreme: true },
  { name: 'Offline Access', premium: true, supreme: true },
  { name: 'AI Conversational Tutor', supreme: true },
  { name: 'Instructor & Parent Dashboard', supreme: true },
  { name: 'Practical Test Mastery Pack', supreme: true },
  { name: 'Test Cancellation Finder', supreme: true },
  { name: 'Learner Insurance Discounts', supreme: true },
  { name: 'Family Plan (up to 5 users)', supreme: true },
  { name: 'AR Road Sign Scanner', supreme: true },
  { name: 'Nerves & Confidence Coach', supreme: true },
  { name: 'Test Centre Intelligence', supreme: true },
  { name: 'Lifetime Updates Guarantee', supreme: true },
];

export default function PremiumScreen({ navigation }: any) {
  const [selected, setSelected] = useState<TierType | null>(null);

  const handleSelect = async (tier: TierType) => {
    setSelected(tier);
  };

  const handleUpgrade = async () => {
    if (!selected || selected === 'free') return;
    await storage.setTier(selected);
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Choose Your Plan</Text>
      <Text style={styles.subtitle}>
        Pass your theory test first time with evidence-based learning tools.
        Over half of learners fail — don't be one of them.
      </Text>

      <View style={styles.tierRow}>
        {TIERS.map((tier) => (
          <TouchableOpacity
            key={tier.key}
            style={[
              styles.tierCard,
              selected === tier.key && { borderColor: tier.color, borderWidth: 2 },
              tier.popular && styles.tierPopular,
            ]}
            onPress={() => handleSelect(tier.key)}
          >
            {tier.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>MOST POPULAR</Text>
              </View>
            )}
            <Text style={[styles.tierName, { color: tier.color }]}>{tier.name}</Text>
            <Text style={styles.tierPrice}>{tier.price}</Text>
            <View style={styles.featureList}>
              {FEATURES.filter((f) => f[tier.key]).slice(0, 5).map((f) => (
                <Text key={f.name} style={styles.featureItem}>✓ {f.name}</Text>
              ))}
              {FEATURES.filter((f) => f[tier.key]).length > 5 && (
                <Text style={styles.moreFeatures}>
                  +{FEATURES.filter((f) => f[tier.key]).length - 5} more features
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.featureComparison}>
        <Text style={styles.sectionTitle}>Full Feature Comparison</Text>
        {FEATURES.map((feature) => (
          <View key={feature.name} style={styles.featureRow}>
            <Text style={styles.featureName}>{feature.name}</Text>
            <View style={styles.featureCheckRow}>
              {TIERS.map((tier) => (
                <Text
                  key={tier.key}
                  style={[
                    styles.featureCheck,
                    { color: feature[tier.key] ? Colors.success : Colors.textMuted },
                  ]}
                >
                  {feature[tier.key] ? '✓' : '—'}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>

      {selected && selected !== 'free' && (
        <TouchableOpacity style={styles.upgradeBtn} onPress={handleUpgrade}>
          <Text style={styles.upgradeText}>
            Get {selected === 'premium' ? 'Premium' : 'Supreme'} —{' '}
            {selected === 'premium' ? '£4.99' : '£9.99'}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.disclaimer}>
        Free tier includes 55 practice questions, 5 hazard scenarios, and 30 flashcards.
        Upgrade to unlock the full question bank and premium features.
      </Text>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, padding: 20 },
  backBtn: { marginBottom: 20, paddingVertical: 8 },
  backText: { color: Colors.primary, fontSize: 16, fontWeight: '600' },
  title: { fontSize: 32, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 24 },
  tierRow: { gap: 12, marginBottom: 32 },
  tierCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  tierPopular: { borderColor: Colors.primary },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
  },
  popularText: { color: Colors.bg, fontSize: 11, fontWeight: '700' },
  tierName: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  tierPrice: { fontSize: 16, color: Colors.textSecondary, marginBottom: 16 },
  featureList: { gap: 6 },
  featureItem: { color: Colors.text, fontSize: 14 },
  moreFeatures: { color: Colors.primary, fontSize: 13, marginTop: 4 },
  featureComparison: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 16 },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  featureName: { color: Colors.text, fontSize: 14, flex: 1 },
  featureCheckRow: { flexDirection: 'row', gap: 12 },
  featureCheck: { fontSize: 16, fontWeight: '700', width: 24, textAlign: 'center' },
  upgradeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  upgradeText: { color: Colors.bg, fontSize: 18, fontWeight: '700' },
  disclaimer: { color: Colors.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
