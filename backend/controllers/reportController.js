const Order = require('../models/order');

const reportController = {
  getMonthlySales: async (req, res) => {
    try {
      const currentDate = new Date();
      const month = parseInt(req.query.month) || (currentDate.getMonth() + 1);
      const year = parseInt(req.query.year) || currentDate.getFullYear();

      const summary = await Order.getMonthlySummary(month, year);
      const dailySales = await Order.getMonthlySales(month, year);
      const itemSales = await Order.getMonthlyItemSales(month, year);

      res.json({
        month,
        year,
        summary: {
          total_orders: summary.total_orders || 0,
          total_revenue: summary.total_revenue || 0
        },
        daily_sales: dailySales || [],
        item_sales: itemSales || []
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = reportController;
