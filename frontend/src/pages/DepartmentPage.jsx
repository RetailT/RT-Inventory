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

const EMPTY_FORM = { deptCode: "", deptName: "" };
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
    <Icon
      size={13}
      style={{ color: "var(--text-muted)" }}
      className="flex-shrink-0"
    />
    <div className="flex-1 min-w-0">
      <p
        className="text-[9px] font-semibold tracking-widest uppercase font-body"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </p>
      <p
        className="text-xs font-mono truncate mt-0.5"
        style={{ color: "var(--text-primary)" }}
      >
        {value || "—"}
      </p>
    </div>
  </div>
);

const DepartmentPage = () => {
  const { user } = useAuth();

  const [departments, setDepartments] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedDept, setSelectedDept] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: null,
  });
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });

  const showToast = (message, type = "success") =>
    setToast({ show: true, type, message });
  const hideToast = () => setToast((t) => ({ ...t, show: false }));

  const fetchDepartments = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await api.get("/departments");
      setDepartments(res.data.data || []);
    } catch {
      showToast("Failed to load departments.", "error");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleSelectDept = async (dept) => {
    setDropOpen(false);
    setFormLoading(true);
    setIsNew(false);
    setIsDirty(false);
    try {
      const res = await api.get(`/departments/${dept.DEPTCODE}`);
      const d = res.data.data;
      setSelectedDept(d);
      setForm({ deptCode: d.DEPTCODE, deptName: d.DEPTNAME });
    } catch {
      showToast("Failed to load department details.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleNew = () => {
    setSelectedDept(null);
    setForm(EMPTY_FORM);
    setIsNew(true);
    setIsDirty(false);
  };

  const handleClose = () => {
    setSelectedDept(null);
    setForm(EMPTY_FORM);
    setIsNew(false);
    setIsDirty(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setIsDirty(true);
  };

  const doSave = async () => {
    if (!form.deptCode.trim() || !form.deptName.trim()) {
      showToast("Department Code and Name are required.", "warning");
      return;
    }
    setFormLoading(true);
    try {
      if (isNew) {
        // ── Check if code already exists before saving ──
        const checkRes = await api
          .get(`/departments/${form.deptCode.trim().toUpperCase()}`)
          .catch(() => null);

        if (checkRes?.data?.data) {
          // Exists — ask user to confirm replace
          setFormLoading(false);
          setConfirmDialog({ open: true, type: "replace" });
          return;
        }

        // Does not exist — create new
        await api.post("/departments", {
          deptCode: form.deptCode,
          deptName: form.deptName,
          username: user?.username,
        });
        showToast(
          `Department "${form.deptCode.toUpperCase()}" created successfully.`,
        );
        await fetchDepartments();
        handleClose();
      } else {
        // ── Update existing ──
        await api.put(`/departments/${selectedDept.DEPTCODE}`, {
          deptName: form.deptName,
          username: user?.username,
        });
        showToast(
          `Department "${selectedDept.DEPTCODE}" updated successfully.`,
        );
        const res = await api.get(`/departments/${selectedDept.DEPTCODE}`);
        const d = res.data.data;
        setSelectedDept(d);
        setForm({ deptCode: d.DEPTCODE, deptName: d.DEPTNAME });
        setIsDirty(false);
        await fetchDepartments();
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
      await api.put(`/departments/${form.deptCode.trim().toUpperCase()}`, {
        deptName: form.deptName,
        username: user?.username,
      });
      showToast(`Department "${form.deptCode}" replaced successfully.`);
      const res = await api.get(
        `/departments/${form.deptCode.trim().toUpperCase()}`,
      );
      const d = res.data.data;
      setSelectedDept(d);
      setForm({ deptCode: d.DEPTCODE, deptName: d.DEPTNAME });
      setIsNew(false);
      setIsDirty(false);
      await fetchDepartments();
    } catch {
      showToast("Replace failed.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = () => {
    if (!selectedDept) return;
    setConfirmDialog({ open: true, type: "delete" });
  };

  const handleDeleteConfirm = async () => {
    setConfirmDialog({ open: false, type: null });
    setFormLoading(true);
    try {
      await api.delete(`/departments/${selectedDept.DEPTCODE}`);
      showToast(`Department "${selectedDept.DEPTCODE}" deleted.`);
      handleClose();
      await fetchDepartments();
    } catch {
      showToast("Delete failed.", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const isFormActive = isNew || selectedDept !== null;

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
            Department Details
          </h1>
        </div>
        <button
          onClick={handleNew}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <FiPlus size={16} />
          <span>New Department</span>
        </button>
      </div>

      {/* ── Main panel ── */}
      <div className="card">
        {/* ── Action bar ── */}
        <div
          className="flex flex-wrap items-center gap-2 pb-4 mb-4"
          style={{ borderBottom: "1px solid var(--bg-border)" }}
        >
          {/* Save */}
          <button
            onClick={doSave}
            disabled={!isFormActive || formLoading || !isDirty}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold font-body transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background:
                !isFormActive || formLoading || !isDirty
                  ? "var(--bg-border)"
                  : "#FF6B00",
              color:
                !isFormActive || formLoading || !isDirty
                  ? "var(--text-muted)"
                  : "#fff",
            }}
          >
            {formLoading ? (
              <FiLoader size={14} className="animate-spin" />
            ) : (
              <FiSave size={14} />
            )}
            Save
          </button>

          {/* Delete */}
          <button
            onClick={handleDeleteClick}
            disabled={!selectedDept || isNew || formLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold font-body transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-red-600 hover:bg-red-500 text-white"
          >
            <FiTrash2 size={14} />
            Delete
          </button>

          {/* Close */}
          <button
            onClick={handleClose}
            disabled={!isFormActive}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold font-body transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed btn-ghost"
          >
            <FiX size={14} />
            Close
          </button>

          {/* Refresh */}
          <button
            onClick={fetchDepartments}
            disabled={listLoading}
            className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-body transition-all btn-ghost"
          >
            <FiRefreshCw
              size={13}
              className={listLoading ? "animate-spin" : ""}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* ── Form Area ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT — inputs */}
          <div className="space-y-4">
            {/* Dept Code */}
            <div>
              <FieldLabel required>Department Code</FieldLabel>
              {isNew ? (
                <input
                  name="deptCode"
                  value={form.deptCode}
                  onChange={handleChange}
                  placeholder="e.g. D001"
                  className="input-field font-mono uppercase"
                  maxLength={10}
                  autoFocus
                />
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setDropOpen((v) => !v)}
                    className="input-field flex items-center justify-between text-left pr-10 w-full"
                    style={{ cursor: "pointer" }}
                  >
                    <span
                      className="font-mono truncate"
                      style={{
                        color: form.deptCode
                          ? "var(--text-primary)"
                          : "var(--text-muted)",
                      }}
                    >
                      {form.deptCode || "Select department..."}
                    </span>
                    <FiChevronDown
                      size={15}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 transition-transform ${dropOpen ? "rotate-180" : ""}`}
                      style={{ color: "var(--text-muted)" }}
                    />
                  </button>

                  {dropOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setDropOpen(false)}
                      />
                      <div
                        className="absolute top-full left-0 right-0 mt-1 z-20 rounded-xl shadow-2xl max-h-56 overflow-y-auto"
                        style={{
                          background: "var(--bg-card)",
                          border: "1px solid var(--bg-border)",
                        }}
                      >
                        {listLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <FiLoader
                              className="animate-spin text-brand-orange"
                              size={20}
                            />
                          </div>
                        ) : departments.length === 0 ? (
                          <p
                            className="text-center py-6 text-sm font-body"
                            style={{ color: "var(--text-muted)" }}
                          >
                            No departments found
                          </p>
                        ) : (
                          departments.map((d) => (
                            <button
                              key={d.IDX}
                              onClick={() => handleSelectDept(d)}
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
                                {d.DEPTCODE}
                              </span>
                              <span
                                className="truncate"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {d.DEPTNAME}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Dept Name */}
            <div>
              <FieldLabel required>Department Name</FieldLabel>
              <input
                name="deptName"
                value={form.deptName}
                onChange={handleChange}
                placeholder="Enter department name"
                className="input-field"
                disabled={!isFormActive || formLoading}
                maxLength={30}
              />
            </div>

            {/* Status hints */}
            {isNew && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{
                  background: "rgba(255,107,0,0.08)",
                  border: "1px solid rgba(255,107,0,0.2)",
                }}
              >
                <FiEdit2
                  size={13}
                  className="text-brand-orange flex-shrink-0"
                />
                <span className="text-xs font-body text-brand-orange font-semibold">
                  New Department — fill in details and click Save
                </span>
              </div>
            )}

            {!isFormActive && !isNew && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--bg-border)",
                }}
              >
                <span
                  className="text-xs font-body"
                  style={{ color: "var(--text-muted)" }}
                >
                  Select a department from the dropdown or click New Department
                  to create one.
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
              value={selectedDept?.CRUSER || (isNew ? user?.username : null)}
            />
            <AuditRow
              icon={FiCalendar}
              label="Created Date"
              value={
                selectedDept
                  ? `${formatDate(selectedDept.CRDATE)}  ${formatTime(selectedDept.CRTIME)}`
                  : isNew
                    ? new Date().toLocaleString("en-LK")
                    : null
              }
            />
            <AuditRow
              icon={FiUser}
              label="Last Edited By"
              value={selectedDept?.EDITUSER || (isNew ? user?.username : null)}
            />
            <AuditRow
              icon={FiClock}
              label="Last Edited Date"
              value={
                selectedDept
                  ? `${formatDate(selectedDept.EDITDATE)}  ${formatTime(selectedDept.EDITTIME)}`
                  : null
              }
            />

            {selectedDept && (
              <div className="pt-1">
                <p
                  className="text-[10px] font-semibold tracking-widest uppercase font-body mb-1.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Department Code
                </p>
                <span
                  className="inline-flex items-center font-mono text-sm px-3 py-1.5 rounded-lg"
                  style={{
                    background: "rgba(255,107,0,0.1)",
                    border: "1px solid rgba(255,107,0,0.3)",
                    color: "#FF6B00",
                  }}
                >
                  {selectedDept.DEPTCODE}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Department List Table ── */}
      <div className="card mt-4">
        <div className="flex items-center justify-between mb-4">
          <p
            className="text-xs font-semibold tracking-widest uppercase font-body"
            style={{ color: "var(--text-muted)" }}
          >
            All Departments
            <span
              className="ml-2 px-2 py-0.5 rounded text-[10px] font-mono"
              style={{ background: "rgba(255,107,0,0.1)", color: "#FF6B00" }}
            >
              {departments.length}
            </span>
          </p>
        </div>

        {listLoading ? (
          <div className="flex items-center justify-center py-16">
            <FiLoader className="animate-spin text-brand-orange" size={24} />
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-16">
            <p
              className="font-body text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              No departments found. Click New Department to add one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm font-body min-w-[500px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--bg-border)" }}>
                  {[
                    "Code",
                    "Name",
                    "Created By",
                    "Created Date",
                    "Edited By",
                    "Edited Date",
                  ].map((h) => (
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
                {departments.map((d) => {
                  const isActive = selectedDept?.DEPTCODE === d.DEPTCODE;
                  return (
                    <tr
                      key={d.IDX}
                      onClick={() => handleSelectDept(d)}
                      className="cursor-pointer transition-colors"
                      style={{
                        borderBottom: "1px solid var(--bg-border)",
                        background: isActive
                          ? "rgba(255,107,0,0.06)"
                          : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive)
                          e.currentTarget.style.background =
                            "color-mix(in srgb, var(--text-primary) 3%, transparent)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive)
                          e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <td className="py-3 px-2">
                        <span
                          className="font-mono text-xs px-2 py-1 rounded whitespace-nowrap"
                          style={{
                            background: "rgba(255,107,0,0.1)",
                            color: "#FF6B00",
                            border: "1px solid rgba(255,107,0,0.2)",
                          }}
                        >
                          {d.DEPTCODE}
                        </span>
                      </td>
                      <td
                        className="py-3 px-2"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {d.DEPTNAME}
                      </td>
                      <td
                        className="py-3 px-2 font-mono text-xs whitespace-nowrap"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {d.CRUSER || "—"}
                      </td>
                      <td
                        className="py-3 px-2 font-mono text-xs whitespace-nowrap"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {formatDate(d.CRDATE)}
                      </td>
                      <td
                        className="py-3 px-2 font-mono text-xs whitespace-nowrap"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {d.EDITUSER || "—"}
                      </td>
                      <td
                        className="py-3 px-2 font-mono text-xs whitespace-nowrap"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {formatDate(d.EDITDATE)}
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
        title="Delete Department?"
        message={`Are you sure you want to delete "${selectedDept?.DEPTCODE} – ${selectedDept?.DEPTNAME}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDialog({ open: false, type: null })}
      />
      <ConfirmDialog
        open={confirmDialog.open && confirmDialog.type === "replace"}
        title="Department Already Exists"
        message={`Department code "${form.deptCode.toUpperCase()}" already exists. Do you want to replace it?`}
        confirmLabel="Yes, Replace"
        onConfirm={handleReplaceConfirm}
        onCancel={() => setConfirmDialog({ open: false, type: null })}
      />

      {/* ── Toast ── */}
      <Toast
        show={toast.show}
        type={toast.type}
        message={toast.message}
        onClose={hideToast}
      />
    </div>
  );
};

export default DepartmentPage;
