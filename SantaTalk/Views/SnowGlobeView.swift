import SwiftUI
import SceneKit
import CoreMotion

struct SnowGlobeView: View {
    @StateObject private var viewModel = SnowGlobeViewModel()
    
    var body: some View {
        GeometryReader { geometry in
            SceneView(
                scene: viewModel.scene,
                pointOfView: viewModel.cameraNode,
                options: [.allowsCameraControl, .autoenablesDefaultLighting]
            )
            .gesture(
                DragGesture()
                    .onChanged { value in
                        viewModel.handleDrag(value, in: geometry.size)
                    }
            )
            .onAppear {
                viewModel.startMotionUpdates()
            }
            .onDisappear {
                viewModel.stopMotionUpdates()
            }
        }
    }
}

class SnowGlobeViewModel: ObservableObject {
    let scene = SCNScene()
    let cameraNode = SCNNode()
    private let motionManager = CMMotionManager()
    private var snowEmitter: SCNNode?
    private var santaNode: SCNNode?
    private var lastShakeTime = Date()
    
    init() {
        setupScene()
        setupCamera()
        setupLighting()
        setupSnowGlobe()
        setupSimpleSanta()
        setupSnowParticles()
    }
    
    private func setupScene() {
        scene.background.contents = UIColor(red: 0.9, green: 0.95, blue: 1.0, alpha: 1.0) // Light blue winter sky
    }
    
    private func setupCamera() {
        cameraNode.camera = SCNCamera()
        cameraNode.position = SCNVector3(x: 0, y: 0, z: 15)
        scene.rootNode.addChildNode(cameraNode)
    }
    
    private func setupLighting() {
        let ambientLight = SCNNode()
        ambientLight.light = SCNLight()
        ambientLight.light?.type = .ambient
        ambientLight.light?.color = UIColor(white: 0.3, alpha: 1.0)
        scene.rootNode.addChildNode(ambientLight)
        
        let spotLight = SCNNode()
        spotLight.light = SCNLight()
        spotLight.light?.type = .spot
        spotLight.position = SCNVector3(x: 0, y: 10, z: 10)
        spotLight.light?.castsShadow = true
        scene.rootNode.addChildNode(spotLight)
    }
    
    private func setupSnowGlobe() {
        // Create glass dome
        let globeGeometry = SCNSphere(radius: 5)
        globeGeometry.firstMaterial?.diffuse.contents = UIColor.clear
        globeGeometry.firstMaterial?.specular.contents = UIColor.white
        globeGeometry.firstMaterial?.transparency = 0.3
        
        let globeNode = SCNNode(geometry: globeGeometry)
        scene.rootNode.addChildNode(globeNode)
        
        // Create base
        let baseGeometry = SCNCylinder(radius: 5.2, height: 1)
        baseGeometry.firstMaterial?.diffuse.contents = UIColor(named: "SantaRed") ?? .red
        
        let baseNode = SCNNode(geometry: baseGeometry)
        baseNode.position = SCNVector3(x: 0, y: -5, z: 0)
        scene.rootNode.addChildNode(baseNode)
        
        // Add a simple winter scene inside
        addGround()
        addTrees()
    }
    
    private func setupSimpleSanta() {
        // Create a simple Santa using basic shapes
        let bodyGeometry = SCNSphere(radius: 0.6)
        bodyGeometry.firstMaterial?.diffuse.contents = UIColor(named: "SantaRed") ?? .red
        let bodyNode = SCNNode(geometry: bodyGeometry)
        bodyNode.position = SCNVector3(x: 0, y: -3.5, z: 0)
        
        let headGeometry = SCNSphere(radius: 0.3)
        headGeometry.firstMaterial?.diffuse.contents = UIColor(red: 0.98, green: 0.85, blue: 0.73, alpha: 1.0)
        let headNode = SCNNode(geometry: headGeometry)
        headNode.position = SCNVector3(x: 0, y: 0.5, z: 0)
        bodyNode.addChildNode(headNode)
        
        // Add hat
        let hatGeometry = SCNCone(topRadius: 0, bottomRadius: 0.3, height: 0.5)
        hatGeometry.firstMaterial?.diffuse.contents = UIColor(named: "SantaRed") ?? .red
        let hatNode = SCNNode(geometry: hatGeometry)
        hatNode.position = SCNVector3(x: 0, y: 0.4, z: 0)
        headNode.addChildNode(hatNode)
        
        santaNode = bodyNode
        scene.rootNode.addChildNode(bodyNode)
    }
    
