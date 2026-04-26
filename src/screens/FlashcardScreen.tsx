import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { FLASHCARDS } from '../data/flashcards';
import { createInitialState, calculateNextReview, getDueCards } from '../engine/spacedRepetition';
import { storage } from '../engine/storage';
import { Colors } from '../theme/colors';
import { CategoryKey, CATEGORY_LABELS, SpacedRepState, FlashCard } from '../types';

const RATING_LABELS: Record<number, string> = {
  1: 'Again',
  2: 'Hard',
  3: 'Good',
  4: 'Easy',
  5: 'Perfect',
};

const RATING_COLORS: Record<number, string> = {
  1: Colors.danger,
  2: '#FF6B6B',
  3: Colors.secondary,
  4: Colors.primary,
  5: Colors.success,
};

const CATEGORIES: ('all' | CategoryKey)[] = [
  'all',
  'alertness',
  'attitude',
  'safety',
  'roadSigns',
  'rules',
  'documents',
  'accidents',
  'motorway',
  'hazard',
  'vehicle',
  'margins',
  'handling',
  'loading',
  'vulnerable',
];

function mapUiRatingToEngine(rating: number): 1 | 2 | 3 | 4 | 5 {
  const map: Record<number, 1 | 2 | 3 | 4 | 5> = { 1: 5, 2: 4, 3: 3, 4: 2, 5: 1 };
  return map[rating] ?? 3;
}

export default function FlashcardScreen() {
  const [loading, setLoading] = useState(true);
  const [states, setStates] = useState<SpacedRepState[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | CategoryKey>('all');
  const [reviewing, setReviewing] = useState(false);
  const [reviewQueue, setReviewQueue] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const loadStates = useCallback(async () => {
    setLoading(true);
    try {
      const stored = await storage.getSpacedRepStates();
      const storedMap = new Map(stored.map(s => [s.cardId, s]));
      const fullStates: SpacedRepState[] = FLASHCARDS.map(card => {
        if (storedMap.has(card.id)) {
          return storedMap.get(card.id)!;
        }
        return createInitialState(card.id);
      });
      const hadNewCards = FLASHCARDS.some(card => !storedMap.has(card.id));
      if (hadNewCards) {
        await storage.saveSpacedRepStates(fullStates);
      }
      setStates(fullStates);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStates();
  }, [loadStates]);

  const dueCards = useMemo(() => {
    const dueStates = getDueCards(states);
    const dueIds = new Set(dueStates.map(s => s.cardId));
    let cards = FLASHCARDS.filter(c => dueIds.has(c.id));
    if (selectedCategory !== 'all') {
      cards = cards.filter(c => c.category === selectedCategory);
    }
    return cards;
  }, [states, selectedCategory]);

  const dueCount = dueCards.length;

  const handleStartReview = useCallback(() => {
    if (dueCards.length === 0) return;
    setReviewQueue(dueCards);
    setCurrentIndex(0);
    setFlipped(false);
    flipAnim.setValue(0);
    setReviewing(true);
  }, [dueCards, flipAnim]);

  const handleFlip = useCallback(() => {
    if (flipped) return;
    Animated.timing(flipAnim, {
      toValue: 180,
      duration: 400,
      useNativeDriver: true,
    }).start(() => setFlipped(true));
  }, [flipped, flipAnim]);

  const handleRate = useCallback(
    async (uiRating: number) => {
      const card = reviewQueue[currentIndex];
      const engineDiff = mapUiRatingToEngine(uiRating);

      const newStates = states.map(s => {
        if (s.cardId === card.id) {
          return calculateNextReview(s, engineDiff);
        }
        return s;
      });

      await storage.saveSpacedRepStates(newStates);
      setStates(newStates);

      if (currentIndex + 1 >= reviewQueue.length) {
        setReviewing(false);
        setFlipped(false);
        flipAnim.setValue(0);
      } else {
        setFlipped(false);
        flipAnim.setValue(0);
        setCurrentIndex(i => i + 1);
      }
    },
    [reviewQueue, currentIndex, states, flipAnim]
  );

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backRotate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 90, 180],
    outputRange: [0, 0, 1],
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (reviewing) {
    const card = reviewQueue[currentIndex];
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Review</Text>
          <Text style={styles.headerSubtitle}>
            {currentIndex + 1} / {reviewQueue.length}
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={handleFlip} style={styles.cardContainer}>
          <Animated.View
            style={[
              styles.cardFace,
              { opacity: frontOpacity, transform: [{ rotateY: frontRotate }] },
            ]}
            pointerEvents={flipped ? 'none' : 'auto'}
          >
            <View style={styles.cardInner}>
              <Text style={styles.cardLabel}>Question</Text>
              <Text style={styles.cardText}>{card.front}</Text>
              {!flipped && <Text style={styles.tapHint}>Tap to reveal answer</Text>}
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.cardFace,
              styles.cardBack,
              { opacity: backOpacity, transform: [{ rotateY: backRotate }] },
            ]}
            pointerEvents={flipped ? 'auto' : 'none'}
          >
            <View style={styles.cardInner}>
              <Text style={styles.cardLabel}>Answer</Text>
              <Text style={styles.cardText}>{card.back}</Text>
            </View>
          </Animated.View>
        </TouchableOpacity>

        {flipped && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingTitle}>How well did you know this?</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map(rating => (
                <TouchableOpacity
                  key={rating}
                  style={[styles.ratingButton, { backgroundColor: RATING_COLORS[rating] }]}
                  onPress={() => handleRate(rating)}
                >
                  <Text style={styles.ratingButtonText}>{rating}</Text>
                  <Text style={styles.ratingLabel}>{RATING_LABELS[rating]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flashcards</Text>

      <View style={styles.countContainer}>
        <Text style={styles.countNumber}>{dueCount}</Text>
        <Text style={styles.countLabel}>cards due</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {CATEGORIES.map(cat => {
          const isActive = selectedCategory === cat;
          const label = cat === 'all' ? 'All' : CATEGORY_LABELS[cat];
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.filterButton, isActive && styles.filterButtonActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {dueCount === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>✓</Text>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>You have no flashcards due for review.</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.startButton} onPress={handleStartReview}>
          <Text style={styles.startButtonText}>Start Review</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  countContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  countNumber: {
    fontSize: 64,
    fontWeight: '900',
    color: Colors.primary,
  },
  countLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  filtersContainer: {
    paddingBottom: 16,
    paddingRight: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: Colors.bg,
  },
  startButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  startButtonText: {
    color: Colors.bg,
    fontSize: 18,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 64,
    color: Colors.success,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  cardContainer: {
    height: 400,
    marginBottom: 24,
  },
  cardFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.bgCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backfaceVisibility: 'hidden',
  },
  cardBack: {
    backgroundColor: Colors.bgCardLight,
  },
  cardInner: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  cardText: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 32,
  },
  tapHint: {
    marginTop: 24,
    fontSize: 14,
    color: Colors.textMuted,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratingButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  ratingButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  ratingLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    marginTop: 4,
  },
});
