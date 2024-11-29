import Foundation
import CoreData

struct User: Codable {
    let id: UUID
    var name: String
    var age: Int
    var parentMode: Bool
    var voiceEnabled: Bool
    var soundEffectsEnabled: Bool
    
    init(id: UUID = UUID(), name: String = "", age: Int = 0, parentMode: Bool = false,
         voiceEnabled: Bool = true, soundEffectsEnabled: Bool = true) {
        self.id = id
        self.name = name
        self.age = age
        self.parentMode = parentMode
        self.voiceEnabled = voiceEnabled
        self.soundEffectsEnabled = soundEffectsEnabled
    }
}
