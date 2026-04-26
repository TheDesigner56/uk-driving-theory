import AsyncStorage from '@react-native-async-storage/async-storage';
import { SpacedRepState, StudySession } from '../types';

const KEYS = {
  SPACED_REP: 'sr_states',
  SESSIONS: 'sessions',
  TEST_DATE: 'test_date',
  DAILY_CHALLENGE: 'daily_challenge',
  PREMIUM: 'premium_tier',
  WEAK_AREAS: 'weak_areas',
};

export const storage = {
  async getSpacedRepStates(): Promise<SpacedRepState[]> {
    const raw = await AsyncStorage.getItem(KEYS.SPACED_REP);
    return raw ? JSON.parse(raw) : [];
  },
  async saveSpacedRepStates(states: SpacedRepState[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.SPACED_REP, JSON.stringify(states));
  },
  async getSessions(): Promise<StudySession[]> {
    const raw = await AsyncStorage.getItem(KEYS.SESSIONS);
    return raw ? JSON.parse(raw) : [];
  },
  async addSession(session: StudySession): Promise<void> {
    const sessions = await this.getSessions();
    sessions.push(session);
    await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
  },
  async getTestDate(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.TEST_DATE);
  },
  async setTestDate(date: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.TEST_DATE, date);
  },
  async getTier(): Promise<'free' | 'premium' | 'supreme'> {
    const raw = await AsyncStorage.getItem(KEYS.PREMIUM);
    return (raw as any) || 'free';
  },
  async setTier(tier: 'free' | 'premium' | 'supreme'): Promise<void> {
    await AsyncStorage.setItem(KEYS.PREMIUM, tier);
  },
};
