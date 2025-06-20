import { useEffect, useRef, useState } from "react";
import * as mapillary from "mapillary-js";

interface ViewerProps {
  imageId: string;
  onLoad?: () => void;
}

interface MapillaryError {
  message: string;
  code?: string;
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

export default function Viewer({ imageId, onLoad }: ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<mapillary.Viewer | null>(null);
  const lastImageIdRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false); // For future navigation/zoom

  // Debounced viewer initialization
  const initializeViewer = debounce((imgId: string) => {
    if (!containerRef.current) return;
    if (lastImageIdRef.current === imgId) return; // Prevent re-init if same imageId

    const accessToken = import.meta.env.VITE_MAPILLARY_ACCESS_TOKEN;
    if (!accessToken) {
      setError("Mapillary access token is not configured");
      return;
    }

    try {
      // Cleanup previous viewer if exists
      if (viewerRef.current) {
        try {
          viewerRef.current.remove();
        } catch (e) {
          console.warn("Error during viewer cleanup:", e);
        }
        viewerRef.current = null;
      }

      // Initialize the viewer
      const viewer = new mapillary.Viewer({
        accessToken,
        container: containerRef.current,
        imageId: imgId,
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
      lastImageIdRef.current = imgId;

      // Handle load event
      viewer.on("load", () => {
        setError(null);
        setPending(false);
        onLoad?.();
      });

      // Handle error events
      (viewer as any).on("error", (error: MapillaryError) => {
        console.error("Mapillary viewer error:", error);
        setError(error.message);
        setPending(false);
      });
    } catch (e) {
      console.error("Error initializing Mapillary viewer:", e);
      setError(e instanceof Error ? e.message : "Failed to initialize viewer");
      setPending(false);
    }
  }, 300); // 300ms debounce

  useEffect(() => {
    setPending(true);
    initializeViewer(imageId);
    // Cleanup on unmount
    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.remove();
        } catch (e) {
          console.warn("Error during viewer cleanup:", e);
        }
        viewerRef.current = null;
        lastImageIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageId, onLoad]);

  // Example for future navigation/zoom (with validation):
  // const setZoom = (zoom: number) => {
  //   if (!viewerRef.current) return;
  //   if (typeof zoom !== "number" || isNaN(zoom)) {
  //     setError("Zoom value must be a valid number");
  //     return;
  //   }
  //   viewerRef.current.setZoom(zoom);
  // };

  return (
    <div className="w-full h-full relative">
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ position: "relative" }}
      />
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center">
          {error}
        </div>
      )}
      {/* Optionally, show a loading indicator if pending */}
      {/* {pending && <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white p-2 text-center">Loading...</div>} */}
    </div>
  );
}
