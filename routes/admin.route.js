const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");

// GET Create Form
router.get("/create", adminController.renderCreateForm);

// POST Create Admin
router.post("/create", adminController.createAdmin); 

// GET All Admins
router.get("/list", adminController.listAdmins);

// GET Edit Form
router.get("/edit/:id", adminController.renderEditForm);

// POST Update Admin
router.post("/edit/:id", adminController.updateAdmin);

// POST Delete Admin
router.post("/delete/:id", adminController.deleteAdmin);

module.exports = router;
