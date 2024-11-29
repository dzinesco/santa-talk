import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import SoundManager from '../utils/SoundManager';

const TypingDot = ({ delay }) => {
  const scale = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.spring(scale, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          transform: [{ scale }],
        },
      ]}
    />
  );
};

const TypingIndicator = ({ isVisible }) => {
  useEffect(() => {
    if (isVisible) {
      playTypingSound();
    }
  }, [isVisible]);

  const playTypingSound = async () => {
    await SoundManager.playSound('typing', { volume: 0.5 });
  };

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <TypingDot delay={0} />
      <TypingDot delay={200} />
      <TypingDot delay={400} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#D42426',
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginLeft: 10,
    marginBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginHorizontal: 3,
  },
});

export default TypingIndicator;
