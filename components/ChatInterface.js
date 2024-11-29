import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MagicalEffects from './MagicalEffects';
import MagicalSnowfall from './MagicalSnowfall';
import MagicalMessageBubble from './MagicalMessageBubble';
import TypingIndicator from './TypingIndicator';
import SoundManager from '../utils/SoundManager';

const ChatInterface = ({ onBack }) => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Ho Ho Ho! Merry Christmas! I'm Santa Claus! What's your name?", sender: 'santa' },
  ]);
  const [inputText, setInputText] = useState('');
  const [showMagicalEffects, setShowMagicalEffects] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef();

  useEffect(() => {
    SoundManager.loadSounds();
    return () => {
      SoundManager.unloadSounds();
    };
  }, []);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { id: messages.length + 1, text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Show Santa typing indicator
    setIsTyping(true);
    
    try {
      // Simulate Santa's response with magical effects
      setTimeout(async () => {
        setIsTyping(false);
        setShowMagicalEffects(true);
        await SoundManager.playSound('bells', { volume: 0.5 });
        
        const santaMessage = {
          id: messages.length + 2,
          text: "Ho ho ho! That's wonderful! I love hearing from children like you. What would you like for Christmas?",
          sender: 'santa'
        };
        setMessages(prev => [...prev, santaMessage]);
        
        // Reset magical effects after a delay
        setTimeout(() => {
          setShowMagicalEffects(false);
        }, 2000);
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      setIsTyping(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Santa Chat</Text>
      </View>

      <ScrollView
        style={styles.messagesContainer}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <MagicalMessageBubble
            key={message.id}
            message={message.text}
            isSanta={message.sender === 'santa'}
          />
        ))}
        {isTyping && <TypingIndicator isVisible={true} />}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message to Santa..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
        >
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <MagicalEffects isActive={showMagicalEffects} />
      <MagicalSnowfall isActive={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  header: {
    backgroundColor: '#D42426',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#c41e20',
  },
  backButton: {
    marginRight: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#D42426',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatInterface;
