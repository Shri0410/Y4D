import React, { useRef, useState } from "react";
import "./IndiaMapHover.css";
import map from "../assets/Imap.png";

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
    { id: "Maharashtra", top: "56%", left: "42%", projects: 128 },
    { id: "Karnataka", top: "68%", left: "41%", projects: 82 },
    { id: "Tamil Nadu", top: "76.5%", left: "45%", projects: 64 },
    { id: "Kerala", top: "79%", left: "42.5%", projects: 39 },
    { id: "Gujarat", top: "46.5%", left: "36%", projects: 51 },
    { id: "Delhi", top: "34%", left: "44.5%", projects: 95 },
    { id: "West Bengal", top: "47%", left: "58.5%", projects: 74 },
    { id: "Uttar Pradesh", top: "38%", left: "49%", projects: 110 },
    { id: "Rajasthan", top: "38%", left: "40%", projects: 88 },
    { id: "Madhya Pradesh", top: "47.5%", left: "45%", projects: 67 },
    { id: "Andhra Pradesh", top: "68%", left: "46%", projects: 52 },
    { id: "Telangana", top: "60%", left: "46.5%", projects: 49 },
    { id: "Odisha", top: "53%", left: "54.5%", projects: 70 },
    { id: "Bihar", top: "41%", left: "56%", projects: 63 },
    { id: "Jharkhand", top: "46%", left: "55%", projects: 45 },
    { id: "Haryana", top: "33%", left: "43%", projects: 35 },
    { id: "Punjab", top: "28.5%", left: "42%", projects: 33 },
    { id: "Himachal Pradesh", top: "26%", left: "44.5%", projects: 29 },
    { id: "Uttarakhand", top: "30%", left: "47%", projects: 28 },
    { id: "Chhattisgarh", top: "51%", left: "51%", projects: 41 },
    { id: "Assam", top: "38.4%", left: "65.5%", projects: 55 },
    { id: "Meghalaya", top: "40.4%", left: "64%", projects: 19 },
  ];

  const hotspots = statesData && statesData.length ? statesData : defaultStates;

  function showTooltip(e, state) {
    const rect = containerRef.current.getBoundingClientRect();

    const leftPct = ((e.clientX - rect.left) / rect.width) * 100;
    const topPct = ((e.clientY - rect.top) / rect.height) * 100;

    const offsetX = 5;
    const offsetY = -2;

    setTooltip({
      visible: true,
      state,
      left: `${leftPct + offsetX}%`,
      top: `${topPct + offsetY}%`,
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
    </div>
  );
}
