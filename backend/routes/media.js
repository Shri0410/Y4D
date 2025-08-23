const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../config/database');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const type = req.params.type;
    cb(null, `uploads/media/${type}/`);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Get all items for a specific media type
router.get('/:type', (req, res) => {
  const { type } = req.params;
  const validTypes = ['newsletters', 'stories', 'events', 'blogs', 'documentaries'];
  
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid media type' });
  }
  
  const query = `SELECT * FROM ${type} ORDER BY created_at DESC`;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get single item for a specific media type
router.get('/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const validTypes = ['newsletters', 'stories', 'events', 'blogs', 'documentaries'];
  
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid media type' });
  }
  
  const query = `SELECT * FROM ${type} WHERE id = ?`;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(results[0]);
  });
});

// Create item for a specific media type
router.post('/:type', upload.single('file'), (req, res) => {
  const { type } = req.params;
  const validTypes = ['newsletters', 'stories', 'events', 'blogs', 'documentaries'];
  
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid media type' });
  }
  
  let query, values;
  
  switch (type) {
    case 'newsletters':
      const { title, content, published_date } = req.body;
      const file_path = req.file ? req.file.filename : null;
      query = 'INSERT INTO newsletters (title, content, file_path, published_date) VALUES (?, ?, ?, ?)';
      values = [title, content, file_path, published_date];
      break;
      
    case 'stories':
      const { title: storyTitle, content: storyContent, author, published_date: storyDate } = req.body;
      const image = req.file ? req.file.filename : null;
      query = 'INSERT INTO stories (title, content, image, author, published_date) VALUES (?, ?, ?, ?, ?)';
      values = [storyTitle, storyContent, image, author, storyDate];
      break;
      
    case 'events':
      const { title: eventTitle, description, date, time, location } = req.body;
      const eventImage = req.file ? req.file.filename : null;
      query = 'INSERT INTO events (title, description, date, time, location, image) VALUES (?, ?, ?, ?, ?, ?)';
      values = [eventTitle, description, date, time, location, eventImage];
      break;
      
    case 'blogs':
      const { title: blogTitle, content: blogContent, author: blogAuthor, tags, published_date: blogDate } = req.body;
      const blogImage = req.file ? req.file.filename : null;
      const tagsJson = tags ? JSON.parse(tags) : null;
      query = 'INSERT INTO blogs (title, content, author, image, tags, published_date) VALUES (?, ?, ?, ?, ?, ?)';
      values = [blogTitle, blogContent, blogAuthor, blogImage, JSON.stringify(tagsJson), blogDate];
      break;
      
    case 'documentaries':
      const { title: docTitle, description: docDescription, video_url, duration, published_date: docDate } = req.body;
      const thumbnail = req.file ? req.file.filename : null;
      query = 'INSERT INTO documentaries (title, description, video_url, thumbnail, duration, published_date) VALUES (?, ?, ?, ?, ?, ?)';
      values = [docTitle, docDescription, video_url, thumbnail, duration, docDate];
      break;
  }
  
  db.query(query, values, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ 
      id: results.insertId, 
      message: `${type.slice(0, -1)} created successfully`
    });
  });
});

// Update item for a specific media type
router.put('/:type/:id', upload.single('file'), (req, res) => {
  const { type, id } = req.params;
  const validTypes = ['newsletters', 'stories', 'events', 'blogs', 'documentaries'];
  
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid media type' });
  }
  
  // Check if item exists
  const checkQuery = `SELECT * FROM ${type} WHERE id = ?`;
  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    let query, values;
    const existingItem = results[0];
    
    switch (type) {
      case 'newsletters':
        const { title, content, published_date } = req.body;
        let file_path = existingItem.file_path;
        if (req.file) {
          file_path = req.file.filename;
        }
        query = 'UPDATE newsletters SET title = ?, content = ?, file_path = ?, published_date = ? WHERE id = ?';
        values = [title, content, file_path, published_date, id];
        break;
        
      case 'stories':
        const { title: storyTitle, content: storyContent, author, published_date: storyDate } = req.body;
        let image = existingItem.image;
        if (req.file) {
          image = req.file.filename;
        }
        query = 'UPDATE stories SET title = ?, content = ?, image = ?, author = ?, published_date = ? WHERE id = ?';
        values = [storyTitle, storyContent, image, author, storyDate, id];
        break;
        
      case 'events':
        const { title: eventTitle, description, date, time, location } = req.body;
        let eventImage = existingItem.image;
        if (req.file) {
          eventImage = req.file.filename;
        }
        query = 'UPDATE events SET title = ?, description = ?, date = ?, time = ?, location = ?, image = ? WHERE id = ?';
        values = [eventTitle, description, date, time, location, eventImage, id];
        break;
        
      case 'blogs':
        const { title: blogTitle, content: blogContent, author: blogAuthor, tags, published_date: blogDate } = req.body;
        let blogImage = existingItem.image;
        if (req.file) {
          blogImage = req.file.filename;
        }
        const tagsJson = tags ? JSON.parse(tags) : existingItem.tags;
        query = 'UPDATE blogs SET title = ?, content = ?, author = ?, image = ?, tags = ?, published_date = ? WHERE id = ?';
        values = [blogTitle, blogContent, blogAuthor, blogImage, JSON.stringify(tagsJson), blogDate, id];
        break;
        
      case 'documentaries':
        const { title: docTitle, description: docDescription, video_url, duration, published_date: docDate } = req.body;
        let thumbnail = existingItem.thumbnail;
        if (req.file) {
          thumbnail = req.file.filename;
        }
        query = 'UPDATE documentaries SET title = ?, description = ?, video_url = ?, thumbnail = ?, duration = ?, published_date = ? WHERE id = ?';
        values = [docTitle, docDescription, video_url, thumbnail, duration, docDate, id];
        break;
    }
    
    db.query(query, values, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: `${type.slice(0, -1)} updated successfully` });
    });
  });
});

// Delete item for a specific media type
router.delete('/:type/:id', (req, res) => {
  const { type, id } = req.params;
  const validTypes = ['newsletters', 'stories', 'events', 'blogs', 'documentaries'];
  
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid media type' });
  }
  
  const query = `DELETE FROM ${type} WHERE id = ?`;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: `${type.slice(0, -1)} deleted successfully` });
  });
});

module.exports = router;