import warehouseService from "./warehouse.service.js";

const createWarehouse = async (req, res) => {
    try {
        const { warehouseData, managerData } = req.body;

        if (!warehouseData || !managerData) {
            return res.status(400).json({ error: "Warehouse Data and Manager Data are required" });
        }

        const result = await warehouseService.createWarehouseWithManager(warehouseData, managerData);
        
        res.status(201).json({ 
            message: "Warehouse and Manager created successfully", 
            data: result 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllWarehouse = async (req, res) => {
    try {
        const result = await warehouseService.getAllWarehouse();
        res.status(200).json({
            message: "Data Of all Warehouse",
            data: result
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateWarehouse = async (req, res) => {
    try {
        const result = await warehouseService.updateWarehouse(req.params.id, req.body);
        if (!result) {
            return res.status(404).json({ error: "Warehouse not found" });
        }
        res.status(200).json({
            message: "Warehouse updated successfully",
            data: result
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteWarehouse = async (req, res) => {
    try {
        const result = await warehouseService.deleteWarehouse(req.params.id);
        if (!result) {
            return res.status(404).json({ error: "Warehouse not found" });
        }
        res.status(200).json({
            message: "Warehouse deleted successfully",
            data: result
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getWarehouseById = async (req, res) => {
    try {
        const result = await warehouseService.getWarehouseById(req.params.id);
        if (!result) {
            return res.status(404).json({ error: "Warehouse not found" });
        }
        res.status(200).json({
            message: "Warehouse details fetched successfully",
            data: result
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export default { createWarehouse, getAllWarehouse, updateWarehouse, deleteWarehouse, getWarehouseById };
