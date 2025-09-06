import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Events.css"; // new CSS file

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const API_BASE = "http://localhost:5000/api";

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE}/media/published/events`);
      // Sort by most recent
      const sortedEvents = response.data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setEvents(sortedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const openEventModal = (event) => setSelectedEvent(event);
  const closeEventModal = () => setSelectedEvent(null);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = (timeString) => {
    if (!timeString) return "Time TBD";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading)
    return (
      <div className="ev-page">
        <div className="ev-loading">Loading events...</div>
      </div>
    );

  return (
    <div className="ev-page">
      <section className="ev-section">
        <div className="ev-container">
          <div className="ev-header">
            <h1 className="ev-title">
              Upcoming Events <span></span>
            </h1>
            <p className="ev-subtitle">
              Join us for workshops, seminars, and community gatherings
            </p>
          </div>

          <div className="ev-grid">
            {events.length === 0 ? (
              <div className="ev-empty">
                <h3>No upcoming events at the moment</h3>
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="ev-card">
                  {event.image && (
                    <div className="ev-card-image">
                      <img
                        src={`${API_BASE}/uploads/media/events/${event.image}`}
                        alt={event.title}
                        onError={(e) => {
                          e.target.src = "/placeholder-event.jpg";
                        }}
                      />
                    </div>
                  )}

                  <div className="ev-card-body">
                    <h2 className="ev-card-title">{event.title}</h2>
                    <p className="ev-card-desc">{event.description}</p>

                    <div className="ev-card-meta">
                      <div>
                        <strong>Date:</strong> {formatDate(event.date)}
                      </div>
                      {event.time && (
                        <div>
                          <strong>Time:</strong> {formatTime(event.time)}
                        </div>
                      )}
                      {event.location && (
                        <div>
                          <strong>Location:</strong> {event.location}
                        </div>
                      )}
                    </div>

                    <div className="ev-card-footer">
                      <button
                        onClick={() => openEventModal(event)}
                        className="ev-read-more"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedEvent && (
        <div className="ev-modal-overlay" onClick={closeEventModal}>
          <div
            className="ev-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ev-modal-header">
              <h2>{selectedEvent.title}</h2>
              <button onClick={closeEventModal} className="ev-close-btn">
                &times;
              </button>
            </div>
            <div className="ev-modal-body">
              {selectedEvent.image && (
                <div className="ev-modal-image">
                  <img
                    src={`${API_BASE}/uploads/media/events/${selectedEvent.image}`}
                    alt={selectedEvent.title}
                  />
                </div>
              )}
              <div className="ev-modal-meta">
                <div>
                  <strong>Date:</strong> {formatDate(selectedEvent.date)}
                </div>
                {selectedEvent.time && (
                  <div>
                    <strong>Time:</strong> {formatTime(selectedEvent.time)}
                  </div>
                )}
                {selectedEvent.location && (
                  <div>
                    <strong>Location:</strong> {selectedEvent.location}
                  </div>
                )}
              </div>
              <div className="ev-full-content">
                <p>{selectedEvent.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
