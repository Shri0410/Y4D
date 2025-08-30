import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE}/media/published/events`);
      // Sort events by date (most recent first)
      const sortedEvents = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEvents(sortedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
    setLoading(false);
  };

  const openEventModal = (event) => {
    setSelectedEvent(event);
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Time TBD';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="loading">Loading events...</div>;

  return (
    <div className="events-page">
      <div className="page-header">
        <h1>Upcoming Events</h1>
        <p>Join us for workshops, seminars, and community gatherings</p>
      </div>

      <div className="events-grid">
        {events.length === 0 ? (
          <div className="empty-state">
            <p>No upcoming events at the moment</p>
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className="event-card">
              {event.image && (
                <div className="event-image">
                  <img 
                    src={`${API_BASE}/uploads/media/events/${event.image}`} 
                    alt={event.title}
                    onError={(e) => {
                      e.target.src = '/placeholder-event.jpg';
                    }}
                  />
                </div>
              )}
              <div className="event-content">
                <h3>{event.title}</h3>
                <p className="event-description">
                  {event.description}
                </p>
                <div className="event-details">
                  <div className="event-date">
                    <strong>Date:</strong> {formatDate(event.date)}
                  </div>
                  {event.time && (
                    <div className="event-time">
                      <strong>Time:</strong> {formatTime(event.time)}
                    </div>
                  )}
                  {event.location && (
                    <div className="event-location">
                      <strong>Location:</strong> {event.location}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => openEventModal(event)}
                  className="btn-event-details"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Event Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={closeEventModal}>
          <div className="modal-content event-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedEvent.title}</h2>
              <button onClick={closeEventModal} className="close-btn">&times;</button>
            </div>
            <div className="modal-body">
              {selectedEvent.image && (
                <div className="modal-image">
                  <img 
                    src={`${API_BASE}/uploads/media/events/${selectedEvent.image}`} 
                    alt={selectedEvent.title}
                  />
                </div>
              )}
              <div className="event-full-details">
                <div className="detail-row">
                  <strong>Date:</strong> {formatDate(selectedEvent.date)}
                </div>
                {selectedEvent.time && (
                  <div className="detail-row">
                    <strong>Time:</strong> {formatTime(selectedEvent.time)}
                  </div>
                )}
                {selectedEvent.location && (
                  <div className="detail-row">
                    <strong>Location:</strong> {selectedEvent.location}
                  </div>
                )}
                <div className="event-description-full">
                  {selectedEvent.description}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;