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
        // Fallback: If no users exist (due to serverless async race conditions), create the admin user
        db.get('SELECT COUNT(*) as count FROM users', (countErr, countRow) => {
          if (!countErr && countRow && countRow.count === 0 && username === 'admin' && password === 'admin123') {
            db.run("INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin')", (insertErr) => {
              if (insertErr) {
                return res.status(500).json({ error: insertErr.message });
              }
              // Immediately log them in
              const token = Buffer.from(`1:admin:${Date.now()}`).toString('base64');
              return res.json({
                token,
                user: { id: 1, username: 'admin', role: 'admin' }
              });
            });
            return;
          }
          return res.status(401).json({ error: 'Invalid credentials' });
        });
        return;
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
