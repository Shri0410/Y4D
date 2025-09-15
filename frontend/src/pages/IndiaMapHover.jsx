import React, { useRef, useState } from "react";
import "./IndiaMapHover.css";
import map from "../assets/map.png";

export default function IndiaMapHover({ mapUrl = map, statesData }) {
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState({
    visible: false,
    state: null,
    left: "50%",
    top: "50%",
  });

  // fallback example data for a few states. coordinates are percentages relative to the image container.
  const defaultStates = [
    { id: "Maharashtra", top: "60%", left: "44%", projects: 128 },
    { id: "Karnataka", top: "67%", left: "46%", projects: 82 },
    { id: "Tamil Nadu", top: "80%", left: "55%", projects: 64 },
    { id: "Kerala", top: "78%", left: "48%", projects: 39 },
    { id: "Gujarat", top: "47%", left: "30%", projects: 51 },
    { id: "Delhi", top: "29%", left: "64%", projects: 95 },
    { id: "West Bengal", top: "42%", left: "82%", projects: 74 },
    { id: "Uttar Pradesh", top: "34%", left: "63%", projects: 110 },
  ];

  const hotspots = statesData && statesData.length ? statesData : defaultStates;

  function showTooltip(e, state) {
    const rect = containerRef.current.getBoundingClientRect();
    // position relative to container using percentages so it stays responsive
    const leftPct = ((e.clientX - rect.left) / rect.width) * 100;
    const topPct = ((e.clientY - rect.top) / rect.height) * 100;

    setTooltip({
      visible: true,
      state,
      left: `${leftPct}%`,
      top: `${topPct}%`,
    });
  }

  function hideTooltip() {
    setTooltip((t) => ({ ...t, visible: false }));
  }

  return (
    <div className="india-map-wrapper">
      <div
        className="map-container"
        ref={containerRef}
        style={{ backgroundImage: `url(${mapUrl})` }}
        role="img"
        aria-label="Map of India with project hotspots"
      >
        {hotspots.map((s) => (
          <button
            key={s.id}
            className="hotspot"
            style={{ top: s.top, left: s.left }}
            onMouseEnter={(e) => showTooltip(e, s)}
            onFocus={(e) => showTooltip(e, s)}
            onMouseLeave={hideTooltip}
            onBlur={hideTooltip}
            aria-label={`${s.id} projects: ${s.projects}`}
          >
            <span className={`${s.id.toLowerCase().replace(/\s/g, "-")}-dot`} />
          </button>
        ))}

        {tooltip.visible && tooltip.state && (
          <div
            className="tooltip-box"
            style={{ left: tooltip.left, top: tooltip.top }}
          >
            <div className="tooltip-title">{tooltip.state.id}</div>
            <div className="tooltip-body">
              Projects completed: <strong>{tooltip.state.projects}</strong>
            </div>
          </div>
        )}
      </div>

      <div className="legend">
        <strong>Legend</strong>
        <div className="legend-row">
          <span className="legend-dot" /> Hotspot
        </div>
        <div className="hint">
          Tip: adjust positions (top/left) in percent to fine tune placement.
        </div>
      </div>
    </div>
  );
}
