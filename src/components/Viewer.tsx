import { useEffect, useRef } from "react";
import * as mapillary from "mapillary-js";

interface ViewerProps {
  imageId: string;
  onLoad?: () => void;
}

export default function Viewer({ imageId, onLoad }: ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<mapillary.Viewer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize the viewer
    const viewer = new mapillary.Viewer({
      accessToken: import.meta.env.VITE_MAPILLARY_ACCESS_TOKEN,
      container: containerRef.current,
      imageId: imageId,
      cameraControls: mapillary.CameraControls.Street,
      component: {
        cover: false,
        direction: true,
        image: true,
        marker: true,
        sequence: true,
        slider: true,
        spatial: true,
      },
    });

    viewerRef.current = viewer;

    // Handle load event
    viewer.on("load", () => {
      onLoad?.();
    });

    // Cleanup
    return () => {
      if (viewerRef.current) {
        viewerRef.current.remove();
        viewerRef.current = null;
      }
    };
  }, [imageId, onLoad]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ position: "relative" }}
    />
  );
}
