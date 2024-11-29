import SwiftUI

struct ContentView: View {
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // Snow Globe View
            SnowGlobeView()
                .tabItem {
                    Label("Snow Globe", systemImage: "snow")
                }
                .tag(0)
            
            // Chat View
            ChatView(viewModel: ChatViewModel())
                .tabItem {
                    Label("Chat", systemImage: "message.fill")
                }
                .tag(1)
            
            // Settings View
            SettingsView(viewModel: ChatViewModel())
                .tabItem {
                    Label("Settings", systemImage: "gear")
                }
                .tag(2)
        }
        .accentColor(Color("SantaRed"))
    }
}
