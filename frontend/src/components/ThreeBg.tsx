import { useEffect, useRef, useMemo } from "react";

interface NetworkBackgroundProps {
  className?: string;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  connections: number[];
}

export const SpaceNetworkBackground = ({ className = "" }: NetworkBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const nodes = useMemo(() => {
    const nodeCount = 60;
    const initialNodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      initialNodes.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0003,
        vy: (Math.random() - 0.5) * 0.0003,
        connections: [],
      });
    }
    return initialNodes;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = window.innerWidth;
      const height = window.innerHeight;

      // Update node positions
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > 1) node.vx *= -1;
        if (node.y < 0 || node.y > 1) node.vy *= -1;

        node.x = Math.max(0, Math.min(1, node.x));
        node.y = Math.max(0, Math.min(1, node.y));
      });

      // Draw connections
      const connectionDistance = 0.18;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = (1 - distance / connectionDistance) * 0.15;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x * width, nodes[i].y * height);
            ctx.lineTo(nodes[j].x * width, nodes[j].y * height);
            ctx.strokeStyle = `hsla(200, 80%, 55%, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x * width, node.y * height, 2, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(200, 80%, 55%, 0.4)";
        ctx.fill();
      });

      // Draw colored accent dots
      const accentNodes = nodes.slice(0, 12);
      const colors = [
        "hsla(6, 85%, 62%, 0.6)",   // Primary coral
        "hsla(200, 80%, 55%, 0.6)", // Secondary blue
        "hsla(280, 60%, 65%, 0.6)", // Accent purple
        "hsla(150, 60%, 50%, 0.6)", // Green
        "hsla(45, 90%, 55%, 0.6)",  // Yellow
      ];

      accentNodes.forEach((node, i) => {
        ctx.beginPath();
        ctx.arc(node.x * width, node.y * height, 4 + (i % 3), 0, Math.PI * 2);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [nodes]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: -1 }}
    />
  );
};
