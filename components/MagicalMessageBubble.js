import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import SoundManager from '../utils/SoundManager';

const MagicalMessageBubble = ({ message, isSanta }) => {
  const sparkleOpacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (isSanta) {
      animateEntry();
      playSparkleSound();
    }
  }, []);

  const playSparkleSound = async () => {
    await SoundManager.playSound('sparkle', { volume: 0.3 });
  };

  const animateEntry = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(sparkleOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleOpacity, {
          toValue: 0,
          duration: 300,
          delay: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        isSanta ? styles.santaBubble : styles.userBubble,
        { transform: [{ scale }] },
      ]}
    >
      <Text style={styles.messageText}>{message}</Text>
      {isSanta && (
        <Animated.View
          style={[
            styles.sparkleContainer,
            {
              opacity: sparkleOpacity,
            },
          ]}
        >
          <Text style={styles.sparkle}>✨</Text>
          <Text style={styles.sparkle}>✨</Text>
          <Text style={styles.sparkle}>✨</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginVertical: 8,
    position: 'relative',
  },
  santaBubble: {
    backgroundColor: '#D42426',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageText: {
    color: 'white',
    fontSize: 16,
  },
  sparkleContainer: {
    position: 'absolute',
    top: -15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sparkle: {
    fontSize: 16,
  },
});

export default MagicalMessageBubble;
