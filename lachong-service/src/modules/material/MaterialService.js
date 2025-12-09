const Material = require('../../models/model/Material');

exports.getAllMaterials = async (req, res) => {
    try {
        const materials = await Material.find();
        res.status(200).json({
            message: "Materials retrieved successfully.",
            materials
        });
    } catch (error) {
        console.error("Error getting all materials:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}