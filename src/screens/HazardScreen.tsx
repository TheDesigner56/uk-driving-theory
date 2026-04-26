import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { Colors } from '../theme/colors';

type HazardStatus = 'select' | 'playing' | 'results';

interface HazardEvent {
  time: number;
  description: string;
}

interface Scenario {
  id: string;
  title: string;
  context: string;
  duration: number;
  hazards: HazardEvent[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 's1',
    title: 'Town Centre Driving',
    context: 'You are driving through a busy town centre at 11am on a weekday. The road is lined with parked cars on both sides. A cyclist is ahead in the left lane.',
    duration: 8,
    hazards: [
      { time: 3, description: 'A pedestrian steps out from between two parked cars ahead on the left' },
      { time: 6, description: 'The cyclist ahead signals to turn right without looking back' },
    ],
  },
  {
    id: 's2',
    title: 'Motorway Merge',
    context: 'You are on a motorway slip road, accelerating to merge with fast-moving traffic in the left lane. A lorry is approaching in the middle lane.',
    duration: 7,
    hazards: [
      { time: 2, description: 'A car in front of you on the slip road slows down unexpectedly' },
      { time: 5, description: 'The lorry in the middle lane indicates to move into your lane' },
    ],
  },
  {
    id: 's3',
    title: 'Country Road Bend',
    context: 'You are driving on a narrow country road at 50 mph. There are high hedges on both sides limiting visibility. You approach a sharp left bend.',
    duration: 6,
    hazards: [
      { time: 2, description: 'A tractor emerges from a hidden farm entrance ahead on the left' },
    ],
  },
  {
    id: 's4',
    title: 'Residential Area School',
    context: 'It is 3pm on a school day. You are driving through a residential area near a school. There are parked cars and children\'s warning signs.',
    duration: 8,
    hazards: [
      { time: 2, description: 'A child runs out from behind a parked car chasing a ball' },
      { time: 5, description: 'A car ahead stops suddenly to let a pedestrian cross' },
    ],
  },
  {
    id: 's5',
    title: 'Roundabout Approach',
    context: 'You approach a large multi-lane roundabout on a dual carriageway. A lorry is in the left lane ahead of you. Traffic is moderate.',
    duration: 7,
    hazards: [
      { time: 3, description: 'The lorry ahead moves slightly into your lane without signalling' },
      { time: 6, description: 'A car approaches from the right on the roundabout faster than expected' },
    ],
  },
  {
    id: 's6',
    title: 'Night Driving in Rain',
    context: 'You are driving at night in heavy rain on a poorly lit A-road. Road markings are difficult to see. Your visibility is significantly reduced.',
    duration: 7,
    hazards: [
      { time: 3, description: 'A pedestrian in dark clothing is crossing the road ahead, barely visible' },
    ],
  },
];

