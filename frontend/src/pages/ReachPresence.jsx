// src/pages/ReachPresence.jsx
import React, { useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Tooltip as ReactTooltip } from "react-tooltip";
import "./ReachPresence.css";

const geoUrl =
  "https://raw.githubusercontent.com/iamspruce/search-filter-painate-reactjs/main/data/india_states.topo.json";

// Example project data
const stateProjects = {
  Maharashtra: ["Education Drive", "Healthcare Program"],
  Gujarat: ["Skill Development", "Women Empowerment"],
  Karnataka: ["Digital Literacy"],
  Delhi: ["Child Welfare", "Food Distribution"],
};

const ReachPresence = () => {
  const [tooltipContent, setTooltipContent] = useState("");

  return (
    <div className="page-container">
      <section className="section">
        <div className="container">
          <h2 className="section-title">Reach and Presence</h2>
          <div className="reach-content">
            <p>
              Information about Y4D's impact, geographical reach, and journey
              over the years.
            </p>
          </div>

          {/* Map Section */}
          <div className="map-container">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 1200,
                center: [80, 22], // center on India
              }}
              width={800}
              height={600}
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const stateName = geo.properties.st_nm;
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        data-tooltip-id="india-map-tooltip"
                        data-tooltip-content={
                          stateProjects[stateName]
                            ? `${stateName}: ${stateProjects[stateName].join(
                                ", "
                              )}`
                            : `${stateName}: No projects yet`
                        }
                        style={{
                          default: { fill: "#D6D6DA", outline: "none" },
                          hover: { fill: "#4CAF50", outline: "none" },
                          pressed: { fill: "#2E7D32", outline: "none" },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>

            {/* Tooltip */}
            <ReactTooltip id="india-map-tooltip" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReachPresence;
