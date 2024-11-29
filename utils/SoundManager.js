import { Audio } from 'expo-av';

class SoundManager {
  constructor() {
    this.sounds = {
      bells: null,
      typing: null,
      whoosh: null,
      sparkle: null
    };
    this.isLoaded = false;
  }

  async loadSounds() {
    try {
      const bellsSound = await Audio.Sound.createAsync(
        require('../assets/sounds/bells.mp3'),
        { shouldPlay: false }
      );
      const typingSound = await Audio.Sound.createAsync(
        require('../assets/sounds/typing.mp3'),
        { shouldPlay: false }
      );
      const whooshSound = await Audio.Sound.createAsync(
        require('../assets/sounds/whoosh.mp3'),
        { shouldPlay: false }
      );
      const sparkleSound = await Audio.Sound.createAsync(
        require('../assets/sounds/sparkle.mp3'),
        { shouldPlay: false }
      );

      this.sounds = {
        bells: bellsSound.sound,
        typing: typingSound.sound,
        whoosh: whooshSound.sound,
        sparkle: sparkleSound.sound
      };

      this.isLoaded = true;
    } catch (error) {
      console.log('Error loading sounds:', error);
    }
  }

  async playSound(soundName, options = {}) {
    try {
      const sound = this.sounds[soundName];
      if (sound) {
        await sound.setPositionAsync(0);
        if (options.volume) {
          await sound.setVolumeAsync(options.volume);
        }
        await sound.playAsync();
      }
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  }

  async stopSound(soundName) {
    try {
      const sound = this.sounds[soundName];
      if (sound) {
        await sound.stopAsync();
      }
    } catch (error) {
      console.log('Error stopping sound:', error);
    }
  }

  async unloadSounds() {
    try {
      for (const sound of Object.values(this.sounds)) {
        if (sound) {
          await sound.unloadAsync();
        }
      }
      this.isLoaded = false;
    } catch (error) {
      console.log('Error unloading sounds:', error);
    }
  }
}

export default new SoundManager();
