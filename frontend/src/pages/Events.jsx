// src/pages/Events.jsx
import React, { useState, useEffect } from 'react';
import { getEvents } from '../services/api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await getEvents();
        // Sort events by date (newest first)
        const sortedEvents = eventsData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setEvents(sortedEvents);
      } catch (err) {
        setError('Failed to load events. Please try again later.');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const filterEvents = () => {
    const now = new Date();
    switch (filter) {
      case 'upcoming':
        return events.filter(event => new Date(event.date) >= now);
      case 'past':
        return events.filter(event => new Date(event.date) < now);
      default:
        return events;
    }
  };

  const filteredEvents = filterEvents();

  if (loading) return <div className="page-container"><div className="loading">Loading events...</div></div>;
  if (error) return <div className="page-container"><div className="error-message">{error}</div></div>;

  return (
    <div className="page-container">
      <section className="section">
        <div className="container">
          <h2 className="section-title">Events</h2>
          <p className="section-description">
            Join us in our mission through various events, workshops, and community programs.
          </p>
          
          {/* Filter buttons */}
          <div className="event-filters">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All Events
            </button>
            <button 
              className={filter === 'upcoming' ? 'active' : ''}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming Events
            </button>
            <button 
              className={filter === 'past' ? 'active' : ''}
              onClick={() => setFilter('past')}
            >
              Past Events
            </button>
          </div>
          
          {filteredEvents.length === 0 ? (
            <div className="no-data">
              <p>No {filter} events available at the moment. Please check back later.</p>
            </div>
          ) : (
            <div className="events-grid">
              {filteredEvents.map(event => (
                <div key={event.id} className="event-card">
                  {event.image && (
                    <div className="event-image">
                      <img 
                        src={`http://localhost:5000/uploads/media/events/${event.image}`} 
                        alt={event.title}
                      />
                    </div>
                  )}
                  <div className="event-content">
                    <h3>{event.title}</h3>
                    <div className="event-details">
                      <p className="event-date">
                        <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
                        {event.time && ` • ${event.time}`}
                      </p>
                      {event.location && (
                        <p className="event-location">
                          <strong>Location:</strong> {event.location}
                        </p>
                      )}
                    </div>
                    <div className="event-description">
                      {event.description}
                    </div>
                    <button className="btn">Learn More</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Events;