"use client";

import dynamic from "next/dynamic";

const Beams = dynamic(() => import("./Beams"), {
  ssr: false,
});

export default function BeamsWrapper() {
  return (
    <Beams
      beamWidth={2.5}
      beamHeight={16}
      beamNumber={14}
      lightColor="#15B85C"
      speed={1.5}
      noiseIntensity={1.5}
      scale={0.25}
      rotation={10}
    />
  );
}