export default function HazardScreen() {
  const [status, setStatus] = useState<HazardStatus>('select');
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [step, setStep] = useState(0);
  const [detectedTimes, setDetectedTimes] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [scores, setScores] = useState<{ hazard: HazardEvent; score: number; detected: boolean }[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startScenario = (s: Scenario) => {
    setScenario(s);
    setStep(0);
    setDetectedTimes([]);
    setShowResult(false);
    setScores([]);
    setStatus('playing');

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setStep(elapsed);
      if (elapsed >= s.duration) {
        endScenario(s, startTime);
      }
    }, 1000);
  };

  const detectHazard = () => {
    if (!scenario) return;
    const elapsed = Math.floor(
      (Date.now() - (timerRef.current ? Date.now() - step * 1000 : 0)) / 1000
    );
    // Actually calculate from the real start
    if (!detectedTimes.includes(elapsed)) {
      setDetectedTimes((prev) => [...prev, elapsed]);
    }
  };

  const endScenario = useCallback((s: Scenario, startTime: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const results = s.hazards.map((h) => {
      const closestDetect = detectedTimes.length > 0
        ? detectedTimes.reduce((best, t) =>
            Math.abs(t - h.time) < Math.abs(best - h.time) ? t : best
          , detectedTimes[0])
        : null;

      if (closestDetect !== null && Math.abs(closestDetect - h.time) <= 3) {
        const secondsEarly = h.time - closestDetect;
        let score = 5;
        if (secondsEarly >= 1.5) score = 5;
        else if (secondsEarly >= 1.0) score = 4;
        else if (secondsEarly >= 0.5) score = 3;
        else score = 2;
        return { hazard: h, score, detected: true };
      }
      return { hazard: h, score: 0, detected: false };
    });

    setScores(results);
    setShowResult(true);
    setStatus('results');
  }, [detectedTimes]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (status === 'play') {
    // Quick fallback
    setStatus('select');
  }

  if (status === 'select') {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Hazard Perception</Text>
        <Text style={styles.subtitle}>
          Tap "Detect Hazard" as soon as you spot a developing hazard.
          Earlier detection scores more points.
        </Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ⏱ Each scenario simulates real driving conditions.
            Watch for anything that may cause you to change speed or direction.
          </Text>
        </View>
        {SCENARIOS.map((s) => (
          <TouchableOpacity
            key={s.id}
            style={styles.scenarioCard}
            onPress={() => startScenario(s)}
          >
            <Text style={styles.scenarioTitle}>{s.title}</Text>
            <Text style={styles.scenarioDesc}>{s.context}</Text>
            <Text style={styles.scenarioMeta}>
              ⏱ {s.duration}s · {s.hazards.length} developing hazard{s.hazards.length > 1 ? 's' : ''}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  if (status === 'playing' && scenario) {
    return (
      <View style={styles.container}>
        <View style={styles.playingHeader}>
          <Text style={styles.playingTitle}>{scenario.title}</Text>
          <Text style={styles.timer}>⏱ {step}s / {scenario.duration}s</Text>
        </View>

        <View style={styles.scenarioContext}>
          <Text style={styles.scenarioContextText}>{scenario.context}</Text>
        </View>

        <View style={styles.hazardProgress}>
          {scenario.hazards.map((h, i) => {
            const isPassed = step >= h.time + 1;
            return (
              <View key={i} style={[styles.hazardDot, isPassed && styles.hazardDotPassed]}>
                <Text style={[styles.hazardDotText, isPassed && { color: Colors.text }]}>
                  {i + 1}
                </Text>
              </View>
            );
          })}
          {scenario.hazards.length > 0 && (
            <Text style={styles.hazardLabel}>
              {detectedTimes.length}/{scenario.hazards.length} detected
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.detectBtn} onPress={detectHazard}>
          <Text style={styles.detectBtnText}>⚠ DETECT HAZARD</Text>
        </TouchableOpacity>

        {detectedTimes.length > 0 && (
          <View style={styles.detectedList}>
            <Text style={styles.detectedTitle}>Detected at:</Text>
            {detectedTimes.map((t, i) => (
              <Text key={i} style={styles.detectedItem}>
                ⚡ {t}s into scenario
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  }

  if (status === 'results' && scenario) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Scenario Complete</Text>
        <Text style={styles.scenarioResultTitle}>{scenario.title}</Text>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Total Score</Text>
          <Text style={styles.scoreValue}>
            {scores.reduce((s, r) => s + r.score, 0)} / {scenario.hazards.length * 5}
          </Text>
          <Text style={styles.scoreSubtext}>
            Pass mark: 44/75 (58.7%) across all 14 clips
          </Text>
        </View>

        {scores.map((result, i) => (
          <View key={i} style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultNum}>Hazard {i + 1}</Text>
              <Text style={[
                styles.resultScore,
                { color: result.detected ? Colors.success : Colors.danger },
              ]}>
                {result.detected ? `+${result.score} pts` : 'Missed'}
              </Text>
            </View>
            <Text style={styles.resultDesc}>{result.hazard.description}</Text>
            <Text style={styles.resultTime}>⏱ Occurred at {result.hazard.time}s</Text>
          </View>
        ))}

        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => setStatus('select')}
        >
          <Text style={styles.retryBtnText}>Try Another Scenario</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22, marginBottom: 20 },
  infoBox: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: Colors.secondary,
  },
  infoText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
  scenarioCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  scenarioTitle: { fontSize: 18, fontWeight: '700', color: Colors.primary, marginBottom: 6 },
  scenarioDesc: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginBottom: 8 },
  scenarioMeta: { fontSize: 13, color: Colors.textMuted },
  playingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  playingTitle: { fontSize: 22, fontWeight: '700', color: Colors.text, flex: 1 },
  timer: { fontSize: 18, fontWeight: '700', color: Colors.secondary },
  scenarioContext: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  scenarioContextText: { color: Colors.text, fontSize: 16, lineHeight: 24 },
  hazardProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  hazardDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgCardLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hazardDotPassed: {
    backgroundColor: Colors.danger,
  },
  hazardDotText: { fontSize: 14, fontWeight: '700', color: Colors.textMuted },
  hazardLabel: { color: Colors.textSecondary, fontSize: 14, marginLeft: 8 },
  detectBtn: {
    backgroundColor: Colors.danger,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  detectBtnText: { color: Colors.text, fontSize: 20, fontWeight: '800' },
  detectedList: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 16,
  },
  detectedTitle: { color: Colors.primary, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  detectedItem: { color: Colors.text, fontSize: 14, paddingVertical: 3 },
  scenarioResultTitle: { fontSize: 18, color: Colors.primary, marginBottom: 20 },
  scoreCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreLabel: { color: Colors.textSecondary, fontSize: 14, marginBottom: 4 },
  scoreValue: { color: Colors.primary, fontSize: 40, fontWeight: '800' },
  scoreSubtext: { color: Colors.textMuted, fontSize: 12, marginTop: 8 },
  resultCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultNum: { color: Colors.text, fontSize: 15, fontWeight: '600' },
  resultScore: { fontSize: 15, fontWeight: '700' },
  resultDesc: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, marginBottom: 4 },
  resultTime: { color: Colors.textMuted, fontSize: 12 },
  retryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  retryBtnText: { color: Colors.bg, fontSize: 16, fontWeight: '700' },
});
