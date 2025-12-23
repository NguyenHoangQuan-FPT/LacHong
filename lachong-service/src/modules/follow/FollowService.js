const Follow = require('../../models/model/Follow');

exports.followStore = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { storeId } = req.body;
        if (!storeId) {
            return res.status(400).json({ message: 'storeId is required' });
        }

        const existingFollow = await Follow.findOne({ follower: accountId, following: storeId });
        if (existingFollow) {
            return res.status(400).json({ message: 'You are already following this store.' });
        }

        const newFollow = new Follow({
            follower: accountId,
            following: storeId,
            createdAt: new Date()
        });
        await newFollow.save();

        res.status(201).json({
            message: 'Store followed successfully.',
            follow: newFollow
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.unfollowStore = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { storeId } = req.body;
        if (!storeId) {
            return res.status(400).json({ message: 'storeId is required' });
        }

        const deletedFollow = await Follow.findOneAndDelete({ follower: accountId, following: storeId });
        if (!deletedFollow) {
            return res.status(404).json({ message: 'Follow relationship not found.' });
        }

        res.status(200).json({
            message: 'Store unfollowed successfully.'
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getFollowingByStore = async (req, res) => {
    try {
        const { storeId } = req.params;
        if (!storeId) {
            return res.status(400).json({ message: 'storeId is required' });
        }

        const follows = await Follow.find({ following: storeId }).lean();

        res.status(200).json({
            follows
        });
    } catch (error) {
        console.log('getFollowingByStore error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getFollowingStores = async (req, res) => {
    try {
        const accountId = req.user?.id;
        if (!accountId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const follows = await Follow.find({ follower: accountId }).lean();
        const storeIds = follows.map(follow => follow.following);

        res.status(200).json({
            stores: storeIds
        });
    } catch (error) {
        console.log('getFollowingStores error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}