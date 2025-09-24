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
    { id: "Maharashtra", top: "58%", left: "39%", projects: 128 },
    { id: "Karnataka", top: "71%", left: "39.5%", projects: 82 },
    { id: "Tamil Nadu", top: "83%", left: "44%", projects: 64 },
    { id: "Kerala", top: "86%", left: "41%", projects: 39 },
    { id: "Gujarat", top: "46.5%", left: "33%", projects: 51 },
    { id: "Delhi", top: "31%", left: "42.7%", projects: 95 },
    { id: "West Bengal", top: "45.5%", left: "60%", projects: 74 },
    { id: "Uttar Pradesh", top: "35%", left: "47.5%", projects: 110 },
    { id: "Rajasthan", top: "35%", left: "37%", projects: 88 },
    { id: "Madhya Pradesh", top: "46.2%", left: "44%", projects: 67 },
    { id: "Andhra Pradesh", top: "70.5%", left: "45%", projects: 52 },
    { id: "Telangana", top: "61.5%", left: "45.5%", projects: 49 },
    { id: "Odisha", top: "53%", left: "55.5%", projects: 70 },
    { id: "Bihar", top: "38.5%", left: "57.5%", projects: 63 },
    { id: "Jharkhand", top: "45%", left: "55.8%", projects: 45 },
    { id: "Haryana", top: "29%", left: "41%", projects: 35 },
    { id: "Punjab", top: "23.5%", left: "40%", projects: 33 },
    { id: "Himachal Pradesh", top: "21%", left: "43%", projects: 29 },
    { id: "Uttarakhand", top: "26%", left: "46%", projects: 28 },
    { id: "Chhattisgarh", top: "53%", left: "50%", projects: 41 },
    { id: "Assam", top: "36%", left: "69%", projects: 55 },
    { id: "Meghalaya", top: "38.2%", left: "65%", projects: 19 },
  ];

  const hotspots = statesData && statesData.length ? statesData : defaultStates;

  function showTooltip(e, state) {
    const rect = containerRef.current.getBoundingClientRect();

    // Calculate the cursor position as percentages relative to container
    const leftPct = ((e.clientX - rect.left) / rect.width) * 100;
    const topPct = ((e.clientY - rect.top) / rect.height) * 100;

    // Add offset to push tooltip to the right
    const offsetX = 5; // percent to the right of cursor (adjust as needed)
    const offsetY = -2; // percent above cursor (adjust as needed)

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
