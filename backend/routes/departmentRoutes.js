const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/auth");
const {
  getDepartments,
  getDepartmentByCode,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");

// All protected
router.get(   "/",     auth, getDepartments);
router.get(   "/:code",auth, getDepartmentByCode);
router.post(  "/",     auth, createDepartment);
router.put(   "/:code",auth, updateDepartment);
router.delete("/:code",auth, deleteDepartment);

module.exports = router;