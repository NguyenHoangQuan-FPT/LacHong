const TyPeStore = require('../../models/model/TypeStore');


exports.getAllTypeStores = async (req, res) => {
    try {
        const typeStores = await TyPeStore.find();
        res.status(200).json(typeStores);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

exports.getTypeStoreTrue = async (req, res) => {
    try {
        const typeStores = await TyPeStore.find({ status: true });
        res.status(200).json(typeStores);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

exports.createTypeStore = async (req, res) => {
    try {
        const accountId = req.user.id;
        if (!accountId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const role = req.user.role;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admins only.' });
        }

        const { typeName, description } = req.body;
        const newTypeStore = new TyPeStore({
            typeName,
            description
        });
        await newTypeStore.save();

        res.status(201).json({ message: 'TypeStore created successfully.', typeStore: newTypeStore });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

exports.updateTypeStore = async (req, res) => {
    try {
        const accountId = req.user.id;
        if (!accountId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const role = req.user.role;
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admins only.' });
        }

        const { id } = req.params;
        const { typeName, description, status } = req.body;
        const updatedTypeStore = await TyPeStore.findByIdAndUpdate(
            id,
            { typeName, description, status },
            { new: true }
        );

        if (!updatedTypeStore) {
            return res.status(404).json({ message: 'TypeStore not found.' });
        }

        res.status(200).json({ message: 'TypeStore updated successfully.', typeStore: updatedTypeStore });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}