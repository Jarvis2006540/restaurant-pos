const Setting = require('../models/setting');

const settingController = {
  getSettings: async (req, res) => {
    try {
      const settings = await Setting.get();
      if (!settings) {
        return res.status(404).json({ error: 'Settings not found' });
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateSettings: async (req, res) => {
    try {
      const updatedSettings = await Setting.update(req.body);
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = settingController;
