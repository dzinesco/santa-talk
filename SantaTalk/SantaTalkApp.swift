import SwiftUI
import SceneKit
import AVFoundation

@main
struct SantaTalkApp: App {
    let persistenceController = PersistenceController.shared
    
    init() {
        // Configure SceneKit default settings
        let defaults = SCNView()
        defaults.antialiasingMode = .multisampling4X
        defaults.preferredFramesPerSecond = 60
        defaults.isJitteringEnabled = true
        
        // Set up audio session for sound effects
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
        try? AVAudioSession.sharedInstance().setActive(true)
    }
    
    var body: some Scene {
        WindowGroup {
            ChatView(viewModel: ChatViewModel(
                context: persistenceController.container.viewContext,
                apiKey: ProcessInfo.processInfo.environment["OPENAI_API_KEY"] ?? ""
            ))
            .environment(\.managedObjectContext, persistenceController.container.viewContext)
        }
    }
}

class PersistenceController {
    static let shared = PersistenceController()
    
    let container: NSPersistentContainer
    
    init() {
        container = NSPersistentContainer(name: "SantaTalk")
        
        container.loadPersistentStores { (storeDescription, error) in
            if let error = error as NSError? {
                fatalError("Unresolved error \(error), \(error.userInfo)")
            }
        }
        
        container.viewContext.automaticallyMergesChangesFromParent = true
    }
}
