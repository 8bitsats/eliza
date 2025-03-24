import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface Image3DViewerProps {
  imageUrl: string | null;
  title?: string;
}

const Image3DViewer: React.FC<Image3DViewerProps> = ({ imageUrl, title = '3D Image Viewer' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const textureRef = useRef<THREE.Texture | null>(null);
  const planeRef = useRef<THREE.Mesh | null>(null);
  
  // Setup the 3D scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111827); // Dark background
    sceneRef.current = scene;
    
    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;
    
    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Initialize controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controlsRef.current = controls;
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    
    // Setup animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();
    
    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (textureRef.current) textureRef.current.dispose();
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, []);
  
  // Update the image texture when imageUrl changes
  useEffect(() => {
    if (!imageUrl || !sceneRef.current) return;
    
    setIsLoading(true);
    
    // Remove existing plane if it exists
    if (planeRef.current && sceneRef.current) {
      sceneRef.current.remove(planeRef.current);
      planeRef.current.geometry.dispose();
      if (planeRef.current.material instanceof THREE.Material) {
        planeRef.current.material.dispose();
      } else if (Array.isArray(planeRef.current.material)) {
        planeRef.current.material.forEach(material => material.dispose());
      }
    }
    
    // Load new texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      imageUrl,
      (texture) => {
        if (textureRef.current) textureRef.current.dispose();
        textureRef.current = texture;
        
        // Calculate aspect ratio to maintain image proportions
        const aspectRatio = texture.image.width / texture.image.height;
        let width = 4;
        let height = width / aspectRatio;
        
        // Create plane with the loaded texture
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshStandardMaterial({
          map: texture,
          side: THREE.DoubleSide,
        });
        
        const plane = new THREE.Mesh(geometry, material);
        planeRef.current = plane;
        
        if (sceneRef.current) {
          sceneRef.current.add(plane);
          
          // Reset camera and controls to focus on the new image
          if (cameraRef.current) {
            cameraRef.current.position.z = Math.max(5, width * 1.2);
            cameraRef.current.lookAt(0, 0, 0);
          }
          
          if (controlsRef.current) {
            controlsRef.current.reset();
          }
        }
        
        setIsLoading(false);
      },
      undefined, // onProgress callback
      (error) => {
        console.error('Error loading texture:', error);
        setIsLoading(false);
      }
    );
  }, [imageUrl]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={containerRef} 
          className="w-full h-[400px] relative rounded-md overflow-hidden"
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
          {!imageUrl && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
              <p className="text-muted-foreground">Generate an image to see it in 3D</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Image3DViewer;