    private func addGround() {
        let groundGeometry = SCNCylinder(radius: 4.8, height: 0.1)
        groundGeometry.firstMaterial?.diffuse.contents = UIColor.white
        
        let groundNode = SCNNode(geometry: groundGeometry)
        groundNode.position = SCNVector3(x: 0, y: -4, z: 0)
        scene.rootNode.addChildNode(groundNode)
    }
    
    private func addTrees() {
        for _ in 0..<5 {
            let treeNode = createSimpleTree()
            let radius = Float.random(in: 1...4)
            let angle = Float.random(in: 0...(2 * .pi))
            treeNode.position = SCNVector3(
                x: radius * cos(angle),
                y: -4,
                z: radius * sin(angle)
            )
            scene.rootNode.addChildNode(treeNode)
        }
    }
    
    private func createSimpleTree() -> SCNNode {
        let treeNode = SCNNode()
        
        // Tree trunk
        let trunkGeometry = SCNCylinder(radius: 0.1, height: 0.5)
        trunkGeometry.firstMaterial?.diffuse.contents = UIColor.brown
        let trunkNode = SCNNode(geometry: trunkGeometry)
        trunkNode.position = SCNVector3(x: 0, y: 0.25, z: 0)
        treeNode.addChildNode(trunkNode)
        
        // Tree leaves (cone shape)
        let leavesGeometry = SCNCone(topRadius: 0, bottomRadius: 0.4, height: 1.0)
        leavesGeometry.firstMaterial?.diffuse.contents = UIColor(red: 0, green: 0.3, blue: 0, alpha: 1.0)
        let leavesNode = SCNNode(geometry: leavesGeometry)
        leavesNode.position = SCNVector3(x: 0, y: 1.0, z: 0)
        treeNode.addChildNode(leavesNode)
        
        return treeNode
    }
    
    private func setupSnowParticles() {
        let snowEmitter = SCNNode()
        let particleSystem = SCNParticleSystem()
        
        particleSystem.particleSize = 0.05
        particleSystem.particleColor = .white
        particleSystem.emissionDuration = .infinity
        particleSystem.particleLifeSpan = 5
        particleSystem.emitterShape = SCNSphere(radius: 4)
        particleSystem.birthRate = 20
        particleSystem.spreadingAngle = 180
        
        snowEmitter.addParticleSystem(particleSystem)
        snowEmitter.position = SCNVector3(x: 0, y: 3, z: 0)
        scene.rootNode.addChildNode(snowEmitter)
        self.snowEmitter = snowEmitter
    }
    
    func startMotionUpdates() {
        if motionManager.isAccelerometerAvailable {
            motionManager.accelerometerUpdateInterval = 0.1
            motionManager.startAccelerometerUpdates(to: .main) { [weak self] data, error in
                guard let data = data else { return }
                self?.handleAccelerometer(data)
            }
        }
    }
    
    func stopMotionUpdates() {
        motionManager.stopAccelerometerUpdates()
    }
    
    private func handleAccelerometer(_ data: CMAccelerometerData) {
        let acceleration = sqrt(
            pow(data.acceleration.x, 2) +
            pow(data.acceleration.y, 2) +
            pow(data.acceleration.z, 2)
        )
        
        if acceleration > 2.0 && Date().timeIntervalSince(lastShakeTime) > 1.0 {
            lastShakeTime = Date()
            increaseSnowfall()
            animateSantaOnShake()
        }
    }
    
    private func increaseSnowfall() {
        guard let particleSystem = snowEmitter?.particleSystems?.first else { return }
        
        let originalBirthRate = particleSystem.birthRate
        particleSystem.birthRate = 100
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            particleSystem.birthRate = originalBirthRate
        }
    }
    
    private func animateSantaOnShake() {
        guard let santaNode = santaNode else { return }
        
        let jumpUp = SCNAction.moveBy(x: 0, y: 0.5, z: 0, duration: 0.2)
        let jumpDown = SCNAction.moveBy(x: 0, y: -0.5, z: 0, duration: 0.2)
        let sequence = SCNAction.sequence([jumpUp, jumpDown])
        
        santaNode.runAction(sequence)
    }
    
    func handleDrag(_ value: DragGesture.Value, in size: CGSize) {
        let sensitivity: Float = 0.01
        let deltaX = Float(value.translation.width) * sensitivity
        let deltaY = Float(value.translation.height) * sensitivity
        
        cameraNode.eulerAngles.y += deltaX
        cameraNode.eulerAngles.x = max(-0.5, min(0.5, cameraNode.eulerAngles.x + deltaY))
    }
}
