import SwiftUI
import AVFoundation

struct ChatView: View {
    @StateObject var viewModel: ChatViewModel
    @FocusState private var isFocused: Bool
    @State private var showingSettings = false
    
    var body: some View {
        NavigationView {
            ZStack {
                // Christmas background
                Color("BackgroundColor")
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    ScrollViewReader { proxy in
                        ScrollView {
                            LazyVStack(spacing: 12) {
                                ForEach(viewModel.messages) { message in
                                    MessageBubble(message: message)
                                        .id(message.id)
                                }
                                if viewModel.isLoading {
                                    TypingIndicator()
                                }
                            }
                            .padding(.horizontal)
                            .padding(.top, 1)
                        }
                        .onChange(of: viewModel.messages.count) { _ in
                            if let lastMessage = viewModel.messages.last {
                                withAnimation {
                                    proxy.scrollTo(lastMessage.id, anchor: .bottom)
                                }
                            }
                        }
                    }
                    
                    Divider()
                    
                    VStack(spacing: 8) {
                        HStack(spacing: 12) {
                            TextField("Message Santa...", text: $viewModel.inputText, axis: .vertical)
                                .textFieldStyle(.roundedBorder)
                                .focused($isFocused)
                                .lineLimit(1...5)
                            
                            Button {
                                Task {
                                    await viewModel.sendMessage()
                                }
                            } label: {
                                Image(systemName: "arrow.up.circle.fill")
                                    .foregroundStyle(.white)
                                    .background(Color("SantaRed"))
                                    .clipShape(Circle())
                                    .font(.system(size: 32))
                            }
                            .disabled(viewModel.inputText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                        }
                        
                        // Voice input button
                        Button {
                            if viewModel.speechService.isListening {
                                viewModel.stopVoiceInput()
                            } else {
                                viewModel.startVoiceInput()
                            }
                        } label: {
                            Label(
                                viewModel.speechService.isListening ? "Stop Recording" : "Record Message",
                                systemImage: viewModel.speechService.isListening ? "stop.circle.fill" : "mic.circle.fill"
                            )
                            .foregroundColor(viewModel.speechService.isListening ? .red : Color("SantaRed"))
                        }
                        .padding(.bottom, 8)
                    }
                    .padding()
                }
            }
            .navigationTitle("Santa Talk")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showingSettings = true
                    } label: {
                        Image(systemName: "gear")
                    }
                }
            }
            .sheet(isPresented: $showingSettings) {
                SettingsView(viewModel: viewModel)
            }
        }
    }
}

struct MessageBubble: View {
    let message: Message
    
    var body: some View {
        HStack {
            if message.sender == .user {
                Spacer()
            } else {
                Image("santa-avatar")
                    .resizable()
                    .frame(width: 32, height: 32)
                    .clipShape(Circle())
            }
            
            Text(message.text)
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(message.sender == .user ? Color("UserBubble") : Color("SantaBubble"))
                .foregroundColor(.white)
                .clipShape(BubbleShape(sender: message.sender))
            
            if message.sender == .santa {
                Spacer()
            }
        }
    }
}

struct BubbleShape: Shape {
    let sender: MessageSender
    
    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: [
                .topLeft: true,
                .topRight: true,
                .bottomLeft: sender == .santa ? false : true,
                .bottomRight: sender == .user ? false : true
            ],
            cornerRadii: CGSize(width: 16, height: 16)
        )
        return Path(path.cgPath)
    }
}

struct TypingIndicator: View {
    @State private var numberOfDots = 0
    
    var body: some View {
        HStack {
            Image("santa-avatar")
                .resizable()
                .frame(width: 32, height: 32)
                .clipShape(Circle())
            
            Text("Santa is typing")
                .foregroundColor(.gray)
            + Text(String(repeating: ".", count: numberOfDots))
                .foregroundColor(.gray)
            Spacer()
        }
        .onAppear {
            withAnimation(Animation.easeInOut(duration: 0.5).repeatForever()) {
                numberOfDots = (numberOfDots + 1) % 4
            }
        }
    }
}
