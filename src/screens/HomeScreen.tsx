import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme/colors';
import { storage } from '../engine/storage';
import { StudySession, CategoryKey, CATEGORY_LABELS } from '../types';

interface HomeScreenProps {
  navigation: {
    navigate: (screen: string, params?: object) => void;
  };
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [testDate, setTestDate] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sessionData, dateData] = await Promise.all([
        storage.getSessions(),
        storage.getTestDate(),
      ]);
      setSessions(sessionData);
      setTestDate(dateData);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Stats ──────────────────────────────────────────────────────────
  const totalAnswered = sessions.reduce(
    (sum, s) => sum + s.questionsAnswered,
    0
  );
  const totalCorrect = sessions.reduce((sum, s) => sum + s.correct, 0);
  const passProbability =
    totalAnswered === 0
      ? 50
      : Math.min(99, Math.max(1, Math.round((totalCorrect / totalAnswered) * 100)));

  // Streak: consecutive days with sessions, ending today or yesterday
  const streak = (() => {
    if (sessions.length === 0) return 0;
    const uniqueDates = Array.from(new Set(sessions.map((s) => s.date))).sort();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastSessionDate = new Date(uniqueDates[uniqueDates.length - 1]);
    lastSessionDate.setHours(0, 0, 0, 0);

    if (lastSessionDate < yesterday) return 0;

    let count = 0;
    let checkDate = new Date(lastSessionDate);
    for (let i = uniqueDates.length - 1; i >= 0; i--) {
      const d = new Date(uniqueDates[i]);
      d.setHours(0, 0, 0, 0);
      if (+d === +checkDate) {
        count++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (d < checkDate) {
        break;
      }
    }
    return count;
  })();

  // ─── Countdown ──────────────────────────────────────────────────────
  const countdown = (() => {
    if (!testDate) return null;
    const diff =
      new Date(testDate).setHours(0, 0, 0, 0) -
      new Date().setHours(0, 0, 0, 0);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  })();

  // ─── Category mastery ───────────────────────────────────────────────
  const categoryStats: Record<string, { correct: number; total: number }> = {};
  sessions.forEach((s) => {
    Object.entries(s.categories).forEach(([cat, vals]) => {
      if (!categoryStats[cat]) categoryStats[cat] = { correct: 0, total: 0 };
      categoryStats[cat].correct += vals.correct;
      categoryStats[cat].total += vals.total;
    });
  });

  const categoryKeys: CategoryKey[] = Object.keys(
    CATEGORY_LABELS
  ) as CategoryKey[];

  const maxTotal = Math.max(
    1,
    ...categoryKeys.map((k) => categoryStats[k]?.total ?? 0)
  );

  // ─── Handlers ───────────────────────────────────────────────────────
  const setDefaultTestDate = async () => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    const iso = d.toISOString().split('T')[0];
    await storage.setTestDate(iso);
    setTestDate(iso);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ── Welcome / Countdown ───────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome back 👋</Text>
        {testDate ? (
          <View style={styles.countdownBox}>
            <Text style={styles.countdownNumber}>
              {countdown !== null && countdown >= 0 ? countdown : 0}
            </Text>
            <Text style={styles.countdownLabel}>
              {countdown === 1 ? 'day' : 'days'} until theory test
            </Text>
          </View>
        ) : (
          <View style={styles.noDateBox}>
            <Text style={styles.noDateText}>No test date set</Text>
            <TouchableOpacity
              style={styles.setDateBtn}
              onPress={setDefaultTestDate}
            >
              <Text style={styles.setDateBtnText}>Set default (+14 days)</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Quick Stats ───────────────────────────────────────────── */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalAnswered}</Text>
          <Text style={styles.statLabel}>Questions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{passProbability}%</Text>
          <Text style={styles.statLabel}>Pass chance</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{streak}</Text>
          <Text style={styles.statLabel}>Day streak</Text>
        </View>
      </View>

      {/* ── Category Mastery ──────────────────────────────────────── */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Category Mastery</Text>
        {sessions.length === 0 ? (
          <Text style={styles.emptyText}>
            No session data yet. Start studying to see your progress!
          </Text>
        ) : (
          categoryKeys.map((cat) => {
            const stats = categoryStats[cat];
            const pct = stats?.total
              ? Math.round((stats.correct / stats.total) * 100)
              : 0;
            const barWidth = stats?.total
              ? (stats.total / maxTotal) * 100
              : 0;
            return (
              <View key={cat} style={styles.barRow}>
                <Text style={styles.barLabel} numberOfLines={1}>
                  {CATEGORY_LABELS[cat]}
                </Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${barWidth}%`,
                        backgroundColor: Colors.category[cat],
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barValue}>{pct}%</Text>
              </View>
            );
          })
        )}
      </View>

      {/* ── Entry Cards ───────────────────────────────────────────── */}
      <View style={styles.entryRow}>
        <TouchableOpacity
          style={[styles.entryCard, styles.entryCardLeft]}
          onPress={() => navigation.navigate('DailyChallenge')}
          activeOpacity={0.8}
        >
          <Text style={styles.entryIcon}>🎯</Text>
          <Text style={styles.entryTitle}>Daily Challenge</Text>
          <Text style={styles.entrySubtitle}>10 questions to keep sharp</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.entryCard, styles.entryCardRight]}
          onPress={() => navigation.navigate('SmartStudy')}
          activeOpacity={0.8}
        >
          <Text style={styles.entryIcon}>🧠</Text>
          <Text style={styles.entryTitle}>Smart Study</Text>
          <Text style={styles.entrySubtitle}>AI-driven weak spots</Text>
        </TouchableOpacity>
      </View>

      {/* ── Quick Actions ─────────────────────────────────────────── */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('Practice')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionLabel}>Practice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('Flashcards')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>🗂️</Text>
            <Text style={styles.actionLabel}>Flashcards</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('HazardPerception')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionIcon}>🎬</Text>
            <Text style={styles.actionLabel}>Hazard Perception</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  welcome: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  countdownBox: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  countdownNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.primary,
  },
  countdownLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  noDateBox: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  noDateText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  setDateBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  setDateBtnText: {
    color: Colors.bg,
    fontWeight: '700',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sectionCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 12,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  barLabel: {
    width: 100,
    fontSize: 11,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: Colors.bgCardLight,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  barValue: {
    width: 36,
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'right',
    marginLeft: 8,
  },
  entryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  entryCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  entryCardLeft: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary,
  },
  entryCardRight: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.secondary,
  },
  entryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  entrySubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionItem: {
    flex: 1,
    backgroundColor: Colors.bgCardLight,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
