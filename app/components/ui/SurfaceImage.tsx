"use client";

import Image, { type ImageProps } from "next/image";
import { useState, type CSSProperties } from "react";

type SurfaceImageProps = Omit<ImageProps, "style"> & {
  imageStyle?: CSSProperties;
  placeholderStyle?: CSSProperties;
  revealDurationMs?: number;
};

export default function SurfaceImage({
  imageStyle,
  placeholderStyle,
  revealDurationMs = 180,
  onLoad,
  ...props
}: SurfaceImageProps) {
  const [loaded, setLoaded] = useState(false);
  const transition = `opacity ${revealDurationMs}ms ease`;

  return (
    <>
      <div
        aria-hidden
        className="media-skeleton"
        style={{
          position: "absolute",
          inset: 0,
          opacity: loaded ? 0 : 1,
          transition,
          ...placeholderStyle,
        }}
      />
      <Image
        {...props}
        alt={props.alt}
        onLoad={(event) => {
          setLoaded(true);
          onLoad?.(event);
        }}
        style={{
          opacity: loaded ? 1 : 0.01,
          transition,
          ...imageStyle,
        }}
      />
    </>
  );
}
