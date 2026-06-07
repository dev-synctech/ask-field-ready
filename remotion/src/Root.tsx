import React from "react";
import { Composition } from "remotion";
import { Clip } from "./Clip";
import plan from "./plan.json";

const FPS = 30;
const WIDTH = 1280;
const HEIGHT = 720;
const TRANSITION = 12;

type Scene = { duration_seconds: number };
type Clip = { clip_id: string; scenes: Scene[] };

function totalFrames(scenes: Scene[]) {
  // back-to-back with overlapping transitions reduces total by TRANSITION per gap
  const raw = scenes.reduce((a, s) => a + s.duration_seconds * FPS, 0);
  const overlap = (scenes.length - 1) * TRANSITION;
  return Math.round(raw - overlap);
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {(plan as Clip[]).map((c) => (
        <Composition
          key={c.clip_id}
          id={c.clip_id.replace(/_/g, "-")}
          component={Clip as React.FC<{ clipId: string }>}
          durationInFrames={totalFrames(c.scenes)}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
          defaultProps={{ clipId: c.clip_id }}
        />
      ))}
    </>
  );
};
