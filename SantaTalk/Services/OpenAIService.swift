import Foundation

class OpenAIService {
    private let apiKey: String
    private let baseURL = "https://api.openai.com/v1/chat/completions"
    
    init(apiKey: String) {
        self.apiKey = apiKey
    }
    
    func generateSantaResponse(to message: String) async throws -> String {
        let santaContext = """
            You are Santa Claus, speaking with a child. You are jolly, kind, and magical.
            You love talking about Christmas, presents, reindeer (especially Rudolph), elves, and the North Pole.
            Keep responses child-friendly, positive, and encouraging. Never break character.
            """
        
        let messages: [[String: String]] = [
            ["role": "system", "content": santaContext],
            ["role": "user", "content": message]
        ]
        
        let requestBody: [String: Any] = [
            "model": "gpt-3.5-turbo",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 150
        ]
        
        var request = URLRequest(url: URL(string: baseURL)!)
        request.httpMethod = "POST"
        request.addValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: requestBody)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        let response = try JSONDecoder().decode(OpenAIResponse.self, from: data)
        
        return response.choices.first?.message.content ?? "Ho ho ho! Santa's magic phone seems to be having trouble. Let's try again!"
    }
}

struct OpenAIResponse: Codable {
    let choices: [Choice]
    
    struct Choice: Codable {
        let message: Message
        
        struct Message: Codable {
            let content: String
        }
    }
}
