import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SNOWFLAKE_COUNT = 50;

const Snowflake = ({ delay = 0, duration = 6000 }) => {
  const position = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Random starting position
    const startX = Math.random() * SCREEN_WIDTH;
    position.setValue({ x: startX, y: -20 });

    // Create animation sequence
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          // Falling animation
          Animated.timing(position.y, {
            toValue: SCREEN_HEIGHT + 20,
            duration: duration,
            useNativeDriver: true,
          }),
          // Swaying animation
          Animated.sequence([
            Animated.timing(position.x, {
              toValue: startX - 50 + Math.random() * 100,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(position.x, {
              toValue: startX,
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ]),
          // Rotation animation
          Animated.loop(
            Animated.timing(rotation, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: true,
            })
          ),
          // Fade in/out
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.8,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 500,
              delay: duration - 1000,
              useNativeDriver: true,
            }),
          ]),
          // Scale animation
          Animated.sequence([
            Animated.spring(scale, {
              toValue: 1,
              friction: 4,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ])
    ).start();
  }, []);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.Text
      style={[
        styles.snowflake,
        {
          opacity,
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { rotate: spin },
            { scale },
          ],
        },
      ]}
    >
      ❄️
    </Animated.Text>
  );
};

const MagicalSnowfall = ({ isActive }) => {
  if (!isActive) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array(SNOWFLAKE_COUNT)
        .fill()
        .map((_, index) => (
          <Snowflake
            key={index}
            delay={index * (6000 / SNOWFLAKE_COUNT)}
            duration={6000 + Math.random() * 4000}
          />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  snowflake: {
    position: 'absolute',
    fontSize: 20,
  },
});

export default MagicalSnowfall;
