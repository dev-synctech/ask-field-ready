import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import {
  TransitionSeries,
  springTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { loadFont as loadDisplay } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";
import plan from "./plan.json";

const { fontFamily: displayFont } = loadDisplay("normal", {
  weights: ["500", "700"],
  subsets: ["latin"],
});
const { fontFamily: bodyFont } = loadBody("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
});

const FPS = 30;
const TRANSITION = 12;

type Scene = {
  scene_id: string;
  duration_seconds: number;
  narration: string;
  on_screen_text: string;
  callout?: string;
};
type ClipData = {
  clip_id: string;
  title: string;
  scenes: Scene[];
};

const BG = "#0B1220";
const SURFACE = "#111A2E";
const TEXT = "#F1F5F9";
const MUTED = "#94A3B8";
const ACCENT = "#22D3B7";
const ACCENT_SOFT = "rgba(34, 211, 183, 0.14)";

const Brand: React.FC<{ title: string }> = ({ title }) => (
  <div
    style={{
      position: "absolute",
      top: 32,
      left: 48,
      right: 48,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontFamily: bodyFont,
      color: MUTED,
      fontSize: 18,
      letterSpacing: 1,
      textTransform: "uppercase",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: 3,
          background: ACCENT,
        }}
      />
      <span style={{ color: TEXT, fontWeight: 600 }}>Mizly</span>
      <span style={{ opacity: 0.6 }}>· Workflow clip</span>
    </div>
    <div style={{ opacity: 0.7, maxWidth: "55%", textAlign: "right" }}>
      {title}
    </div>
  </div>
);

const SceneCard: React.FC<{ scene: Scene; index: number; total: number }> = ({
  scene,
  index,
  total,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entry = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  const headlineY = interpolate(entry, [0, 1], [40, 0]);
  const headlineOp = interpolate(entry, [0, 1], [0, 1]);

  const narrEntry = spring({
    frame: frame - 8,
    fps,
    config: { damping: 22, stiffness: 110 },
  });
  const narrY = interpolate(narrEntry, [0, 1], [24, 0]);
  const narrOp = interpolate(narrEntry, [0, 1], [0, 1]);

  const calloutEntry = spring({
    frame: frame - 16,
    fps,
    config: { damping: 20, stiffness: 130 },
  });
  const calloutScale = interpolate(calloutEntry, [0, 1], [0.92, 1]);
  const calloutOp = interpolate(calloutEntry, [0, 1], [0, 1]);

  const driftX = Math.sin(frame / 60) * 6;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(1200px 600px at 20% 10%, ${ACCENT_SOFT}, transparent 60%), ${BG}`,
        color: TEXT,
        fontFamily: bodyFont,
      }}
    >
      {/* subtle grid */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: 0.6,
        }}
      />

      {/* step indicator */}
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 64,
          display: "flex",
          gap: 10,
        }}
      >
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === index ? 36 : 14,
              height: 6,
              borderRadius: 3,
              background: i === index ? ACCENT : "rgba(255,255,255,0.15)",
              transition: "none",
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          top: 180,
          left: 64,
          right: 64,
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontFamily: bodyFont,
            color: MUTED,
            fontSize: 22,
            letterSpacing: 2,
            textTransform: "uppercase",
            opacity: headlineOp,
          }}
        >
          <div
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              background: ACCENT_SOFT,
              color: ACCENT,
              fontWeight: 600,
              fontSize: 18,
            }}
          >
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </div>
          <span>{scene.scene_id.replace(/^s\d+_/, "").replace(/_/g, " ")}</span>
        </div>

        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 700,
            fontSize: 78,
            lineHeight: 1.05,
            letterSpacing: -1.5,
            transform: `translate(${driftX}px, ${headlineY}px)`,
            opacity: headlineOp,
            color: TEXT,
            maxWidth: 1100,
          }}
        >
          {scene.on_screen_text}
        </div>

        <div
          style={{
            fontSize: 30,
            lineHeight: 1.45,
            color: "rgba(241,245,249,0.85)",
            maxWidth: 1050,
            transform: `translateY(${narrY}px)`,
            opacity: narrOp,
            fontWeight: 400,
          }}
        >
          {scene.narration}
        </div>

        {scene.callout && (
          <div
            style={{
              alignSelf: "flex-start",
              padding: "14px 22px",
              borderRadius: 14,
              background: SURFACE,
              border: `1px solid ${ACCENT}`,
              color: TEXT,
              fontSize: 22,
              fontWeight: 500,
              transform: `scale(${calloutScale})`,
              opacity: calloutOp,
              boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
              maxWidth: 900,
            }}
          >
            <span style={{ color: ACCENT, marginRight: 10, fontWeight: 700 }}>
              ◆
            </span>
            {scene.callout}
          </div>
        )}
      </div>

      {/* footer */}
      <div
        style={{
          position: "absolute",
          bottom: 36,
          left: 64,
          right: 64,
          display: "flex",
          justifyContent: "space-between",
          color: MUTED,
          fontSize: 16,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        <span>Plain-language workflow guide</span>
        <span>mizly.app</span>
      </div>
    </AbsoluteFill>
  );
};

export const Clip: React.FC<{ clipId: string }> = ({ clipId }) => {
  const data = (plan as ClipData[]).find((c) => c.clip_id === clipId);
  if (!data) {
    return (
      <AbsoluteFill style={{ background: BG, color: TEXT }}>
        Missing clip {clipId}
      </AbsoluteFill>
    );
  }
  const { scenes, title } = data;

  return (
    <AbsoluteFill style={{ background: BG }}>
      <TransitionSeries>
        {scenes.map((scene, i) => {
          const dur = Math.round(scene.duration_seconds * FPS);
          return (
            <React.Fragment key={scene.scene_id}>
              <TransitionSeries.Sequence durationInFrames={dur}>
                <SceneCard scene={scene} index={i} total={scenes.length} />
              </TransitionSeries.Sequence>
              {i < scenes.length - 1 && (
                <TransitionSeries.Transition
                  presentation={fade()}
                  timing={springTiming({
                    config: { damping: 200 },
                    durationInFrames: TRANSITION,
                  })}
                />
              )}
            </React.Fragment>
          );
        })}
      </TransitionSeries>
      <Brand title={title} />
    </AbsoluteFill>
  );
};
