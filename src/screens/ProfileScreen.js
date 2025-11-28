import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BACKEND_URL } from '../config/api';
import Card from '../components/Card';

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
};

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selfPortrait, setSelfPortrait] = useState('');
  const [dailyStrokes, setDailyStrokes] = useState([]);
  const [weeklySummaries, setWeeklySummaries] = useState([]);
  const [monthlyPortraits, setMonthlyPortraits] = useState([]);
  const [memories, setMemories] = useState([]);

  const fetchData = async () => {
    try {
      const [profileRes, historyRes] = await Promise.all([
        fetch(`${BACKEND_URL}/profile?user_id=demo`),
        fetch(`${BACKEND_URL}/history?user_id=demo`),
      ]);

      if (!profileRes.ok || !historyRes.ok) throw new Error('API error');

      const profileData = await profileRes.json();
      const historyData = await historyRes.json();

      setSelfPortrait(profileData.selfportrait || '');
      setDailyStrokes(Array.isArray(historyData.daily_strokes) ? historyData.daily_strokes : []);
      setWeeklySummaries(Array.isArray(historyData.weekly_summaries) ? historyData.weekly_summaries : []);
      setMonthlyPortraits(Array.isArray(historyData.monthly_portraits) ? historyData.monthly_portraits : []);
      setMemories(Array.isArray(historyData.past_memory) ? historyData.past_memory : []);
      setError('');
    } catch (e) {
      setError('Failed to load profile. Pull to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Computed values
  const recentStrokes = dailyStrokes.slice(-3).reverse();
  const latestWeekly = weeklySummaries.length ? weeklySummaries[weeklySummaries.length - 1] : null;
  const latestMonthly = monthlyPortraits.length ? monthlyPortraits[monthlyPortraits.length - 1] : null;
  const recentMemories = memories.slice(-5).reverse();

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ alignItems: 'center', paddingTop: 24, paddingBottom: 16, paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#1F2937', marginBottom: 8 }}>
            Your Portrait
          </Text>
        <Text style={{ fontSize: 15, color: '#6B7280', textAlign: 'center' }}>
         A living reflection of you, update
        </Text>


