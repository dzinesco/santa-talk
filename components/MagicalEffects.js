import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { Audio } from 'expo-av';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const MagicalEffects = ({ isActive }) => {
  const sparkles = Array(5).fill().map(() => ({
    position: useRef(new Animated.ValueXY()).current,
    opacity: useRef(new Animated.Value(0)).current,
    scale: useRef(new Animated.Value(0)).current,
  }));

  const sound = useRef(null);

  useEffect(() => {
    loadSound();
    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, []);

  const loadSound = async () => {
    try {
      const { sound: bellSound } = await Audio.Sound.createAsync(
        require('../assets/sounds/bells.mp3'),
        { shouldPlay: false }
      );
      sound.current = bellSound;
    } catch (error) {
      console.log('Error loading sound', error);
    }
  };

  useEffect(() => {
    if (isActive) {
      playBellSound();
      animateSparkles();
    }
  }, [isActive]);

  const playBellSound = async () => {
    try {
      if (sound.current) {
        await sound.current.setPositionAsync(0);
        await sound.current.playAsync();
      }
    } catch (error) {
      console.log('Error playing sound', error);
    }
  };

  const animateSparkles = () => {
    sparkles.forEach((sparkle, index) => {
      sparkle.position.setValue({
        x: Math.random() * SCREEN_WIDTH,
        y: SCREEN_HEIGHT,
      });

      const delay = index * 200;

      Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(sparkle.opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(sparkle.opacity, {
            toValue: 0,
            duration: 300,
            delay: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.spring(sparkle.scale, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(sparkle.position.y, {
            toValue: Math.random() * (SCREEN_HEIGHT / 2),
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {sparkles.map((sparkle, index) => (
        <Animated.Image
          key={index}
          source={require('../assets/images/sparkle.png')}
          style={[
            styles.sparkle,
            {
              opacity: sparkle.opacity,
              transform: [
                { translateX: sparkle.position.x },
                { translateY: sparkle.position.y },
                { scale: sparkle.scale },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  sparkle: {
    position: 'absolute',
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
});

export default MagicalEffects;
