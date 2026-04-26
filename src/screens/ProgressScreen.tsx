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

interface ProgressScreenProps {
  navigation: {
    navigate: (screen: string, params?: object) => void;
  };
}

function toDateKey(dateStr: string): string {
  return dateStr.split('T')[0];
}

function formatLocalDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ProgressScreen({ navigation }: ProgressScreenProps) {
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
      const sorted = [...sessionData].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setSessions(sorted);
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

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // ─── Overall Stats ──────────────────────────────────────────────────
  const totalAnswered = sessions.reduce((sum, s) => sum + s.questionsAnswered, 0);
  const totalCorrect = sessions.reduce((sum, s) => sum + s.correct, 0);
  const overallAccuracy = totalAnswered === 0 ? 0 : totalCorrect / totalAnswered;
  const passProbability = Math.min(
    99,
    Math.max(1, Math.round(overallAccuracy * 100))
  );

  const passProbColor =
    passProbability > 85
      ? Colors.success
      : passProbability > 70
      ? Colors.warning
      : Colors.danger;

  // ─── Test Countdown ─────────────────────────────────────────────────
  const countdown = (() => {
    if (!testDate) return null;
    const diff =
      new Date(testDate).setHours(0, 0, 0, 0) -
      new Date().setHours(0, 0, 0, 0);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  })();

  // ─── 30-Day Streak Grid (5 columns × 6 rows) ────────────────────────
  const sessionDateSet = new Set(sessions.map((s) => toDateKey(s.date)));
  const streakDays: { date: Date; hasSession: boolean }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = formatLocalDateKey(d);
    streakDays.push({ date: d, hasSession: sessionDateSet.has(key) });
  }

  const gridRows: typeof streakDays[] = [];
  for (let i = 0; i < streakDays.length; i += 5) {
    gridRows.push(streakDays.slice(i, i + 5));
  }

  // ─── Category Mastery ───────────────────────────────────────────────
  const categoryStats: Record<string, { correct: number; total: number }> = {};
  sessions.forEach((s) => {
    Object.entries(s.categories).forEach(([cat, vals]) => {
      if (!categoryStats[cat]) categoryStats[cat] = { correct: 0, total: 0 };
      categoryStats[cat].correct += vals.correct;
      categoryStats[cat].total += vals.total;
    });
  });

  const categoryKeys = Object.keys(CATEGORY_LABELS) as CategoryKey[];

  const categoryMastery = categoryKeys.map((cat) => {
    const stats = categoryStats[cat];
    const pct = stats?.total ? Math.round((stats.correct / stats.total) * 100) : 0;
    return { key: cat, label: CATEGORY_LABELS[cat], pct, stats };
  });

  // ─── Weak Areas ─────────────────────────────────────────────────────
  const weakAreas = categoryMastery.filter(
    (c) => c.stats && c.stats.total > 0 && c.pct < 60
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ── Pass Probability & Countdown ──────────────────────────── */}
      <View style={styles.topSection}>
        <View style={styles.probCard}>
          <Text style={styles.probLabel}>Pass Probability</Text>
          <Text style={[styles.probValue, { color: passProbColor }]}>
            {passProbability}%
          </Text>
          <Text style={styles.probSub}>
            {passProbability >= 86
              ? "You're on track to pass!"
              : passProbability >= 70
              ? 'Keep practicing to improve.'
              : 'Focus on weak areas to boost your score.'}
          </Text>
        </View>

        <View style={styles.countdownCard}>
          {testDate ? (
            <>
              <Text style={styles.countdownValue}>
                {countdown !== null && countdown >= 0 ? countdown : 0}
              </Text>
              <Text style={styles.countdownLabel}>
                {countdown === 1 ? 'day' : 'days'} until test
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.countdownValue}>--</Text>
              <Text style={styles.countdownLabel}>No test date set</Text>
              <TouchableOpacity
                style={styles.setDateBtn}
                onPress={async () => {
                  const d = new Date();
                  d.setDate(d.getDate() + 14);
                  const iso = d.toISOString().split('T')[0];
                  await storage.setTestDate(iso);
                  setTestDate(iso);
                }}
              >
                <Text style={styles.setDateBtnText}>Set +14 days</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* ── 30-Day Streak Grid ────────────────────────────────────── */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Last 30 Days</Text>
        <View style={styles.grid}>
          {gridRows.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.gridRow}>
              {row.map((day, colIdx) => (
                <View
                  key={colIdx}
                  style={[
                    styles.gridCell,
                    {
                      backgroundColor: day.hasSession
                        ? Colors.primary
                        : Colors.bgCardLight,
                    },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.legendText}>Studied</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: Colors.bgCardLight }]}
            />
            <Text style={styles.legendText}>No session</Text>
          </View>
        </View>
      </View>

      {/* ── Category Mastery ──────────────────────────────────────── */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Category Mastery</Text>
        {sessions.length === 0 ? (
          <Text style={styles.emptyText}>
            No sessions yet. Start studying to track mastery!
          </Text>
        ) : (
          categoryMastery.map((cat) => (
            <View key={cat.key} style={styles.barRow}>
              <Text style={styles.barLabel} numberOfLines={1}>
                {cat.label}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${cat.pct}%`,
                      backgroundColor: Colors.category[cat.key],
                    },
                  ]}
                />
              </View>
              <Text style={styles.barValue}>{cat.pct}%</Text>
            </View>
          ))
        )}
      </View>

      {/* ── Weak Areas ────────────────────────────────────────────── */}
      {weakAreas.length > 0 && (
        <View style={[styles.sectionCard, styles.warningCard]}>
          <Text style={[styles.sectionTitle, { color: Colors.danger }]}>
            ⚠️ Weak Areas
          </Text>
          <Text style={styles.warningSub}>
            These categories are below 60% accuracy. Tap to practise them!
          </Text>
          {weakAreas.map((area) => (
            <TouchableOpacity
              key={area.key}
              style={styles.weakRow}
              onPress={() =>
                navigation.navigate('Practice', { category: area.key })
              }
              activeOpacity={0.8}
            >
              <Text style={styles.weakLabel}>{area.label}</Text>
              <Text style={styles.weakValue}>{area.pct}%</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Session History ───────────────────────────────────────── */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Session History</Text>
        {sessions.length === 0 ? (
          <Text style={styles.emptyText}>
            No study sessions recorded yet.
          </Text>
        ) : (
          sessions.map((session, idx) => {
            const accuracy =
              session.questionsAnswered === 0
                ? 0
                : Math.round(
                    (session.correct / session.questionsAnswered) * 100
                  );
            return (
              <View key={idx} style={styles.sessionRow}>
                <View style={styles.sessionLeft}>
                  <Text style={styles.sessionDate}>
                    {formatDateLabel(session.date)}
                  </Text>
                  <Text style={styles.sessionMeta}>
                    {session.questionsAnswered} questions · {session.duration}{' '}
                    min
                  </Text>
                </View>
                <View style={styles.sessionRight}>
                  <Text
                    style={[
                      styles.sessionAccuracy,
                      {
                        color:
                          accuracy >= 86
                            ? Colors.success
                            : accuracy >= 70
                            ? Colors.warning
                            : Colors.danger,
                      },
                    ]}
                  >
                    {accuracy}%
                  </Text>
                  <Text style={styles.sessionCorrect}>
                    {session.correct}/{session.questionsAnswered} correct
                  </Text>
                </View>
              </View>
            );
          })
        )}
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
  topSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    gap: 12,
  },
  probCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  probLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  probValue: {
    fontSize: 40,
    fontWeight: '800',
  },
  probSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  countdownCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownValue: {
    fontSize: 40,
    fontWeight: '800',
    color: Colors.primary,
  },
  countdownLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  setDateBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
  setDateBtnText: {
    color: Colors.bg,
    fontWeight: '700',
    fontSize: 12,
  },
  sectionCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
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
  grid: {
    gap: 6,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  gridCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 6,
  },
  legendRow: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  barLabel: {
    width: 110,
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
  warningCard: {
    borderColor: Colors.danger,
  },
  warningSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  weakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.bgCardLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  weakLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
  },
  weakValue: {
    fontSize: 14,
    color: Colors.danger,
    fontWeight: '700',
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 12,
  },
  sessionLeft: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 2,
  },
  sessionMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sessionRight: {
    alignItems: 'flex-end',
  },
  sessionAccuracy: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  sessionCorrect: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
