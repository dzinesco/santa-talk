import Foundation
import CoreData
import SwiftUI
import AVFoundation

@MainActor
class ChatViewModel: ObservableObject {
    @Published var messages: [Message] = []
    @Published var inputText = ""
    @Published var isLoading = false
    @Published var user: User
    
    private let openAIService: OpenAIService
    private let speechService: SpeechService
    private let context: NSManagedObjectContext
    
    init(context: NSManagedObjectContext, apiKey: String) {
        self.context = context
        self.openAIService = OpenAIService(apiKey: apiKey)
        self.speechService = SpeechService()
        self.user = User()
        
        // Load initial messages from CoreData
        loadMessages()
        
        // Add initial Santa greeting if no messages exist
        if messages.isEmpty {
            let greeting = Message(
                text: "Ho Ho Ho! Merry Christmas! What's your name?",
                sender: .santa
            )
            messages.append(greeting)
            saveMessage(greeting)
            
            if user.voiceEnabled {
                speechService.speak(greeting.text)
                speechService.playBellSound()
            }
        }
    }
    
    func sendMessage() async {
        guard !inputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
        
        let userMessage = Message(text: inputText, sender: .user)
        messages.append(userMessage)
        saveMessage(userMessage)
        
        let userText = inputText
        inputText = ""
        isLoading = true
        
        if user.soundEffectsEnabled {
            speechService.playBellSound()
        }
        
        do {
            var prompt = userText
            if !user.name.isEmpty {
                prompt = "The child's name is \(user.name) and they are \(user.age) years old. Personalize your response accordingly. Question: \(userText)"
            }
            
            let santaResponse = try await openAIService.generateSantaResponse(to: prompt)
            let santaMessage = Message(text: santaResponse, sender: .santa)
            messages.append(santaMessage)
            saveMessage(santaMessage)
            
            if user.voiceEnabled {
                speechService.speak(santaResponse)
            }
        } catch {
            let errorMessage = Message(
                text: "Ho ho ho! Santa's magic phone seems to be having trouble. Let's try again!",
                sender: .santa
            )
            messages.append(errorMessage)
            saveMessage(errorMessage)
        }
        
        isLoading = false
    }
    
    func startVoiceInput() {
        do {
            try speechService.startListening()
        } catch {
            print("Error starting voice input: \(error)")
        }
    }
    
    func stopVoiceInput() {
        speechService.stopListening()
        if !speechService.recognizedText.isEmpty {
            inputText = speechService.recognizedText
        }
    }
    
    private func loadMessages() {
        let request = NSFetchRequest<MessageEntity>(entityName: "MessageEntity")
        request.sortDescriptors = [NSSortDescriptor(keyPath: \MessageEntity.timestamp, ascending: true)]
        
        do {
            let messageEntities = try context.fetch(request)
            messages = messageEntities.compactMap { entity in
                guard let id = entity.id,
                      let text = entity.text,
                      let senderRaw = entity.sender,
                      let sender = MessageSender(rawValue: senderRaw),
                      let timestamp = entity.timestamp else {
                    return nil
                }
                return Message(id: id, text: text, sender: sender, timestamp: timestamp)
            }
        } catch {
            print("Error loading messages: \(error)")
        }
    }
    
    private func saveMessage(_ message: Message) {
        let entity = MessageEntity(context: context)
        entity.id = message.id
        entity.text = message.text
        entity.sender = message.sender.rawValue
        entity.timestamp = message.timestamp
        
        do {
            try context.save()
        } catch {
            print("Error saving message: \(error)")
        }
    }
}
