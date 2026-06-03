import React, { useState, useEffect, useCallback } from "react";
import {
  FiPlus,
  FiSave,
  FiTrash2,
  FiX,
  FiEdit2,
  FiChevronDown,
  FiLoader,
  FiRefreshCw,
  FiUser,
  FiClock,
  FiCalendar,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import Toast from "../components/ui/Toast";

const EMPTY_FORM = { deptCode: "", deptName: "", catCode: "", catName: "" };
const formatDate = (d) => (d ? d.toString().slice(0, 10) : "—");
const formatTime = (t) => (t ? t.toString().slice(0, 8) : "—");

const FieldLabel = ({ children, required }) => (
  <label
    className="block text-xs font-semibold tracking-wider uppercase mb-1.5 font-body"
    style={{ color: "var(--text-muted)" }}
  >
    {children}
    {required && <span className="text-brand-orange ml-1">*</span>}
  </label>
);

const AuditRow = ({ icon: Icon, label, value }) => (
  <div
    className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
    style={{
      background: "var(--bg-primary)",
      border: "1px solid var(--bg-border)",
    }}
  >
    <Icon size={13} style={{ color: "var(--text-muted)" }} className="flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p
        className="text-[9px] font-semibold tracking-widest uppercase font-body"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </p>
      <p className="text-xs font-mono truncate mt-0.5" style={{ color: "var(--text-primary)" }}>
        {value || "—"}
      </p>
    </div>
  </div>
);

const CategoryPage = () => {
  const { user } = useAuth();

  // ── Departments ──
  const [departments, setDepartments] = useState([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [deptDropOpen, setDeptDropOpen] = useState(false);

  // ── Categories ──
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [catDropOpen, setCatDropOpen] = useState(false);
  const [catSearch, setCatSearch] = useState("");

  // ── Form / selection state ──
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedDeptForForm, setSelectedDeptForForm] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // ── UI ──
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null });
  const [toast, setToast] = useState({ show: false, type: "success", message: "" });

  const showToast = (message, type = "success") =>
    setToast({ show: true, type, message });
  const hideToast = () => setToast((t) => ({ ...t, show: false }));

  // ── Clear form function ──
  const clearForm = () => {
    setForm(EMPTY_FORM);
    setSelectedCat(null);
    setSelectedDeptForForm(null);
    setIsNew(false);
    setIsDirty(false);
  };

  // ── Fetch all departments ──
  const fetchDepartments = useCallback(async () => {
    setDeptLoading(true);
    try {
      const res = await api.get("/departments");
      setDepartments(res.data.data || []);
    } catch {
      showToast("Failed to load departments.", "error");
    } finally {
      setDeptLoading(false);
    }
  }, []);

  // ── Fetch all categories ──
  const fetchCategories = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data || []);
    } catch {
      showToast("Failed to load categories.", "error");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
    fetchCategories();
  }, [fetchDepartments, fetchCategories]);

  // ── Filter bottom table by selected dept ──
  useEffect(() => {
    if (selectedDeptForForm) {
      setFilteredCategories(
        categories.filter((c) => c.DEPTCODE === selectedDeptForForm.DEPTCODE)
      );
    } else {
      setFilteredCategories(categories);
    }
  }, [selectedDeptForForm, categories]);

  // ── Select a department from the dept dropdown ──
  const handleSelectDept = (dept) => {
    setDeptDropOpen(false);
    setSelectedDeptForForm(dept);
    setSelectedCat(null);
    setIsDirty(false);
    setForm((prev) => ({
      deptCode: dept.DEPTCODE,
      deptName: dept.DEPTNAME,
      catCode: prev.catCode,
      catName: prev.catName,
    }));
  };

  // ── Select a category from the category dropdown ──
  const handleSelectCat = async (cat) => {
    setCatDropOpen(false);
    setFormLoading(true);
    setIsNew(false);
    setIsDirty(false);
    try {
      const res = await api.get(`/categories/${cat.CATCODE}`);
      const c = res.data.data;
      setSelectedCat(c);
      setForm({
        deptCode: c.DEPTCODE,
        deptName: c.DEPTNAME || "",
        catCode: c.CATCODE,
        catName: c.CATNAME,
      });
      setSelectedDeptForForm({ DEPTCODE: c.DEPTCODE, DEPTNAME: c.DEPTNAME || "" });
    } catch {
      showToast("Failed to load category details.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Select from bottom table ──
  const handleSelectCatFromTable = async (cat) => {
    setFormLoading(true);
    setIsNew(false);
    setIsDirty(false);
    try {
      const res = await api.get(`/categories/${cat.CATCODE}`);
      const c = res.data.data;
      setSelectedCat(c);
      setForm({
        deptCode: c.DEPTCODE,
        deptName: c.DEPTNAME || "",
        catCode: c.CATCODE,
        catName: c.CATNAME,
      });
      setSelectedDeptForForm({ DEPTCODE: c.DEPTCODE, DEPTNAME: c.DEPTNAME || "" });
    } catch {
      showToast("Failed to load category details.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleNew = () => {
    setSelectedCat(null);
    setForm(EMPTY_FORM);
    setSelectedDeptForForm(null);
    setIsNew(true);
    setIsDirty(false);
  };

  const handleClose = () => {
    setSelectedCat(null);
    setForm(EMPTY_FORM);
    setSelectedDeptForForm(null);
    setIsNew(false);
    setIsDirty(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: ["catName", "deptName"].includes(name) ? value.toUpperCase() : value,
    }));
    setIsDirty(true);
  };

  // ── Save ──
  const doSave = async () => {
    if (!form.deptCode.trim() || !form.catCode.trim() || !form.catName.trim()) {
      showToast("Department Code, Category Code and Category Name are required.", "warning");
      return;
    }
    setFormLoading(true);
    try {
      if (isNew) {
        const checkRes = await api
          .get(`/categories/${form.catCode.trim().toUpperCase()}`)
          .catch(() => null);

        if (checkRes?.data?.data) {
          setFormLoading(false);
          setConfirmDialog({ open: true, type: "replace" });
          return;
        }

        await api.post("/categories", {
          deptCode: form.deptCode.trim().toUpperCase(),
          deptName: form.deptName.trim(),
          catCode: form.catCode.trim().toUpperCase(),
          catName: form.catName.trim(),
          username: user?.username,
        });
        showToast(`Category "${form.catCode.toUpperCase()}" created successfully.`);
        await fetchCategories();
        clearForm(); // Clear all input fields after successful save
      } else {
        await api.put(`/categories/${selectedCat.CATCODE}`, {
          deptCode: form.deptCode.trim().toUpperCase(),
          deptName: form.deptName.trim(),
          catName: form.catName.trim(),
          username: user?.username,
        });
        showToast(`Category "${selectedCat.CATCODE}" updated successfully.`);
        clearForm(); // Clear all input fields after successful update
        await fetchCategories();
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Save failed.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleReplaceConfirm = async () => {
    setConfirmDialog({ open: false, type: null });
    setFormLoading(true);
    try {
      await api.put(`/categories/${form.catCode.trim().toUpperCase()}`, {
        deptCode: form.deptCode.trim().toUpperCase(),
        deptName: form.deptName.trim(),
        catName: form.catName.trim(),
        username: user?.username,
      });
      showToast(`Category "${form.catCode}" replaced successfully.`);
      clearForm(); // Clear all input fields after successful replace
      await fetchCategories();
    } catch {
      showToast("Replace failed.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = () => {
    if (!selectedCat) return;
    setConfirmDialog({ open: true, type: "delete" });
  };

  const handleDeleteConfirm = async () => {
    setConfirmDialog({ open: false, type: null });
    setFormLoading(true);
    try {
      await api.delete(`/categories/${selectedCat.CATCODE}`);
      showToast(`Category "${selectedCat.CATCODE}" deleted.`);
      clearForm(); // Clear all input fields after successful delete
      await fetchCategories();
    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message;
      const msg =
        status === 409
          ? serverMsg || "Cannot delete — products are assigned to this category."
          : status === 404
          ? "Category not found."
          : status === 500
          ? "Server error. Please contact your administrator."
          : serverMsg || "Delete failed. Please try again.";
      showToast(msg, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const isFormActive = isNew || selectedCat !== null;

  // Categories for cat dropdown — only matching selected dept
  const catDropList = selectedDeptForForm
    ? categories.filter((c) => c.DEPTCODE === selectedDeptForForm.DEPTCODE)
    : [];

  return (
    <div className="animate-fade-in w-full">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <p
            className="text-[10px] font-semibold tracking-widest uppercase font-body mb-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            Master Details
          </p>
          <h1
            className="font-display text-2xl sm:text-3xl tracking-wider"
            style={{ color: "var(--text-primary)" }}
          >
            Category Details
          </h1>
        </div>
        <button
          onClick={handleNew}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <FiPlus size={16} />
          <span>New Category</span>
        </button>
      </div>

      {/* ── Main panel ── */}
      <div className="card">
        {/* ── Action bar ── */}
        <div
          className="flex flex-wrap items-center gap-2 pb-4 mb-4"
          style={{ borderBottom: "1px solid var(--bg-border)" }}
        >
          <button
            onClick={doSave}
            disabled={!isFormActive || formLoading || !isDirty}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold font-body transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: !isFormActive || formLoading || !isDirty ? "var(--bg-border)" : "#FF6B00",
              color: !isFormActive || formLoading || !isDirty ? "var(--text-muted)" : "#fff",
            }}
          >
            {formLoading ? <FiLoader size={14} className="animate-spin" /> : <FiSave size={14} />}
            Save
          </button>

          <button
            onClick={handleDeleteClick}
            disabled={!selectedCat || isNew || formLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold font-body transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-red-600 hover:bg-red-500 text-white"
          >
            <FiTrash2 size={14} />
            Delete
          </button>

          <button
            onClick={handleClose}
            disabled={!isFormActive}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold font-body transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed btn-ghost"
          >
            <FiX size={14} />
            Close
          </button>

          <button
            onClick={() => { fetchDepartments(); fetchCategories(); }}
            disabled={listLoading || deptLoading}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-body transition-all btn-ghost"
          >
            <FiRefreshCw size={13} className={listLoading || deptLoading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* ── Form Area ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT — inputs */}
          <div className="space-y-4">

            {/* ── Department dropdown ── */}
            <div>
              <FieldLabel required>Department</FieldLabel>
              <div className="relative">
                <button
                  onClick={() => setDeptDropOpen((v) => !v)}
                  disabled={formLoading}
                  className="input-field flex items-center justify-between text-left pr-10 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ cursor: "pointer" }}
                >
                  {form.deptCode ? (
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="font-mono text-xs px-2 py-0.5 rounded flex-shrink-0"
                        style={{
                          background: "rgba(255,107,0,0.1)",
                          color: "#FF6B00",
                          border: "1px solid rgba(255,107,0,0.2)",
                        }}
                      >
                        {form.deptCode}
                      </span>
                      <span className="truncate" style={{ color: "var(--text-primary)" }}>
                        {form.deptName}
                      </span>
                    </div>
                  ) : (
                    <span style={{ color: "var(--text-muted)" }}>Select department...</span>
                  )}
                  <FiChevronDown
                    size={15}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${deptDropOpen ? "rotate-180" : ""}`}
                    style={{ color: "var(--text-muted)" }}
                  />
                </button>

                {deptDropOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDeptDropOpen(false)} />
                    <div
                      className="absolute top-full left-0 right-0 mt-1 z-20 rounded-xl shadow-2xl max-h-56 overflow-y-auto"
                      style={{ background: "var(--bg-card)", border: "1px solid var(--bg-border)" }}
                    >
                      {deptLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <FiLoader className="animate-spin text-brand-orange" size={20} />
                        </div>
                      ) : departments.length === 0 ? (
                        <p className="text-center py-6 text-sm font-body" style={{ color: "var(--text-muted)" }}>
                          No departments found
                        </p>
                      ) : (
                        departments.map((d) => (
                          <button
                            key={d.IDX}
                            onClick={() => handleSelectDept(d)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors font-body"
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "color-mix(in srgb, var(--text-primary) 6%, transparent)")
                            }
                            onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                          >
                            <span
                              className="font-mono text-xs px-2 py-0.5 rounded flex-shrink-0"
                              style={{
                                background: "rgba(255,107,0,0.1)",
                                color: "#FF6B00",
                                border: "1px solid rgba(255,107,0,0.2)",
                              }}
                            >
                              {d.DEPTCODE}
                            </span>
                            <span className="truncate" style={{ color: "var(--text-primary)" }}>
                              {d.DEPTNAME}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ── Category Code — free input (new) or searchable input (existing) ── */}
            <div>
              <FieldLabel required>Category Code</FieldLabel>
              {isNew ? (
                <input
                  name="catCode"
                  value={form.catCode}
                  onChange={handleChange}
                  placeholder={form.deptCode ? "Enter Code" : "Select a department first"}
                  className="input-field font-mono uppercase"
                  maxLength={10}
                  disabled={!form.deptCode}
                  autoFocus={!!form.deptCode}
                />
              ) : (
                <div className="relative">
                  <input
                    value={catSearch || form.catCode}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setCatSearch(val);
                      setCatDropOpen(true);
                      // If cleared, reset selection
                      if (!val) {
                        setSelectedCat(null);
                        setForm((f) => ({ ...f, catCode: "", catName: "" }));
                        setIsDirty(false);
                      }
                    }}
                    onFocus={() => {
                      setCatSearch(form.catCode || "");
                      setCatDropOpen(true);
                    }}
                    placeholder={
                      selectedDeptForForm
                        ? "Type to search or select..."
                        : "Select department first..."
                    }
                    className="input-field font-mono uppercase pr-10"
                    disabled={formLoading || !selectedDeptForForm}
                    autoComplete="off"
                  />
                  <FiChevronDown
                    size={15}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition-transform pointer-events-none ${catDropOpen ? "rotate-180" : ""}`}
                    style={{ color: "var(--text-muted)" }}
                  />

                  {catDropOpen && selectedDeptForForm && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => {
                          setCatDropOpen(false);
                          // Restore catCode text if user didn't pick
                          setCatSearch("");
                        }}
                      />
                      <div
                        className="absolute top-full left-0 right-0 mt-1 z-20 rounded-xl shadow-2xl max-h-56 overflow-y-auto"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--bg-border)" }}
                      >
                        {(() => {
                          const filtered = catDropList.filter(
                            (c) =>
                              c.CATCODE.toUpperCase().includes(catSearch) ||
                              c.CATNAME.toUpperCase().includes(catSearch)
                          );
                          return filtered.length === 0 ? (
                            <p
                              className="text-center py-6 text-sm font-body"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {catDropList.length === 0
                                ? "No categories for this department"
                                : "No match found"}
                            </p>
                          ) : (
                            filtered.map((c) => (
                              <button
                                key={c.IDX}
                                onMouseDown={(e) => {
                                  // onMouseDown instead of onClick to fire before onBlur
                                  e.preventDefault();
                                  handleSelectCat(c);
                                  setCatSearch("");
                                  setCatDropOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors font-body"
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background =
                                    "color-mix(in srgb, var(--text-primary) 6%, transparent)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background = "")
                                }
                              >
                                <span
                                  className="font-mono text-xs px-2 py-0.5 rounded flex-shrink-0"
                                  style={{
                                    background: "rgba(255,107,0,0.1)",
                                    color: "#FF6B00",
                                    border: "1px solid rgba(255,107,0,0.2)",
                                  }}
                                >
                                  {c.CATCODE}
                                </span>
                                <span
                                  className="truncate"
                                  style={{ color: "var(--text-primary)" }}
                                >
                                  {c.CATNAME}
                                </span>
                              </button>
                            ))
                          );
                        })()}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── Category Name ── */}
            <div>
              <FieldLabel required>Category Name</FieldLabel>
              <input
                name="catName"
                value={form.catName}
                onChange={handleChange}
                placeholder="Enter category name"
                className="input-field uppercase"
                disabled={!isFormActive || formLoading}
                maxLength={30}
              />
            </div>

            {/* Status hints */}
            {isNew && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: "rgba(255,107,0,0.08)", border: "1px solid rgba(255,107,0,0.2)" }}
              >
                <FiEdit2 size={13} className="text-brand-orange flex-shrink-0" />
                <span className="text-xs font-body text-brand-orange font-semibold">
                  {!form.deptCode
                    ? "Step 1: Select a department above"
                    : !form.catCode
                    ? "Step 2: Enter a Category Code"
                    : !form.catName
                    ? "Step 3: Enter a Category Name"
                    : "Ready — click Save to create"}
                </span>
              </div>
            )}

            {!isFormActive && !isNew && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: "var(--bg-primary)", border: "1px solid var(--bg-border)" }}
              >
                <span className="text-xs font-body" style={{ color: "var(--text-muted)" }}>
                  {selectedDeptForForm
                    ? "Now select a category from the dropdown above."
                    : "Select a department first, then pick a category — or click New Category to create one."}
                </span>
              </div>
            )}
          </div>

          {/* RIGHT — audit info */}
          <div className="space-y-2.5">
            <p
              className="text-[10px] font-semibold tracking-widest uppercase font-body mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Audit Information
            </p>
            <AuditRow
              icon={FiUser}
              label="Created By"
              value={selectedCat?.CRUSER || (isNew ? user?.username : null)}
            />
            <AuditRow
              icon={FiCalendar}
              label="Created Date"
              value={
                selectedCat
                  ? `${formatDate(selectedCat.CRDATE)}  ${formatTime(selectedCat.CRTIME)}`
                  : isNew
                  ? new Date().toLocaleString("en-LK")
                  : null
              }
            />
            <AuditRow
              icon={FiUser}
              label="Last Edited By"
              value={selectedCat?.EDITUSER || (isNew ? user?.username : null)}
            />
            <AuditRow
              icon={FiClock}
              label="Last Edited Date"
              value={
                selectedCat
                  ? `${formatDate(selectedCat.EDITDATE)}  ${formatTime(selectedCat.EDITTIME)}`
                  : null
              }
            />

            {selectedCat && (
              <div className="pt-1">
                <p
                  className="text-[10px] font-semibold tracking-widest uppercase font-body mb-1.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Category Code
                </p>
                <span
                  className="inline-flex items-center font-mono text-sm px-3 py-1.5 rounded-lg"
                  style={{
                    background: "rgba(255,107,0,0.1)",
                    border: "1px solid rgba(255,107,0,0.3)",
                    color: "#FF6B00",
                  }}
                >
                  {selectedCat.CATCODE}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Category List Table ── */}
      <div className="card mt-4">
        <div className="flex items-center justify-between mb-4">
          <p
            className="text-xs font-semibold tracking-widest uppercase font-body"
            style={{ color: "var(--text-muted)" }}
          >
            {selectedDeptForForm
              ? `Categories — ${selectedDeptForForm.DEPTCODE} ${selectedDeptForForm.DEPTNAME}`
              : "All Categories"}
            <span
              className="ml-2 px-2 py-0.5 rounded text-[10px] font-mono"
              style={{ background: "rgba(255,107,0,0.1)", color: "#FF6B00" }}
            >
              {filteredCategories.length}
            </span>
          </p>
        </div>

        {listLoading ? (
          <div className="flex items-center justify-center py-16">
            <FiLoader className="animate-spin text-brand-orange" size={24} />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-body text-sm" style={{ color: "var(--text-muted)" }}>
              {selectedDeptForForm
                ? "No categories found for this department."
                : "No categories found. Click New Category to add one."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm font-body min-w-[600px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--bg-border)" }}>
                  {["Dept Code", "Cat Code", "Category Name", "Created By", "Created Date", "Edited By", "Edited Date"].map((h) => (
                    <th
                      key={h}
                      className="text-left pb-3 px-2 text-[10px] font-semibold tracking-widest uppercase whitespace-nowrap"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((c) => {
                  const isActive = selectedCat?.CATCODE === c.CATCODE;
                  return (
                    <tr
                      key={c.IDX}
                      onClick={() => handleSelectCatFromTable(c)}
                      className="cursor-pointer transition-colors"
                      style={{
                        borderBottom: "1px solid var(--bg-border)",
                        background: isActive ? "rgba(255,107,0,0.06)" : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive)
                          e.currentTarget.style.background =
                            "color-mix(in srgb, var(--text-primary) 3%, transparent)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <td className="py-3 px-2">
                        <span
                          className="font-mono text-xs px-2 py-1 rounded whitespace-nowrap"
                          style={{
                            background: "rgba(100,100,255,0.08)",
                            color: "var(--text-secondary)",
                            border: "1px solid rgba(100,100,255,0.15)",
                          }}
                        >
                          {c.DEPTCODE}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className="font-mono text-xs px-2 py-1 rounded whitespace-nowrap"
                          style={{
                            background: "rgba(255,107,0,0.1)",
                            color: "#FF6B00",
                            border: "1px solid rgba(255,107,0,0.2)",
                          }}
                        >
                          {c.CATCODE}
                        </span>
                      </td>
                      <td className="py-3 px-2" style={{ color: "var(--text-primary)" }}>
                        {c.CATNAME}
                       </td>
                      <td className="py-3 px-2 font-mono text-xs whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                        {c.CRUSER || "—"}
                       </td>
                      <td className="py-3 px-2 font-mono text-xs whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                        {formatDate(c.CRDATE)}
                       </td>
                      <td className="py-3 px-2 font-mono text-xs whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                        {c.EDITUSER || "—"}
                       </td>
                      <td className="py-3 px-2 font-mono text-xs whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                        {formatDate(c.EDITDATE)}
                       </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Confirm Dialogs ── */}
      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.type === "delete"}
        danger
        title="Delete Category?"
        message={`Are you sure you want to delete "${selectedCat?.CATCODE} – ${selectedCat?.CATNAME}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDialog({ open: false, type: null })}
      />
      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.type === "replace"}
        title="Category Already Exists"
        message={`Category code "${form.catCode.toUpperCase()}" already exists. Do you want to replace it?`}
        confirmLabel="Yes, Replace"
        onConfirm={handleReplaceConfirm}
        onCancel={() => setConfirmDialog({ open: false, type: null })}
      />

      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={hideToast} />
    </div>
  );
};

export default CategoryPage;