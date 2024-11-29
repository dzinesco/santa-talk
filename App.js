import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import SnowGlobe from './components/SnowGlobe';
import ChatInterface from './components/ChatInterface';

export default function App() {
  const [showChat, setShowChat] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      {showChat ? (
        <ChatInterface onBack={() => setShowChat(false)} />
      ) : (
        <View style={styles.snowGlobeContainer}>
          <SnowGlobe />
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => setShowChat(true)}
          >
            <Text style={styles.chatButtonText}>Chat with Santa</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
  },
  snowGlobeContainer: {
    flex: 1,
    position: 'relative',
  },
  chatButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#d42426',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  chatButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
