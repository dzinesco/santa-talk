import Foundation
import CoreData

enum MessageSender: String, Codable {
    case santa
    case user
}

struct Message: Identifiable, Codable {
    let id: UUID
    let text: String
    let sender: MessageSender
    let timestamp: Date
    
    init(id: UUID = UUID(), text: String, sender: MessageSender, timestamp: Date = Date()) {
        self.id = id
        self.text = text
        self.sender = sender
        self.timestamp = timestamp
    }
}
