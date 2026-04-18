import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { PRODUCTS } from "../data/products";
import glassBG4 from "../assets/glassBG4.png";
import "./VirtualTryOnPage.css";

const BASE_GLASSES_WIDTH = 280;
const FIT_PRESETS = [
  { id: "slim", label: "Slim Fit", config: { y: -36, scale: 0.86 } },
  { id: "balanced", label: "Balanced", config: { y: -18, scale: 1 } },
  { id: "oversized", label: "Oversized", config: { y: -8, scale: 1.16 } },
];

const buildPalette = (product) => {
  if (!product) return [];
  if (product.colorOptions?.length) return product.colorOptions;
  return [{ label: "Default", image: product.image, images: [product.image] }];
};

export default function VirtualTryOnPage() {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const uploadedImageRef = useRef(null);
  const overlayImageRef = useRef(null);
  const stageRef = useRef(null);
  const draggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0, target: "frame" });
  const streamRef = useRef(null);

  const initialProductId = Number(productId) || PRODUCTS[0]?.id;
  const [selectedProductId, setSelectedProductId] = useState(initialProductId);
  const [selectedColorIndex, setSelectedColorIndex] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [sourceMode, setSourceMode] = useState("upload");
  const [cameraError, setCameraError] = useState("");
  const [isCameraRunning, setIsCameraRunning] = useState(false);
  const [snapshotMessage, setSnapshotMessage] = useState("");
  const [activeLayer, setActiveLayer] = useState("frame");
  const [base, setBase] = useState({ x: 0, y: 0, scale: 1, rotate: 0, brightness: 1 });
  const [overlay, setOverlay] = useState({ x: 0, y: 0, scale: 1, rotate: 0, opacity: 0.88 });

  const product = useMemo(
    () => PRODUCTS.find((item) => item.id === selectedProductId) ?? PRODUCTS[0],
    [selectedProductId]
  );

  const palette = useMemo(() => buildPalette(product), [product]);

  const fallbackColorIndex = useMemo(() => {
    const colorName = searchParams.get("color");
    if (!colorName || !palette.length) return 0;
    const index = palette.findIndex(
      (item) => item.name?.toLowerCase() === colorName.toLowerCase()
    );
    return index >= 0 ? index : 0;
  }, [palette, searchParams]);

  const activeColorIndex =
    selectedColorIndex !== null && selectedColorIndex < palette.length
      ? selectedColorIndex
      : fallbackColorIndex;

  const activeColor = palette[activeColorIndex] ?? palette[0];
  const glassesImage = activeColor?.image || product?.image || "";

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraRunning(false);
  };

  const startCamera = async () => {
    setCameraError("");
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      setSourceMode("camera");
      setIsCameraRunning(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (error) {
      const fallback = "Could not access camera. Please allow permission or use image upload.";
      setCameraError(error?.message || fallback);
      setSourceMode("upload");
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (uploadedImageUrl) URL.revokeObjectURL(uploadedImageUrl);
    };
  }, [uploadedImageUrl]);

  const onUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    stopCamera();
    setSourceMode("upload");
    if (uploadedImageUrl) URL.revokeObjectURL(uploadedImageUrl);
    setUploadedImageUrl(URL.createObjectURL(file));
  };

  const startDrag = (event, target) => {
    event.preventDefault();
    draggingRef.current = true;
    setActiveLayer(target);
    const state = target === "photo" ? base : overlay;
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      startX: state.x,
      startY: state.y,
      target,
    };
  };

  const handlePointerMove = (event) => {
    if (!draggingRef.current) return;
    const deltaX = event.clientX - dragStartRef.current.x;
    const deltaY = event.clientY - dragStartRef.current.y;
    if (dragStartRef.current.target === "photo") {
      setBase((prev) => ({
        ...prev,
        x: dragStartRef.current.startX + deltaX,
        y: dragStartRef.current.startY + deltaY,
      }));
      return;
    }
    setOverlay((prev) => ({
      ...prev,
      x: dragStartRef.current.startX + deltaX,
      y: dragStartRef.current.startY + deltaY,
    }));
  };

  const handlePointerUp = () => {
    draggingRef.current = false;
  };

  const saveSnapshot = () => {
    const stage = stageRef.current;
    const overlayMedia = overlayImageRef.current;

    if (!stage || !overlayMedia || !(isCameraRunning || uploadedImageUrl)) {
      setSnapshotMessage("Upload photo or enable camera first.");
      return;
    }

    const stageWidth = stage.clientWidth;
    const stageHeight = stage.clientHeight;
    const exportWidth = 1200;
    const ratio = exportWidth / stageWidth;
    const exportHeight = Math.round(stageHeight * ratio);
    const centerX = exportWidth / 2;
    const centerY = exportHeight / 2;

    const canvas = document.createElement("canvas");
    canvas.width = exportWidth;
    canvas.height = exportHeight;
    const context = canvas.getContext("2d");

    if (!context) { setSnapshotMessage("Could not generate snapshot."); return; }

    context.fillStyle = "#0f172a";
    context.fillRect(0, 0, exportWidth, exportHeight);

    const baseMedia =
      sourceMode === "camera" && isCameraRunning ? videoRef.current : uploadedImageRef.current;

    if (!baseMedia) { setSnapshotMessage("Could not detect base photo."); return; }

    const sourceWidth =
      baseMedia instanceof HTMLVideoElement ? baseMedia.videoWidth : baseMedia.naturalWidth;
    const sourceHeight =
      baseMedia instanceof HTMLVideoElement ? baseMedia.videoHeight : baseMedia.naturalHeight;

    if (!sourceWidth || !sourceHeight) {
      setSnapshotMessage("Photo is still loading. Try again in a second.");
      return;
    }

    const coverScale = Math.max(exportWidth / sourceWidth, exportHeight / sourceHeight);
    const drawWidth = sourceWidth * coverScale;
    const drawHeight = sourceHeight * coverScale;
    const drawX = (exportWidth - drawWidth) / 2;
    const drawY = (exportHeight - drawHeight) / 2;

    context.save();
    context.translate(centerX + base.x * ratio, centerY + base.y * ratio);
    context.rotate((base.rotate * Math.PI) / 180);
    context.scale(base.scale, base.scale);
    context.filter = `brightness(${base.brightness})`;
    context.drawImage(baseMedia, drawX - centerX, drawY - centerY, drawWidth, drawHeight);
    context.restore();

    const overlayNaturalWidth = overlayMedia.naturalWidth;
    const overlayNaturalHeight = overlayMedia.naturalHeight;

    if (!overlayNaturalWidth || !overlayNaturalHeight) {
      setSnapshotMessage("Frame image is still loading. Try again.");
      return;
    }

    const baseFrameWidth = BASE_GLASSES_WIDTH * ratio;
    const baseFrameHeight = baseFrameWidth * (overlayNaturalHeight / overlayNaturalWidth);

    context.save();
    context.translate(centerX + overlay.x * ratio, centerY + overlay.y * ratio);
    context.rotate((overlay.rotate * Math.PI) / 180);
    context.scale(overlay.scale, overlay.scale);
    context.globalAlpha = overlay.opacity;
    context.drawImage(
      overlayMedia,
      -baseFrameWidth / 2,
      -baseFrameHeight / 2,
      baseFrameWidth,
      baseFrameHeight
    );
    context.restore();

    const imageUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `aura-tryon-${product.name.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.click();
    setSnapshotMessage("Snapshot saved successfully.");
  };

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  });

  return (
    <main>

      {/* ── Hero Header ── */}
      <div
        className="tryon-page-hero"
        style={{ backgroundImage: `url(${glassBG4})` }}
      >
        <div className="tryon-page-hero__inner">
          <span className="tryon-page-hero__tag">
            <span className="material-symbols-outlined" style={{ fontSize: "0.85rem" }}>
              view_in_ar
            </span>
            Eyewear Tool
          </span>
          <h1 className="tryon-page-hero__title">
            Virtual <span>Try-On</span>
          </h1>
          <p className="tryon-page-hero__desc">
            Upload your photo or open the camera, then drag and scale the frame over your face.
          </p>
          <Link className="tryon-page-hero__back" to="/shop">
            ← Back to Shop
          </Link>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <section className="tryon-layout">
        <aside className="tryon-panel">
          <h3>1) Choose Frame</h3>
          <select
            value={selectedProductId}
            onChange={(event) => setSelectedProductId(Number(event.target.value))}
          >
            {PRODUCTS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>

          <div className="tryon-colors">
            {palette.map((item, index) => (
              <button
                key={`${item.label}-${index}`}
                type="button"
                className={activeColorIndex === index ? "is-active" : ""}
                onClick={() => setSelectedColorIndex(index)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <h3>2) Add Face Photo</h3>
          <div className="tryon-source-actions">
            <button
              className="btn-primary"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Image
            </button>
            <button className="btn-secondary" type="button" onClick={startCamera}>
              Open Camera
            </button>
            {isCameraRunning && (
              <button className="btn-secondary" type="button" onClick={stopCamera}>
                Stop Camera
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onUpload} hidden />

          {cameraError && <p className="tryon-error">{cameraError}</p>}

          <h3>3) Edit Layer</h3>
          <div className="tryon-layer-switch">
            <button
              type="button"
              className={activeLayer === "frame" ? "is-active" : ""}
              onClick={() => setActiveLayer("frame")}
            >
              Frame
            </button>
            <button
              type="button"
              className={activeLayer === "photo" ? "is-active" : ""}
              onClick={() => setActiveLayer("photo")}
            >
              Photo
            </button>
          </div>

          <h3>4) Quick Fit Presets</h3>
          <div className="tryon-colors">
            {FIT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setOverlay((prev) => ({ ...prev, ...preset.config }))}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <h3>5) Adjust Frame</h3>
          <label className="tryon-control">
            Scale
            <input
              type="range" min={0.45} max={2.2} step={0.01}
              value={overlay.scale}
              onChange={(e) => setOverlay((prev) => ({ ...prev, scale: Number(e.target.value) }))}
            />
          </label>
          <label className="tryon-control">
            Rotate
            <input
              type="range" min={-35} max={35} step={1}
              value={overlay.rotate}
              onChange={(e) => setOverlay((prev) => ({ ...prev, rotate: Number(e.target.value) }))}
            />
          </label>
          <label className="tryon-control">
            Opacity
            <input
              type="range" min={0.3} max={1} step={0.01}
              value={overlay.opacity}
              onChange={(e) => setOverlay((prev) => ({ ...prev, opacity: Number(e.target.value) }))}
            />
          </label>

          <h3>6) Adjust Photo</h3>
          <label className="tryon-control">
            Zoom
            <input
              type="range" min={0.65} max={2} step={0.01}
              value={base.scale}
              onChange={(e) => setBase((prev) => ({ ...prev, scale: Number(e.target.value) }))}
            />
          </label>
          <label className="tryon-control">
            Rotate Photo
            <input
              type="range" min={-30} max={30} step={1}
              value={base.rotate}
              onChange={(e) => setBase((prev) => ({ ...prev, rotate: Number(e.target.value) }))}
            />
          </label>
          <label className="tryon-control">
            Brightness
            <input
              type="range" min={0.7} max={1.3} step={0.01}
              value={base.brightness}
              onChange={(e) => setBase((prev) => ({ ...prev, brightness: Number(e.target.value) }))}
            />
          </label>

          <button
            className="btn-secondary" type="button"
            onClick={() => setOverlay({ x: 0, y: 0, scale: 1, rotate: 0, opacity: 0.88 })}
          >
            Reset Frame
          </button>
          <button
            className="btn-secondary" type="button"
            onClick={() => setBase({ x: 0, y: 0, scale: 1, rotate: 0, brightness: 1 })}
          >
            Reset Photo
          </button>
          <button className="btn-primary" type="button" onClick={saveSnapshot}>
            Save Snapshot
          </button>
          {snapshotMessage && <p className="tryon-snapshot-message">{snapshotMessage}</p>}
          <p className="tryon-tip">
            Tip: choose layer first, then drag directly on preview. You can move photo and frame in
            all directions.
          </p>
        </aside>

        {/* ── Stage ── */}
        <div className="tryon-stage-wrap">
          <section className="tryon-stage" ref={stageRef}>
            {sourceMode === "camera" && isCameraRunning ? (
              <video
                ref={videoRef}
                className={`tryon-base ${activeLayer === "photo" ? "is-editing" : ""}`}
                autoPlay playsInline muted
                onPointerDown={(e) => startDrag(e, "photo")}
                style={{
                  transform: `translate(calc(-50% + ${base.x}px), calc(-50% + ${base.y}px)) scale(${base.scale}) rotate(${base.rotate}deg)`,
                  filter: `brightness(${base.brightness})`,
                }}
              />
            ) : uploadedImageUrl ? (
              <img
                ref={uploadedImageRef}
                src={uploadedImageUrl}
                alt="User face"
                className={`tryon-base ${activeLayer === "photo" ? "is-editing" : ""}`}
                onPointerDown={(e) => startDrag(e, "photo")}
                style={{
                  transform: `translate(calc(-50% + ${base.x}px), calc(-50% + ${base.y}px)) scale(${base.scale}) rotate(${base.rotate}deg)`,
                  filter: `brightness(${base.brightness})`,
                }}
              />
            ) : (
              <div className="tryon-empty">Upload image or enable camera to start try-on.</div>
            )}

            <div className="tryon-fit-guide" aria-hidden="true" />

            {!!glassesImage && (sourceMode === "camera" || uploadedImageUrl) && (
              <img
                ref={overlayImageRef}
                src={glassesImage}
                alt={`${product.name} try-on overlay`}
                className={`tryon-overlay ${activeLayer === "frame" ? "is-editing" : ""}`}
                onPointerDown={(e) => startDrag(e, "frame")}
                style={{
                  width: `${BASE_GLASSES_WIDTH}px`,
                  opacity: overlay.opacity,
                  transform: `translate(calc(-50% + ${overlay.x}px), calc(-50% + ${overlay.y}px)) scale(${overlay.scale}) rotate(${overlay.rotate}deg)`,
                }}
              />
            )}
          </section>
        </div>
      </section>

    </main>
  );
}