import { useState, useRef, useCallback, useEffect } from "react";

const AFFIRMATIONS = [
  "I love you michelle!",
  "You're the best!",
  "Keep going!",
  "I'm proud of you dummy.",
  "Still stressed?",
  "MWAHHHHH",
  "I hope you have a great day today!",
  "You're perfect dummy",
  "I love you no matter what.",
];

const COLORS = [
  "#b8964a",
  "#c97c7c",
  "#7ca3c9",
  "#7cb87c",
  "#a87cc9",
  "#c9b87c",
];
const SIZES = [2, 4, 6, 10, 16];
const SPARKS = ["✦", "·", "✧", "◦"];

const makeCSS = (dark) => `
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { height: 100%; max-height: 100%; overflow: hidden !important; }

  .ball-wrap {
    display: flex; align-items: center; justify-content: center;
    width: 180px; height: 180px; position: relative; cursor: pointer; user-select: none;
  }
  .ball {
    width: 140px; height: 140px; border-radius: 50%;
    background: ${
      dark
        ? "radial-gradient(circle at 38% 35%, #c9a87c, #8b5c2a)"
        : "radial-gradient(circle at 38% 35%, #e8c97a, #b8964a)"
    };
    box-shadow: ${
      dark
        ? "0 8px 32px rgba(0,0,0,0.5), inset 0 -6px 16px rgba(0,0,0,0.3), inset 0 6px 12px rgba(255,220,150,0.15)"
        : "0 8px 32px rgba(184,150,74,0.35), inset 0 -6px 16px rgba(100,70,0,0.15), inset 0 6px 12px rgba(255,255,200,0.3)"
    };
    transition: transform 0.08s ease, box-shadow 0.08s ease, border-radius 0.08s ease;
    display: flex; align-items: center; justify-content: center;
    flex-direction: column; gap: 4px;
  }
  .ball.squeezed {
    transform: scaleX(1.28) scaleY(0.75);
    border-radius: 50%;
    box-shadow: ${
      dark
        ? "0 2px 12px rgba(0,0,0,0.6), inset 0 -2px 8px rgba(0,0,0,0.4)"
        : "0 2px 12px rgba(184,150,74,0.2), inset 0 -2px 8px rgba(100,70,0,0.2)"
    };
  }
  .ball-label {
    font-family: 'Jost', sans-serif;
    font-size: 0.55rem; letter-spacing: 0.18em;
    text-transform: uppercase;
    color: ${dark ? "rgba(255,240,200,0.7)" : "rgba(80,50,0,0.6)"};
    pointer-events: none;
  }

  .canvas-wrap {
    position: relative; width: 100%; height: 100%;
    border-radius: 16px; overflow: hidden;
    background: ${dark ? "#1e1a16" : "#ffffff"};
    border: 1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(26,22,18,0.1)"};
    cursor: crosshair;
    transition: background 0.4s, border-color 0.4s;
  }
  .tool-btn {
    border: 1px solid ${
      dark ? "rgba(255,255,255,0.12)" : "rgba(26,22,18,0.12)"
    };
    background: ${dark ? "rgba(255,255,255,0.05)" : "#faf8f4"};
    border-radius: 8px; padding: 6px 12px;
    font-family: 'Jost', sans-serif; font-size: 0.6rem;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: ${dark ? "rgba(245,240,232,0.55)" : "#6b5c4e"};
    cursor: pointer; transition: all 0.2s;
  }
  .tool-btn:hover, .tool-btn.active {
    background: ${dark ? "#f5f0e8" : "#1a1612"};
    color: ${dark ? "#1a1612" : "#faf8f4"};
    border-color: ${dark ? "#f5f0e8" : "#1a1612"};
  }
  .color-dot {
    width: 18px; height: 18px; border-radius: 50%;
    cursor: pointer; border: 2px solid transparent;
    transition: transform 0.15s, border-color 0.15s;
    flex-shrink: 0;
  }
  .color-dot:hover { transform: scale(1.2); }
  .color-dot.selected { border-color: ${
    dark ? "#f5f0e8" : "#1a1612"
  }; transform: scale(1.15); }

  .affirmation-card {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(0.9rem, 1.6vw, 1.15rem);
    color: ${dark ? "rgba(245,240,232,0.75)" : "#6b5c4e"};
    text-align: center; max-width: 260px; line-height: 1.65;
    min-height: 52px;
    transition: color 0.4s;
    animation: affirmFade 0.5s ease both;
  }
  @keyframes affirmFade {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes sparkleOut {
    0%   { opacity: 1; transform: translate(0,0) scale(0.4) rotate(0deg); }
    100% { opacity: 0; transform: translate(var(--dx),var(--dy)) scale(1.2) rotate(var(--rot)); }
  }
`;

