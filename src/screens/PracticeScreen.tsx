import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { QUESTIONS } from "../data/questions";
import { CategoryKey, CATEGORY_LABELS, StudySession } from "../types";
import { storage } from "../engine/storage";
import { Colors } from "../theme/colors";

type ScreenState = "loading" | "category" | "practice" | "summary";

interface CategoryProgress {
  totalQuestions: number;
  answered: number;
  correct: number;
}

interface SessionStats {
  category: CategoryKey;
  correct: number;
  total: number;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatDuration(minutes: number): string {
  const m = Math.floor(minutes);
  const s = Math.round((minutes - m) * 60);
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

const ALL_CATEGORIES: (CategoryKey | "all")[] = [
  "all",
  "alertness",
  "attitude",
  "safety",
  "roadSigns",
  "rules",
  "documents",
  "accidents",
  "motorway",
  "hazard",
  "vehicle",
  "margins",
  "handling",
  "loading",
  "vulnerable",
];

export default function PracticeScreen() {
  const [screenState, setScreenState] = useState<ScreenState>("loading");
  const [progressMap, setProgressMap] = useState<
    Record<string, CategoryProgress>
  >({});
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | "all">(
    "all"
  );
  const [sessionQuestions, setSessionQuestions] = useState<typeof QUESTIONS>(
    []
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionStats, setSessionStats] = useState<SessionStats[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);

  const loadProgress = useCallback(async () => {
    const sessions = await storage.getSessions();
    const map: Record<string, CategoryProgress> = {};

    // Initialise with zero counts for all categories + "all"
    ALL_CATEGORIES.forEach((cat) => {
      const key = cat;
      const totalQuestions =
        key === "all"
          ? QUESTIONS.length
          : QUESTIONS.filter((q) => q.category === key).length;
      map[key] = { totalQuestions, answered: 0, correct: 0 };
    });

    sessions.forEach((session) => {
      Object.entries(session.categories).forEach(([catKey, stats]) => {
        if (map[catKey]) {
          map[catKey].answered += stats.total;
          map[catKey].correct += stats.correct;
        }
      });
    });

    setProgressMap(map);
    setScreenState("category");
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const startSession = useCallback((category: CategoryKey | "all") => {
    const filtered =
      category === "all"
        ? QUESTIONS
        : QUESTIONS.filter((q) => q.category === category);
    const shuffled = shuffleArray(filtered);
    setSelectedCategory(category);
    setSessionQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedOption(null);
    setSessionCorrect(0);
    setSessionStats([]);
    setStartTime(Date.now());
    setEndTime(0);
    setScreenState("practice");
  }, []);

  const handleOptionPress = useCallback(
    (index: number) => {
      if (selectedOption !== null) return;
      const question = sessionQuestions[currentIndex];
      const isCorrect = index === question.correctIndex;
      setSelectedOption(index);
      if (isCorrect) {
        setSessionCorrect((prev) => prev + 1);
      }
      setSessionStats((prev) => {
        const existing = prev.find((s) => s.category === question.category);
        if (existing) {
          return prev.map((s) =>
            s.category === question.category
              ? { ...s, correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }
              : s
          );
        }
        return [
          ...prev,
          {
            category: question.category,
            correct: isCorrect ? 1 : 0,
            total: 1,
          },
        ];
      });
    },
    [currentIndex, selectedOption, sessionQuestions]
  );

  const handleNext = useCallback(async () => {
    if (currentIndex < sessionQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      const now = Date.now();
      setEndTime(now);
      const durationMinutes = Math.max(1, Math.round((now - startTime) / 60000));
      const categories: StudySession["categories"] = {};
      sessionStats.forEach((s) => {
        categories[s.category] = { correct: s.correct, total: s.total };
      });

      const session: StudySession = {
        date: new Date().toISOString(),
        duration: durationMinutes,
        questionsAnswered: sessionQuestions.length,
        correct: sessionCorrect,
        categories,
      };

      await storage.addSession(session);
      setScreenState("summary");
    }
  }, [currentIndex, sessionQuestions, sessionCorrect, sessionStats, startTime]);

  const handlePracticeAgain = useCallback(() => {
    startSession(selectedCategory);
  }, [selectedCategory, startSession]);

  const handleBackToCategories = useCallback(() => {
    setScreenState("category");
    loadProgress();
  }, [loadProgress]);

  const getOptionStyle = useCallback(
    (index: number) => {
      const question = sessionQuestions[currentIndex];
      if (!question || selectedOption === null) return styles.optionButton;
      if (index === question.correctIndex) {
        return [styles.optionButton, styles.optionCorrect];
      }
      if (index === selectedOption && index !== question.correctIndex) {
        return [styles.optionButton, styles.optionIncorrect];
      }
      return [styles.optionButton, styles.optionDisabled];
    },
    [currentIndex, selectedOption, sessionQuestions]
  );

  const getOptionTextStyle = useCallback(
    (index: number) => {
      const question = sessionQuestions[currentIndex];
      if (!question || selectedOption === null) return styles.optionText;
      if (index === question.correctIndex) {
        return [styles.optionText, styles.optionTextCorrect];
      }
      if (index === selectedOption && index !== question.correctIndex) {
        return [styles.optionText, styles.optionTextIncorrect];
      }
      return [styles.optionText, styles.optionTextDisabled];
    },
    [currentIndex, selectedOption, sessionQuestions]
  );

  const categoryList = useMemo(() => {
    return ALL_CATEGORIES.map((cat) => {
      const progress = progressMap[cat] || { totalQuestions: 0, answered: 0, correct: 0 };
      const pct =
        progress.answered > 0
          ? Math.round((progress.correct / progress.answered) * 100)
          : 0;
      return { key: cat, label: cat === "all" ? "All Topics" : CATEGORY_LABELS[cat], pct, total: progress.totalQuestions };
    });
  }, [progressMap]);

  const weakAreas = useMemo(() => {
    return sessionStats
      .filter((s) => s.total > 0 && (s.correct / s.total) * 100 < 60)
      .map((s) => CATEGORY_LABELS[s.category]);
  }, [sessionStats]);

  const durationMinutes = useMemo(() => {
    if (!startTime || !endTime) return 0;
    return (endTime - startTime) / 60000;
  }, [startTime, endTime]);

  if (screenState === "loading") {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading progress...</Text>
      </View>
    );
  }

  if (screenState === "category") {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.categoryContent}>
        <Text style={styles.headerTitle}>Practice</Text>
        <Text style={styles.headerSubtitle}>Select a category to start</Text>
        {categoryList.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.categoryCard}
            onPress={() => startSession(item.key as CategoryKey | "all")}
            activeOpacity={0.8}
          >
            <View style={styles.categoryRow}>
              <View
                style={[
                  styles.categoryDot,
                  {
                    backgroundColor:
                      item.key === "all"
                        ? Colors.primary
                        : Colors.category[item.key as CategoryKey] || Colors.primary,
                  },
                ]}
              />
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryLabel}>{item.label}</Text>
                <Text style={styles.categoryCount}>{item.total} questions</Text>
              </View>
              <Text style={styles.categoryPct}>{item.pct}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${item.pct}%`,
                    backgroundColor:
                      item.key === "all"
                        ? Colors.primary
                        : Colors.category[item.key as CategoryKey] || Colors.primary,
                  },
                ]}
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  if (screenState === "practice") {
    const question = sessionQuestions[currentIndex];
    const progressPct =
      sessionQuestions.length > 0
        ? ((currentIndex + (selectedOption !== null ? 1 : 0)) /
            sessionQuestions.length) *
          100
        : 0;

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.practiceContent}>
        <View style={styles.practiceHeader}>
          <Text style={styles.practiceHeaderText}>
            Question {currentIndex + 1} of {sessionQuestions.length}
          </Text>
          <View style={styles.progressTrackSmall}>
            <View style={[styles.progressFillSmall, { width: `${progressPct}%` }]} />
          </View>
        </View>

        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{question.text}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {question.options.map((opt, idx) => (
            <TouchableOpacity
              key={idx}
              style={getOptionStyle(idx) as any}
              onPress={() => handleOptionPress(idx)}
              disabled={selectedOption !== null}
              activeOpacity={0.8}
            >
              <Text style={getOptionTextStyle(idx) as any}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedOption !== null && (
          <View style={styles.explanationCard}>
            <Text style={styles.explanationTitle}>Why is this the correct answer?</Text>
            <Text style={styles.explanationText}>{question.explanation}</Text>
          </View>
        )}

        {selectedOption !== null && (
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>
              {currentIndex < sessionQuestions.length - 1 ? "Next" : "Finish"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  }

  // summary
  const totalAnswered = sessionQuestions.length;
  const totalCorrect = sessionCorrect;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.summaryContent}>
      <Text style={styles.summaryTitle}>Session Complete</Text>

      <View style={styles.scoreCard}>
        <Text style={styles.scoreValue}>
          {totalCorrect}/{totalAnswered}
        </Text>
        <Text style={styles.scoreLabel}>
          {totalAnswered > 0
            ? Math.round((totalCorrect / totalAnswered) * 100) + "% correct"
            : "No questions answered"}
        </Text>
        <Text style={styles.timeLabel}>Time: {formatDuration(durationMinutes)}</Text>
      </View>

      {weakAreas.length > 0 && (
        <View style={styles.weakAreasCard}>
          <Text style={styles.weakAreasTitle}>Weak Areas</Text>
          <Text style={styles.weakAreasSubtitle}>
            Categories with less than 60% accuracy:
          </Text>
          {weakAreas.map((area, idx) => (
            <Text key={idx} style={styles.weakAreaItem}>
              • {area}
            </Text>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.actionButton}
        onPress={handlePracticeAgain}
        activeOpacity={0.8}
      >
        <Text style={styles.actionButtonText}>Practice Again</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.secondaryButton]}
        onPress={handleBackToCategories}
        activeOpacity={0.8}
      >
        <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
          Choose Another Category
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: Colors.textSecondary,
    marginTop: 12,
    fontSize: 14,
  },
  categoryContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerTitle: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  categoryCount: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  categoryPct: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "700",
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  practiceContent: {
    padding: 16,
    paddingBottom: 32,
  },
  practiceHeader: {
    marginBottom: 14,
  },
  practiceHeaderText: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  progressTrackSmall: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFillSmall: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  questionCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  questionText: {
    color: Colors.text,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "500",
  },
  optionsContainer: {
    marginBottom: 8,
  },
  optionButton: {
    backgroundColor: Colors.bgCardLight,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionCorrect: {
    backgroundColor: "rgba(46, 213, 115, 0.15)",
    borderColor: Colors.success,
  },
  optionIncorrect: {
    backgroundColor: "rgba(255, 71, 87, 0.15)",
    borderColor: Colors.danger,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionText: {
    color: Colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  optionTextCorrect: {
    color: Colors.success,
    fontWeight: "600",
  },
  optionTextIncorrect: {
    color: Colors.danger,
    fontWeight: "600",
  },
  optionTextDisabled: {
    color: Colors.textSecondary,
  },
  explanationCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 16,
    marginTop: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  explanationTitle: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
  },
  explanationText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  nextButtonText: {
    color: Colors.bg,
    fontSize: 16,
    fontWeight: "700",
  },
  summaryContent: {
    padding: 16,
    paddingBottom: 32,
    alignItems: "center",
  },
  summaryTitle: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 18,
  },
  scoreCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scoreValue: {
    color: Colors.primary,
    fontSize: 42,
    fontWeight: "800",
  },
  scoreLabel: {
    color: Colors.textSecondary,
    fontSize: 15,
    marginTop: 6,
  },
  timeLabel: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 8,
  },
  weakAreasCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  weakAreasTitle: {
    color: Colors.danger,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  weakAreasSubtitle: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 10,
  },
  weakAreaItem: {
    color: Colors.text,
    fontSize: 14,
    marginBottom: 4,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  actionButtonText: {
    color: Colors.bg,
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: Colors.bgCardLight,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  secondaryButtonText: {
    color: Colors.text,
  },
});
