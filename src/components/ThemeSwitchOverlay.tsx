
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
    circleColor = "rgba(255, 246, 186, 0.92)";
    gradient = "radial-gradient(circle at 60% 40%, #fff7d6 68%, #fffab2 100%)";
  } else if (toTheme === "system") {
    circleColor = "rgba(110, 231, 183, 0.87)";
    gradient = "radial-gradient(circle at 50% 30%, #6ee7b7 75%, #065f46 100%)";
  } else {
    gradient = "radial-gradient(circle at 56% 56%, #16162d 67%, #000 100%)";
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
          opacity: 1,
          background: gradient.length ? gradient : circleColor,
          boxShadow: "0 0 110px 40px #0002",
          transform: "translate(-50%,-50%)",
          zIndex: 999,
          animation: `theme-expand-fps 0.45s cubic-bezier(.84,-0.24,.36,1.16) forwards`
        }}
      />
      <style>
        {`
        @keyframes theme-expand-fps {
          0%   { width:0px; height:0px; opacity:1; filter: blur(0.1px);}
          20%  { width:${radius * 0.55}px; height:${radius * 0.55}px; opacity:1; filter: blur(0.15px);}
          60%  { width:${radius * 1.3}px; height:${radius * 1.3}px; opacity:1; filter: blur(0.25px);}
          75%  { width:${radius * 2.03}px; height:${radius * 2.03}px; opacity:1; filter: blur(0.35px);}
          87%  { width:${radius * 2.23}px; height:${radius * 2.23}px; opacity:0.97; filter: blur(0.6px);}
          95%  { width:${radius * 2.33}px; height:${radius * 2.33}px; opacity:0.4; filter: blur(1.3px);}
          100% { width:${radius * 2.35}px; height:${radius * 2.35}px; opacity:0; filter: blur(2.1px);}
        }
        `}
      </style>
    </div>
  );
};