export default function HugHero({ dark }) {
  // — Ball —
  const [squeezed, setSqueezed] = useState(false);
  const [squeezeCount, setSqueezeCount] = useState(0);
  const [affirmIdx, setAffirmIdx] = useState(0);
  const [sparks, setSparks] = useState([]);
  const ballRef = useRef(null);
  const sparkId = useRef(0);
  const holdTimer = useRef(null);

  // — Doodle —
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPos = useRef(null);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[2]);
  const [tool, setTool] = useState("pen");

  // Re-init canvas bg when dark changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = dark ? "#1e1a16" : "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [dark]);

  const burst = useCallback(() => {
    if (!ballRef.current) return;
    const rect = ballRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const batch = Array.from({ length: 14 }, (_, i) => {
      const angle = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
      const dist = 70 + Math.random() * 100;
      return {
        id: sparkId.current++,
        char: SPARKS[Math.floor(Math.random() * SPARKS.length)],
        x: cx - 8,
        y: cy - 8,
        dx: `${Math.cos(angle) * dist}px`,
        dy: `${Math.sin(angle) * dist}px`,
        rot: `${Math.random() * 360}deg`,
        delay: i * 24,
      };
    });
    setSparks((s) => [...s, ...batch]);
    setTimeout(
      () =>
        setSparks((s) => s.filter((sp) => !batch.find((b) => b.id === sp.id))),
      1000
    );
  }, []);

  const pressBall = useCallback(() => {
    setSqueezed(true);
  }, []);

  const releaseBall = useCallback(() => {
    if (!squeezed) return;
    setSqueezed(false);
    setSqueezeCount((n) => {
      const next = n + 1;
      return next;
    });
    setAffirmIdx((i) => (i + 1) % AFFIRMATIONS.length);
    burst();
  }, [squeezed, burst]);

  // — Canvas helpers —
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * (canvas.width / rect.width),
      y: (src.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDraw = useCallback(
    (e) => {
      e.preventDefault();
      drawing.current = true;
      const pos = getPos(e, canvasRef.current);
      lastPos.current = pos;
      const ctx = canvasRef.current.getContext("2d");
      ctx.beginPath();
      ctx.arc(
        pos.x,
        pos.y,
        (tool === "eraser" ? size * 3 : size) / 2,
        0,
        Math.PI * 2
      );
      ctx.fillStyle =
        tool === "eraser" ? (dark ? "#1e1a16" : "#ffffff") : color;
      ctx.fill();
    },
    [color, size, tool, dark]
  );

  const draw = useCallback(
    (e) => {
      e.preventDefault();
      if (!drawing.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const pos = getPos(e, canvas);
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle =
        tool === "eraser" ? (dark ? "#1e1a16" : "#ffffff") : color;
      ctx.lineWidth = tool === "eraser" ? size * 3 : size;
      ctx.lineCap = ctx.lineJoin = "round";
      ctx.stroke();
      lastPos.current = pos;
    },
    [color, size, tool, dark]
  );

  const stopDraw = useCallback(() => {
    drawing.current = false;
    lastPos.current = null;
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = dark ? "#1e1a16" : "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvas = () => {
    const link = document.createElement("a");
    link.download = "hugger-doodle.png";
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const T = {
    bg: dark ? "#12100e" : "#faf8f4",
    text: dark ? "#f5f0e8" : "#1a1612",
    sub: dark ? "rgba(245,240,232,0.45)" : "#6b5c4e",
    divider: dark ? "rgba(255,255,255,0.08)" : "rgba(26,22,18,0.08)",
    gold: "#b8964a",
  };

  return (
    <>
      <style key={dark}>{makeCSS(dark)}</style>

      {sparks.map((sp) => (
        <div
          key={sp.id}
          style={{
            position: "fixed",
            left: sp.x,
            top: sp.y,
            fontSize: 13,
            color: T.gold,
            pointerEvents: "none",
            zIndex: 9999,
            "--dx": sp.dx,
            "--dy": sp.dy,
            "--rot": sp.rot,
            animation: `sparkleOut 0.9s ${sp.delay}ms ease forwards`,
          }}
        >
          {sp.char}
        </div>
      ))}

      <main
        style={{
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          background: T.bg,
          paddingTop: 80,
          transition: "background 0.4s",
        }}
      >
        {/* ── LEFT: Squeeze Ball ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 48px 32px",
            borderRight: `1px solid ${T.divider}`,
            gap: 0,
          }}
        >
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 400,
              fontSize: "clamp(1.8rem, 3.5vw, 3rem)",
              color: T.text,
              marginBottom: 8,
              textAlign: "center",
              transition: "color 0.4s",
            }}
          >
            SQUEEZE ME!
          </h1>

          {/* Ball */}
          <div
            className="ball-wrap"
            ref={ballRef}
            onMouseDown={pressBall}
            onMouseUp={releaseBall}
            onTouchStart={pressBall}
            onTouchEnd={releaseBall}
          >
            <div className={`ball ${squeezed ? "squeezed" : ""}`}>
              <span
                style={{ fontSize: 32, lineHeight: 1, pointerEvents: "none" }}
              ></span>
              <span className="ball-label">
                {squeezed ? "squeezing..." : "SQUEEZE"}
              </span>
            </div>
          </div>

          {/* Affirmation */}
          <div
            style={{
              marginTop: 32,
              minHeight: 64,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            {squeezeCount > 0 && (
              <p key={affirmIdx} className="affirmation-card">
                "{AFFIRMATIONS[affirmIdx]}"
              </p>
            )}
            {squeezeCount > 0 && (
              <p
                style={{
                  fontFamily: "'Jost', sans-serif",
                  fontSize: "0.58rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: dark ? "rgba(245,240,232,0.2)" : "rgba(26,22,18,0.2)",
                }}
              >
                {squeezeCount} {squeezeCount === 1 ? "squeeze" : "squeezes"}
              </p>
            )}
          </div>
        </div>

        {/* ── RIGHT: Doodle ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "16px 32px 24px",
            gap: 10,
          }}
        >
          {/* Toolbar top */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <p
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "0.58rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: dark ? "rgba(245,240,232,0.3)" : "rgba(26,22,18,0.3)",
              }}
            >
              Draw it out
            </p>

            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["pen", "eraser"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTool(t)}
                  className={`tool-btn ${tool === t ? "active" : ""}`}
                >
                  {t === "pen" ? "✏ Pen" : "◻ Erase"}
                </button>
              ))}
              <button className="tool-btn" onClick={clearCanvas}>
                ✕ Clear
              </button>
              <button className="tool-btn" onClick={saveCanvas}>
                ↓ Save
              </button>
            </div>
          </div>

          {/* Colors + sizes */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
              {COLORS.map((c) => (
                <div
                  key={c}
                  className={`color-dot ${
                    color === c && tool === "pen" ? "selected" : ""
                  }`}
                  style={{ background: c }}
                  onClick={() => {
                    setColor(c);
                    setTool("pen");
                  }}
                />
              ))}
            </div>
            <div
              style={{
                width: 1,
                height: 18,
                background: dark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(26,22,18,0.12)",
              }}
            />
            <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
              {SIZES.map((s) => (
                <div
                  key={s}
                  onClick={() => setSize(s)}
                  style={{
                    width: Math.max(s * 2, 8),
                    height: Math.max(s * 2, 8),
                    borderRadius: "50%",
                    background:
                      size === s
                        ? dark
                          ? "#f5f0e8"
                          : "#1a1612"
                        : dark
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(26,22,18,0.2)",
                    cursor: "pointer",
                    transition: "background 0.2s",
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className="canvas-wrap" style={{ flex: 1 }}>
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              style={{ width: "100%", height: "100%", display: "block" }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
          </div>
        </div>
      </main>
    </>
  );
}
