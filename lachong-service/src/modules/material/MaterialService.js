const Material = require('../../models/model/Material');

exports.getAllMaterials = async (req, res) => {
    try {
        const materials = await Material.find({ status: true });
        res.status(200).json({
            message: "Materials retrieved successfully.",
            materials
        });
    } catch (error) {
        console.error("Error getting all materials:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.getMaterials = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const role = req.user?.role;

        if (role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Admins only." });
        }

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

exports.createMaterial = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const role = req.user?.role;
        if (role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Admins only." });
        }

        const { name, description } = req.body;
        const newMaterial = new Material({
            name,
            description,
        });
        await newMaterial.save();

        res.status(201).json({
            message: "Material created successfully.",
            material: newMaterial
        });
    } catch (error) {
        console.error("Error creating material:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}

exports.updateStatusMaterial = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const role = req.user?.role;
        if (role !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Admins only." });
        }

        const { id } = req.params;
        const { status } = req.body;

        const material = await Material.findById(id);
        if (!material) {
            return res.status(404).json({ message: "Material not found." });
        }

        material.status = status;
        await material.save();

        res.status(200).json({
            message: "Material status updated successfully.",
            material
        });
    } catch (error) {
        console.error("Error updating material status:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}