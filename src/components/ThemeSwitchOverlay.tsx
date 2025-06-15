
import React from "react";
import { calculateCircleRadius } from "./theme-utils";

interface ThemeSwitchOverlayProps {
  animation: {
    inProgress: boolean;
    toTheme: "light" | "dark" | "system";
    origin: { x: number; y: number };
  } | null;
}

export const ThemeSwitchOverlay: React.FC<ThemeSwitchOverlayProps> = ({ animation }) => {
  if (!animation) return null;
  const { origin, toTheme } = animation;
  const radius = calculateCircleRadius(origin.x, origin.y);
  let circleColor = "rgba(5,5,16,0.85)";
  let gradient = "";
  if (toTheme === "light") {
    circleColor = "rgba(255, 246, 186, 0.88)";
    gradient = "radial-gradient(circle at 60% 40%, #fff7d6 68%, #fff79e 100%)";
  } else if (toTheme === "system") {
    circleColor = "rgba(110, 231, 183, 0.83)";
    gradient = "radial-gradient(circle at 50% 30%, #6ee7b7 70%, #065f46 100%)";
  } else {
    gradient = "radial-gradient(circle at 55% 55%, #16162d 65%, #000 100%)";
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] transition-all duration-700"
      style={{}}
    >
      <div
        className={`
            rounded-full
            fixed
            pointer-events-none
            will-change-[width,height,opacity,left,top]
            transition-all
          `}
        style={{
          width: 0,
          height: 0,
          left: origin.x,
          top: origin.y,
          opacity: 0.9,
          background: gradient.length ? gradient : circleColor,
          boxShadow: "0 0 110px 40px #0002",
          transform: "translate(-50%,-50%)",
          zIndex: 999,
          animation: `theme-expand-softer 0.85s linear forwards`
        }}
      />
      <style>
        {`
            @keyframes theme-expand-softer {
              0%   { width:0; height:0;   opacity:0.88; filter: blur(0px);}
              12%  { opacity: 0.96;}
              25%  { width:${radius * 0.6}px; height:${radius * 0.6}px; opacity:0.99; filter: blur(0.2px);}
              50%  { width:${radius * 1.3}px; height:${radius * 1.3}px; opacity:1; filter: blur(0.4px);}
              80%  { width:${radius * 2}px; height:${radius * 2}px; opacity:0.97; filter: blur(1px);}
              100% { width:${radius * 2}px; height:${radius * 2}px; opacity:0; filter: blur(1.6px);}
            }
          `}
      </style>
    </div>
  );
};
