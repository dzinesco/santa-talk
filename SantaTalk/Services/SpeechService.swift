import Foundation
import AVFoundation
import Speech

class SpeechService: NSObject, ObservableObject {
    private let synthesizer = AVSpeechSynthesizer()
    private let speechRecognizer = SFSpeechRecognizer(locale: Locale(identifier: "en-US"))
    private var recognitionRequest: SFSpeechAudioBufferRecognitionRequest?
    private var recognitionTask: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()
    
    @Published var isListening = false
    @Published var recognizedText = ""
    
    private var bellSound: AVAudioPlayer?
    
    override init() {
        super.init()
        setupSoundEffects()
    }
    
    private func setupSoundEffects() {
        guard let soundURL = Bundle.main.url(forResource: "sleigh-bells", withExtension: "mp3") else { return }
        do {
            bellSound = try AVAudioPlayer(contentsOf: soundURL)
            bellSound?.prepareToPlay()
        } catch {
            print("Error loading sound effects: \(error)")
        }
    }
    
    func playBellSound() {
        bellSound?.play()
    }
    
    func speak(_ text: String, voice: AVSpeechSynthesisVoice? = nil) {
        let utterance = AVSpeechUtterance(string: text)
        
        // Configure Santa's voice
        utterance.voice = voice ?? AVSpeechSynthesisVoice(language: "en-US")
        utterance.rate = 0.5
        utterance.pitchMultiplier = 0.8
        utterance.volume = 0.8
        
        synthesizer.speak(utterance)
    }
    
    func startListening() throws {
        // Request authorization
        SFSpeechRecognizer.requestAuthorization { [weak self] status in
            guard status == .authorized else { return }
            self?.setupAudioSession()
        }
    }
    
    private func setupAudioSession() {
        recognitionRequest = SFSpeechAudioBufferRecognitionRequest()
        
        let inputNode = audioEngine.inputNode
        recognitionRequest?.shouldReportPartialResults = true
        
        recognitionTask = speechRecognizer?.recognitionTask(with: recognitionRequest!) { [weak self] result, error in
            if let result = result {
                self?.recognizedText = result.bestTranscription.formattedString
            }
            
            if error != nil {
                self?.stopListening()
            }
        }
        
        let recordingFormat = inputNode.outputFormat(forBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: recordingFormat) { buffer, _ in
            self.recognitionRequest?.append(buffer)
        }
        
        audioEngine.prepare()
        do {
            try audioEngine.start()
            isListening = true
        } catch {
            print("Error starting audio engine: \(error)")
        }
    }
    
    func stopListening() {
        audioEngine.stop()
        recognitionRequest?.endAudio()
        recognitionTask?.cancel()
        
        audioEngine.inputNode.removeTap(onBus: 0)
        recognitionRequest = nil
        recognitionTask = nil
        isListening = false
    }
}
