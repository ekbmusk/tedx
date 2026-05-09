"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export function QrDisplay({ value, size = 320 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "H",
    });
  }, [value, size]);

  return (
    <div className="inline-flex flex-col items-center rounded-2xl bg-white p-5">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
