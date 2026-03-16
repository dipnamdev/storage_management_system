import commodityService from "./commodity.service.js";

const createCommodity = async (req, res) => {
  try {
    const { commodityData, priceData } = req.body;

    if (!commodityData?.name || !priceData?.financial_year || !priceData?.price_per_unit) {
      return res.status(400).json({ error: "Provide valid commodity name, financial_year, and price_per_unit" });
    }

    const userId = req.user ? req.user.id : null;

    const result = await commodityService.createCommodityWithPrice(
      commodityData,
      priceData,
      userId
    );

    res.status(201).json({
      message: "Commodity and Price recorded successfully",
      data: result,
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllCommodity = async (req, res) => {
  try {
    const result = await commodityService.getAllCommodity();
    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCommodity = async (req, res) => {
  try {
    const commodityId = req.params.id;
    const { name, financial_year, price_per_unit } = req.body;
    const userId = req.user.id;

    const result = await commodityService.updateCommodity(
      commodityId,
      name,
      financial_year,
      price_per_unit,
      userId
    );

    res.json({
      message: "Commodity updated successfully",
      data: result,
    });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteCommodity = async (req, res) => {
  try {
    const commodityId = req.params.id;

    await commodityService.deleteCommodity(commodityId);

    res.json({ message: "Commodity deleted successfully" });

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export default {
  createCommodity,
  getAllCommodity,
  updateCommodity,
  deleteCommodity,
};