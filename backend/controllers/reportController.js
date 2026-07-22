const Order = require('../models/order');

const reportController = {
  getMonthlySales: async (req, res) => {
    try {
      const currentDate = new Date();
      const month = parseInt(req.query.month) || (currentDate.getMonth() + 1);
      const year = parseInt(req.query.year) || currentDate.getFullYear();

      const [summary, dailySales, itemSales] = await Promise.all([
        Order.getMonthlySummary(month, year),
        Order.getMonthlySales(month, year),
        Order.getMonthlyItemSales(month, year),
      ]);

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
