import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BACKEND_URL } from '../config/api';
import TabButton from '../components/TabButton';
import Card from '../components/Card';

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return `${date.getDate()} ${date.toLocaleString('default', { month: 'short', year: 'numeric' })}`;
};

// Tab definitions
const TABS = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: 'week' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

export default function HistoryScreen() {
  const [activeTab, setActiveTab] = useState('today');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [dailyStrokes, setDailyStrokes] = useState([]);
  const [weeklySummaries, setWeeklySummaries] = useState([]);
  const [monthlyPortraits, setMonthlyPortraits] = useState([]);

  // Fetch history data
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/history?user_id=demo`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      setDailyStrokes(Array.isArray(data.daily_strokes) ? data.daily_strokes : []);
      setWeeklySummaries(Array.isArray(data.weekly_summaries) ? data.weekly_summaries : []);
      setMonthlyPortraits(Array.isArray(data.monthly_portraits) ? data.monthly_portraits : []);
      setError('');
    } catch (e) {
      setError('Failed to load history. Pull to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  // Render Today tab content
  const renderTodayTab = () => {
    const lastStroke = dailyStrokes.length > 0 ? dailyStrokes[dailyStrokes.length - 1] : null;

    if (!lastStroke) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No history yet.</Text>
          <Text style={styles.emptySubtext}>Complete your first reflection to see it here.</Text>
        </View>
      );
    }

    return (
      <Card>
        <Text style={styles.cardTitle}>Last Daily Stroke</Text>
        <Text style={styles.dateText}>{formatDate(lastStroke.date)}</Text>
        <Text style={styles.contentText}>{lastStroke.text}</Text>
      </Card>
    );
  };

  // Render 7 Days tab content
  const renderWeekTab = () => {
    const last7 = dailyStrokes.slice(-7).reverse();

    if (last7.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No history yet.</Text>
        </View>
      );
    }

    return (
      <View>
        <Text style={styles.sectionTitle}>Last 7 Days</Text>
        {last7.map((stroke, idx) => (
          <Card key={idx} style={{ marginBottom: 12 }}>
            <Text style={styles.dateText}>{formatDate(stroke.date)}</Text>
            <Text style={styles.contentText}>{stroke.text}</Text>
          </Card>
        ))}
      </View>
    );
  };

  // Render Weekly Summaries tab content
  const renderWeeklyTab = () => {
    if (weeklySummaries.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No weekly summaries yet.</Text>
          <Text style={styles.emptySubtext}>Complete 7 daily reflections to generate a weekly summary.</Text>
        </View>
      );
    }

    return (
      <View>
        <Text style={styles.sectionTitle}>Weekly Summaries</Text>
        {weeklySummaries.slice().reverse().map((week, idx) => (
          <Card key={idx} style={{ marginBottom: 16, backgroundColor: '#EFF6FF' }}>
            <Text style={styles.weekTitle}>Week {week.week_number}</Text>
            <Text style={styles.contentText}>{week.summary}</Text>
            {week.evidence && week.evidence.length > 0 && (
              <View style={{ marginTop: 12 }}>
                {week.evidence.map((bullet, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            )}
            <Text style={styles.generatedDate}>{formatDate(week.generated_at)}</Text>
          </Card>
        ))}
      </View>
    );
  };

  // Render Monthly Portraits tab content
  const renderMonthlyTab = () => {
    if (monthlyPortraits.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No monthly portraits yet.</Text>
          <Text style={styles.emptySubtext}>Complete 4 weekly summaries to generate a monthly portrait.</Text>
        </View>
      );
    }

    return (
      <View>
        <Text style={styles.sectionTitle}>Monthly Portraits</Text>
        {monthlyPortraits.slice().reverse().map((month, idx) => (
          <Card key={idx} style={{ marginBottom: 16, backgroundColor: '#F5F3FF' }}>
            <Text style={styles.monthTitle}>Month {month.month_number}</Text>
            <Text style={styles.contentText}>{month.portrait}</Text>
            <Text style={styles.generatedDate}>{formatDate(month.generated_at)}</Text>
          </Card>
        ))}
      </View>
    );
  };

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'today':
        return renderTodayTab();
      case 'week':
        return renderWeekTab();
      case 'weekly':
        return renderWeeklyTab();
      case 'monthly':
        return renderMonthlyTab();
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          {TABS.map((tab) => (
            <TabButton
              key={tab.value}
              label={tab.label}
              isActive={activeTab === tab.value}
              onPress={() => setActiveTab(tab.value)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          renderTabContent()
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles
const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 15,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabScrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  contentText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  weekTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 8,
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B21A8',
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 8,
  },
  bulletPoint: {
    fontSize: 15,
    color: '#1E40AF',
    marginRight: 8,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  generatedDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 12,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 15,
    color: '#EF4444',
  },
};

