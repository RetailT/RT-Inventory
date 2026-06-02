const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");
const {
  getCategories,
  getCategoryByCode,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

// All protected
router.get(   "/",        auth, getCategories);
router.get(   "/:code",   auth, getCategoryByCode);
router.post(  "/",        auth, createCategory);
router.put(   "/:code",   auth, updateCategory);
router.delete("/:code",   auth, deleteCategory);

module.exports = router;