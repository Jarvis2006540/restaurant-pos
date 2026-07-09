const db = require('../models/db');

const authController = {
  login: (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (!row) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Simple token for basic auth (in production use JWT)
      const token = Buffer.from(`${row.id}:${row.username}:${Date.now()}`).toString('base64');
      
      res.json({
        token,
        user: {
          id: row.id,
          username: row.username,
          role: row.role
        }
      });
    });
  }
};

module.exports = authController;
