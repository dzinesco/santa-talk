import SwiftUI
import AuthenticationServices

struct SettingsView: View {
    @ObservedObject var viewModel: ChatViewModel
    @Environment(\.colorScheme) var colorScheme
    @State private var isAuthenticated = false
    @State private var showingDeleteConfirmation = false
    
    var body: some View {
        NavigationView {
            List {
                Section(header: Text("Child Profile")) {
                    TextField("Child's Name", text: $viewModel.user.name)
                    Stepper("Age: \(viewModel.user.age)", value: $viewModel.user.age, in: 1...12)
                }
                
                Section(header: Text("Accessibility")) {
                    Toggle("Voice Responses", isOn: $viewModel.user.voiceEnabled)
                    Toggle("Sound Effects", isOn: $viewModel.user.soundEffectsEnabled)
                }
                
                Section(header: Text("Parent Controls")) {
                    if !isAuthenticated {
                        SignInWithAppleButton(.signIn) { request in
                            request.requestedScopes = [.fullName]
                        } onCompletion: { result in
                            switch result {
                            case .success(_):
                                isAuthenticated = true
                            case .failure(let error):
                                print("Authentication failed: \(error)")
                            }
                        }
                        .frame(height: 44)
                        .signInWithAppleButtonStyle(
                            colorScheme == .dark ? .white : .black
                        )
                    } else {
                        Toggle("Parent Mode", isOn: $viewModel.user.parentMode)
                        
                        if viewModel.user.parentMode {
                            Button(role: .destructive) {
                                showingDeleteConfirmation = true
                            } label: {
                                Label("Clear Chat History", systemImage: "trash")
                            }
                        }
                    }
                }
                
                Section(header: Text("About")) {
                    HStack {
                        Text("Version")
                        Spacer()
                        Text("1.0.0")
                            .foregroundColor(.secondary)
                    }
                    
                    Link(destination: URL(string: "https://example.com/privacy")!) {
                        Text("Privacy Policy")
                    }
                    
                    Link(destination: URL(string: "https://example.com/terms")!) {
                        Text("Terms of Use")
                    }
                }
            }
            .navigationTitle("Settings")
            .alert("Delete Chat History", isPresented: $showingDeleteConfirmation) {
                Button("Cancel", role: .cancel) { }
                Button("Delete", role: .destructive) {
                    // Implement delete functionality
                }
            } message: {
                Text("Are you sure you want to delete all chat messages? This cannot be undone.")
            }
        }
    }
}
