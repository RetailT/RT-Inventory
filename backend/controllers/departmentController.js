const { getPool, sql } = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * GET /api/departments
 */
const getDepartments = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        IDX, IDXS, DEPTCODE, DEPTNAME,
        CRUSER, EDITUSER,
        CONVERT(varchar, CRDATE, 23)   AS CRDATE,
        CONVERT(varchar, EDITDATE, 23) AS EDITDATE,
        CRTIME, EDITTIME,
        BACK, WEBDEPTID, INSERT_TIME
      FROM [POSBACK_SYSTEM].[dbo].[tb_DEPARTMENT]
      ORDER BY DEPTCODE ASC
    `);
    return sendSuccess(res, { data: result.recordset });
  } catch (err) {
    console.error("[DeptController] getDepartments:", err);
    return sendError(res, "Failed to fetch departments.", 500);
  }
};

/**
 * GET /api/departments/:code
 */
const getDepartmentByCode = async (req, res) => {
  const { code } = req.params;
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("code", sql.NVarChar(10), code)
      .query(`
        SELECT
          IDX, IDXS, DEPTCODE, DEPTNAME,
          CRUSER, EDITUSER,
          CONVERT(varchar, CRDATE, 23)   AS CRDATE,
          CONVERT(varchar, EDITDATE, 23) AS EDITDATE,
          CRTIME, EDITTIME,
          BACK, WEBDEPTID
        FROM [POSBACK_SYSTEM].[dbo].[tb_DEPARTMENT]
        WHERE DEPTCODE = @code
      `);

    if (!result.recordset.length)
      return sendError(res, "Department not found.", 404);

    return sendSuccess(res, { data: result.recordset[0] });
  } catch (err) {
    console.error("[DeptController] getDepartmentByCode:", err);
    return sendError(res, "Failed to fetch department.", 500);
  }
};

/**
 * Shared save — calls Sp_DepartmentSave
 * @DATE → DD/MM/YYYY  (Convert style 103)
 * @TIME → CHAR(15)    padEnd to exactly 15 chars
 */
const saveDepartment = async (req, res, isNew) => {
  const deptCode = isNew ? req.body.deptCode : req.params.code;
  const { deptName, username } = req.body;

  if (!deptCode?.trim() || !deptName?.trim())
    return sendError(res, "Department Code and Name are required.", 400);

  try {
    const pool = await getPool();

    const now = new Date();

    // DATE → DD/MM/YYYY (style 103)
    const dd   = String(now.getDate()).padStart(2, "0");
    const mm   = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    const date = `${dd}/${mm}/${yyyy}`;                    // "30/04/2026"

    // TIME → pad to exactly 15 chars to match CHAR(15)
    const hh  = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const sec = String(now.getSeconds()).padStart(2, "0");
    const time = `${hh}:${min}:${sec}`.padEnd(15, " ");   // "14:35:22       "

    await pool
      .request()
      .input("DEPTCODE", sql.NVarChar(10), deptCode.trim().toUpperCase())
      .input("DEPTNAME", sql.NVarChar(30), deptName.trim())
      .input("USER",     sql.NVarChar(50), username || "SYSTEM")
      .input("DATE",     sql.NVarChar(10), date)
      .input("TIME",     sql.NVarChar(15), time)
      .execute("Sp_DepartmentSave");

    const message = isNew
      ? `Department "${deptCode.trim().toUpperCase()}" created successfully.`
      : `Department "${deptCode}" updated successfully.`;

    return sendSuccess(res, {}, message, isNew ? 201 : 200);
  } catch (err) {
    console.error("[DeptController] saveDepartment:", err);
    return sendError(res, "Failed to save department.", 500);
  }
};

// POST /api/departments
const createDepartment = (req, res) => saveDepartment(req, res, true);

// PUT /api/departments/:code
const updateDepartment = (req, res) => saveDepartment(req, res, false);

/**
 * DELETE /api/departments/:code
 */
const deleteDepartment = async (req, res) => {
  const { code } = req.params;
  try {
    const pool = await getPool();

    const exists = await pool
      .request()
      .input("code", sql.NVarChar(10), code)
      .query(`
        SELECT IDX FROM [POSBACK_SYSTEM].[dbo].[tb_DEPARTMENT]
        WHERE DEPTCODE = @code
      `);

    if (!exists.recordset.length)
      return sendError(res, "Department not found.", 404);

    await pool
      .request()
      .input("code", sql.NVarChar(10), code)
      .query(`
        DELETE FROM [POSBACK_SYSTEM].[dbo].[tb_DEPARTMENT]
        WHERE DEPTCODE = @code
      `);

    return sendSuccess(res, {}, "Department deleted successfully.");
  } catch (err) {
    console.error("[DeptController] deleteDepartment:", err);
    return sendError(res, "Failed to delete department.", 500);
  }
};

module.exports = {
  getDepartments,
  getDepartmentByCode,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};