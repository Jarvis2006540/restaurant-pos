const db = require('./db');

const Setting = {
  get: async () => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM settings WHERE id = 1', [], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  update: async (settingsData) => {
    const { 
      shop_name, address, phone, gstin, upi_id, 
      payee_name, thank_you_note, visit_again_note 
    } = settingsData;

    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE settings SET 
          shop_name = COALESCE(?, shop_name),
          address = COALESCE(?, address),
          phone = COALESCE(?, phone),
          gstin = COALESCE(?, gstin),
          upi_id = COALESCE(?, upi_id),
          payee_name = COALESCE(?, payee_name),
          thank_you_note = COALESCE(?, thank_you_note),
          visit_again_note = COALESCE(?, visit_again_note),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 1`,
        [shop_name, address, phone, gstin, upi_id, payee_name, thank_you_note, visit_again_note],
        (err) => {
          if (err) reject(err);
          else {
            Setting.get().then(resolve).catch(reject);
          }
        }
      );
    });
  }
};

module.exports = Setting;
