const Admin = require("../models/admin.model");
const bcrypt = require("bcrypt");

exports.renderCreateForm = (req, res) => {
  res.render("admin/create");
};

exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ✅ Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      req.flash("error", "Email already exists.");
      return res.redirect("/admin/create");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await Admin.create({ name, email, password: hashedPassword });

    req.flash("success", "Admin created successfully");
    res.redirect("/admin/list");
  } catch (err) {
    console.error("Create Admin Error:", err);
    req.flash("error", "Failed to create admin");
    res.redirect("/admin/create");
  }
};

exports.listAdmins = async (req, res) => {
  const admins = await Admin.find();
  res.render("admin/list", { admins });
};

exports.renderEditForm = async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  res.render("admin/edit", { admin });
};

exports.updateAdmin = async (req, res) => {
  const { name, email } = req.body;

  // Optional: check if the updated email already exists in another record
  const existingAdmin = await Admin.findOne({ email, _id: { $ne: req.params.id } });
  if (existingAdmin) {
    req.flash("error", "Email already in use by another admin.");
    return res.redirect(`/admin/edit/${req.params.id}`);
  }

  await Admin.findByIdAndUpdate(req.params.id, { name, email });
  req.flash("success", "Admin updated successfully");
  res.redirect("/admin/list");
};

exports.deleteAdmin = async (req, res) => {
  await Admin.findByIdAndDelete(req.params.id);
  req.flash("success", "Admin deleted");
  res.redirect("/admin/list");
};
