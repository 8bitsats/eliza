// @ts-nocheck
/* Temporarily disable type checking for this file to address React-Three-Fiber compatibility issues */

import { useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Box } from '@react-three/drei';
import * as THREE from 'three';

interface Image3DViewerProps {
  imageUrl: string;
  prompt?: string;
  title?: string;
}

const Scene = ({ texture }: { texture: THREE.Texture }) => {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 0, 5);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Box args={[3, 3, 0.1]}>
        <meshStandardMaterial map={texture} side={THREE.DoubleSide} />
      </Box>
      <OrbitControls enableZoom={true} />
    </>
  );
};

const Image3DViewer = ({ imageUrl, prompt, title = '3D Image Viewer' }: Image3DViewerProps) => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const textureLoader = useRef(new THREE.TextureLoader());

  useEffect(() => {
    if (imageUrl) {
      textureLoader.current.load(imageUrl, (loadedTexture) => {
        loadedTexture.needsUpdate = true;
        setTexture(loadedTexture);
      });
    }
  }, [imageUrl]);

  if (!texture) {
    return (
      <div className="w-full">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight">{title}</h3>
        </div>
        <div className="p-6 pt-0">
          <div className="w-full h-[400px] relative rounded-md overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight">{title}</h3>
        {prompt && <p className="text-sm text-muted-foreground">{prompt}</p>}
      </div>
      <div className="p-6 pt-0">
        <div className="w-full h-[400px] relative rounded-md overflow-hidden bg-gray-900">
          <Canvas>
            <Scene texture={texture} />
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default Image3DViewer;
