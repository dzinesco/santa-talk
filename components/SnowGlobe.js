import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import { DeviceMotion } from 'expo-sensors';

const { width, height } = Dimensions.get('window');
const SNOW_FLAKES = 50;

const SnowGlobe = () => {
    const [snowflakes] = useState(() => 
        Array.from({ length: SNOW_FLAKES }, () => ({
            animation: new Animated.Value(0),
            offsetX: Math.random() * width * 0.8,
            size: Math.random() * 4 + 2,
            speed: Math.random() * 3000 + 2000,
        }))
    );

    useEffect(() => {
        // Start snow animation
        const animations = snowflakes.map(flake => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(flake.animation, {
                        toValue: 1,
                        duration: flake.speed,
                        useNativeDriver: true,
                    }),
                    Animated.timing(flake.animation, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    })
                ])
            );
        });

        Animated.parallel(animations).start();

        // Setup device motion
        let subscription;
        const setupDeviceMotion = async () => {
            try {
                await DeviceMotion.requestPermissionsAsync();
                subscription = DeviceMotion.addListener(data => {
                    // Handle device motion for snow effect
                    const { x, y, z } = data.acceleration;
                    if (Math.abs(x) > 1.5 || Math.abs(y) > 1.5 || Math.abs(z) > 1.5) {
                        // Increase snow speed temporarily
                        snowflakes.forEach(flake => {
                            Animated.timing(flake.animation, {
                                toValue: 1,
                                duration: flake.speed * 0.5,
                                useNativeDriver: true,
                            }).start();
                        });
                    }
                });
            } catch (error) {
                console.log('Device motion setup error:', error);
            }
        };

        setupDeviceMotion();

        return () => {
            animations.forEach(anim => anim.stop());
            subscription?.remove();
        };
    }, []);

    return (
        <View style={styles.container}>
            {/* Glass dome */}
            <View style={styles.globe}>
                {/* Snow */}
                {snowflakes.map((flake, index) => (
                    <Animated.View
                        key={index}
                        style={[
                            styles.snowflake,
                            {
                                width: flake.size,
                                height: flake.size,
                                left: flake.offsetX,
                                transform: [{
                                    translateY: flake.animation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-10, height * 0.5]
                                    })
                                }]
                            }
                        ]}
                    />
                ))}
                
                {/* Simple Santa */}
                <View style={styles.santa}>
                    <View style={styles.santaBody} />
                    <View style={styles.santaHead}>
                        <View style={styles.santaHat} />
                    </View>
                </View>

                {/* Trees */}
                {[...Array(5)].map((_, index) => {
                    const angle = (index / 5) * Math.PI * 2;
                    const radius = width * 0.2;
                    return (
                        <View
                            key={index}
                            style={[
                                styles.tree,
                                {
                                    left: width * 0.5 + Math.cos(angle) * radius - 15,
                                    top: height * 0.5 + Math.sin(angle) * radius - 30,
                                }
                            ]}
                        >
                            <View style={styles.treeTrunk} />
                            <View style={styles.treeTop} />
                        </View>
                    )
                })}
            </View>

            {/* Base */}
            <View style={styles.base} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f8ff',
    },
    globe: {
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: width * 0.4,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        overflow: 'hidden',
        position: 'relative',
    },
    base: {
        width: width * 0.85,
        height: 20,
        backgroundColor: '#d42426',
        borderRadius: 10,
        marginTop: -10,
    },
    snowflake: {
        position: 'absolute',
        backgroundColor: 'white',
        borderRadius: 50,
    },
    santa: {
        position: 'absolute',
        left: '50%',
        top: '60%',
        transform: [{ translateX: -20 }],
    },
    santaBody: {
        width: 40,
        height: 40,
        backgroundColor: '#d42426',
        borderRadius: 20,
    },
    santaHead: {
        width: 20,
        height: 20,
        backgroundColor: '#fad6a5',
        borderRadius: 10,
        position: 'absolute',
        top: -15,
        left: 10,
    },
    santaHat: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderBottomWidth: 20,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#d42426',
        position: 'absolute',
        top: -15,
        left: 0,
    },
    tree: {
        position: 'absolute',
        alignItems: 'center',
    },
    treeTrunk: {
        width: 6,
        height: 15,
        backgroundColor: '#8b4513',
    },
    treeTop: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 15,
        borderRightWidth: 15,
        borderBottomWidth: 30,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#006400',
        position: 'absolute',
        top: -25,
    },
});

export default SnowGlobe;
