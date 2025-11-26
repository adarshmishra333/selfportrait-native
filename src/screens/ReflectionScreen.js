import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_URL } from '../config/api';
import ChatBubble from '../components/ChatBubble';
import TypingIndicator from '../components/TypingIndicator';
import Card from '../components/Card';

// Format timestamp helper
const formatTimestamp = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const hours = d.getHours() % 12 || 12;
  const mins = d.getMinutes().toString().padStart(2, '0');
  const ampm = d.getHours() >= 12 ? 'PM' : 'AM';
  if (isToday) return `Today · ${hours}:${mins} ${ampm}`;
  return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })} · ${hours}:${mins} ${ampm}`;
};

// Summary Card Component
const SummaryCard = ({ dailyStroke, selfPortrait }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, margin: 12 }}>
      <View style={{
        backgroundColor: '#FAFAFA',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}>
        <Text style={{ fontWeight: '700', fontSize: 16, color: '#1F2937', marginBottom: 8 }}>
          Daily Stroke
        </Text>
        <Text style={{ color: '#4B5563', fontSize: 15, lineHeight: 22, marginBottom: 16 }}>
          {dailyStroke}
        </Text>
        <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 12 }} />
        <Text style={{ fontWeight: '700', fontSize: 16, color: '#1F2937', marginBottom: 8 }}>
          Self Portrait
        </Text>
        <Text style={{ color: '#4B5563', fontSize: 15, lineHeight: 22 }}>
          {selfPortrait}
        </Text>
      </View>
    </Animated.View>
  );
};

// Main Screen
export default function ReflectionScreen() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'What did you do today?', expecting: 'today_action', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dailyStroke, setDailyStroke] = useState('');
  const [selfPortrait, setSelfPortrait] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [error, setError] = useState('');
  const scrollViewRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, loading, showSummary]);

  // Send message handler
  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setError('');
    
    // Add user message
    setMessages(prev => [...prev, { 
      sender: 'user', 
      text: userText, 
      timestamp: Date.now(),
      isNew: true 
    }]);

    setLoading(true);
    setInput('');

    try {
      const res = await fetch(`${BACKEND_URL}/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'demo', user_text: userText }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();

      // Add AI response
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: data.message,
        expecting: data.expecting,
        timestamp: Date.now(),
        isNew: true
      }]);

      // Handle final summary
      if (data.expecting === 'done') {
        setTimeout(() => {
          setDailyStroke(data.daily_stroke || '');
          setSelfPortrait(data.selfportrait || '');
          setShowSummary(true);
        }, 500);
      } else {
        setShowSummary(false);
        setDailyStroke('');
        setSelfPortrait('');
      }
    } catch (err) {
      setError('Something went wrong. Try again?');
    } finally {
      setLoading(false);
    }
  };

  // Reset conversation
  const handleReset = async () => {
    setMessages([
      { sender: 'ai', text: 'What did you do today?', expecting: 'today_action', timestamp: Date.now() }
    ]);
    setInput('');
    setLoading(false);
    setShowSummary(false);
    setError('');
    setDailyStroke('');
    setSelfPortrait('');

    // Reset backend state
    try {
      await fetch(`${BACKEND_URL}/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'demo', reset: true }),
      });
    } catch (e) {
      // Silent fail for reset
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#F3F4F6',
        }}>
          <Text style={{ fontSize: 20, fontWeight: '600', color: '#1F2937' }}>
            Reflection
          </Text>
          <TouchableOpacity
            onPress={handleReset}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#D1D5DB',
            }}
          >
            <Text style={{ fontSize: 13, color: '#6B7280' }}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, idx) => (
            <ChatBubble
              key={idx}
              sender={msg.sender}
              text={msg.text}
              timestamp={formatTimestamp(msg.timestamp)}
              isNew={msg.isNew}
            />
          ))}

          {loading && <TypingIndicator />}

          {error ? (
            <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
              <Text style={{ color: '#EF4444', fontSize: 14 }}>{error}</Text>
            </View>
          ) : null}

          {showSummary && dailyStroke && selfPortrait && (
            <SummaryCard dailyStroke={dailyStroke} selfPortrait={selfPortrait} />
          )}
        </ScrollView>

        {/* Input Bar */}
        {!showSummary && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderTopWidth: 1,
            borderTopColor: '#F3F4F6',
            backgroundColor: '#FFFFFF',
          }}>
            <TextInput
              style={{
                flex: 1,
                backgroundColor: '#F9FAFB',
                borderWidth: 1,
                borderColor: '#E5E7EB',
                borderRadius: 24,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 15,
                color: '#1F2937',
                maxHeight: 100,
              }}
              placeholder="Type your reply…"
              placeholderTextColor="#9CA3AF"
              value={input}
              onChangeText={setInput}
              multiline
              editable={!loading}
              onSubmitEditing={sendMessage}
              returnKeyType="send"
            />
            <TouchableOpacity
              onPress={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                marginLeft: 8,
                backgroundColor: loading || !input.trim() ? '#93C5FD' : '#3B82F6',
                borderRadius: 24,
                width: 44,
                height: 44,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

