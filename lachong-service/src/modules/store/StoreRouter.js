const express = require('express');
const router = express.Router();

const StoreService = require('./StoreService');
const upload = require('../../config/multer');
const verifyStoreToken = require('../../services/middleware');

router.put("/profileStore", verifyStoreToken, upload.single("avatar"), StoreService.updateProfileStore);
router.get("/profileStore", verifyStoreToken, StoreService.getProfileStore);
router.post(
    "/store/product",
    verifyStoreToken,
    upload.array("images", 10),
    StoreService.createProductByStore
); router.put("/store/product/:id", verifyStoreToken, upload.array("images", 10), StoreService.updateProductByStore);
router.get("/store/products", verifyStoreToken, StoreService.getProductsByStore);
router.delete("/store/product/:id", verifyStoreToken, StoreService.deleteProductByStore);
router.get("/store/product/:id", verifyStoreToken, StoreService.getProductById);
router.get("/store/:id", StoreService.getStoreById);
router.get("/store/:id/products", StoreService.getProductsByStoreId);
router.get("/stores", verifyStoreToken, StoreService.getAllStores);
router.put("/store/:id", verifyStoreToken, StoreService.updateStatusStore);

module.exports = router;