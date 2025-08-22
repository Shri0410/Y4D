// src/pages/OurWork.jsx
import React, { useState } from 'react';

const OurWork = () => {
  const [activeIntervention, setActiveIntervention] = useState('education');

  const interventions = [
    {
      id: 'education',
      title: 'Quality Education',
      programs: ['Program 1', 'Program 2', 'Program 3']
    },
    {
      id: 'livelihood',
      title: 'Livelihood',
      programs: ['Program 1', 'Program 2', 'Program 3']
    },
    {
      id: 'healthcare',
      title: 'Healthcare',
      programs: ['Program 1', 'Program 2', 'Program 3']
    },
    {
      id: 'environment',
      title: 'Environment Sustainability',
      programs: ['Program 1', 'Program 2', 'Program 3']
    },
    {
      id: 'idp',
      title: 'Integrated Development Program (IDP)',
      programs: ['Program 1', 'Program 2', 'Program 3']
    }
  ];

  return (
    <div className="our-work-page">
      <section className="section">
        <div className="container">
          <h2 className="section-title">Our Work</h2>
          
          <div className="intervention-tabs">
            <div className="tab-headers">
              {interventions.map(intervention => (
                <button
                  key={intervention.id}
                  className={activeIntervention === intervention.id ? 'active' : ''}
                  onClick={() => setActiveIntervention(intervention.id)}
                >
                  {intervention.title}
                </button>
              ))}
            </div>
            
            <div className="tab-content">
              <h3>{interventions.find(i => i.id === activeIntervention).title}</h3>
              <div className="programs-grid">
                {interventions
                  .find(i => i.id === activeIntervention)
                  .programs.map((program, index) => (
                    <div key={index} className="program-card">
                      <h4>{program}</h4>
                      <p>Description of the program and its impact.</p>
                      <button className="btn">Learn More</button>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OurWork;