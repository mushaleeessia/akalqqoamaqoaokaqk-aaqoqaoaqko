
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

  let gradient = "";
  if (toTheme === "light") {
    gradient = "radial-gradient(circle at 60% 40%, #fffbe9 75%, #fff3a8 100%)";
  } else if (toTheme === "system") {
    gradient = "radial-gradient(circle at 50% 30%, #8af7cd 80%, #047857 100%)";
  } else {
    gradient = "radial-gradient(circle at 56% 56%, #262646 70%, #000 100%)";
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] transition-all duration-300"
      style={{}}
      aria-hidden="true"
      data-testid="theme-overlay"
    >
      <div
        className="
          rounded-full
          fixed
          pointer-events-none
          will-change-[width,height,opacity,left,top]
          transition-all
        "
        style={{
          width: 0,
          height: 0,
          left: origin.x,
          top: origin.y,
          opacity: 1,
          background: gradient,
          boxShadow: "0 0 110px 40px #0008", // Mais forte para cobrir tudo
          transform: "translate(-50%,-50%)",
          zIndex: 9999,
          animation: `theme-expand-auto 0.32s cubic-bezier(.78,-0.31,.32,1.14) forwards`
        }}
      />
      <style>
        {`
          @keyframes theme-expand-auto {
            0%   { width:0px; height:0px; opacity:1; filter: blur(0.1px);}
            53%  { width:${radius * 1.1}px; height:${radius * 1.1}px; opacity:1; filter: blur(0.15px);}
            80%  { width:${radius * 2.18}px; height:${radius * 2.18}px; opacity:1; filter: blur(0.38px);}
            91%  { width:${radius * 2.65}px; height:${radius * 2.65}px; opacity:0.97; filter: blur(0.8px);}
            98%  { width:${radius * 2.83}px; height:${radius * 2.83}px; opacity:0.75; filter: blur(1.9px);}
            100% { width:${radius * 2.89}px; height:${radius * 2.89}px; opacity:0; filter: blur(2.8px);}
          }
        `}
      </style>
    </div>
  );
};
