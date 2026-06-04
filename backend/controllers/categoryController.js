const { getPool, sql } = require("../config/db");
const { sendSuccess, sendError } = require("../utils/response");

/**
 * GET /api/categories
 */
const getCategories = async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        c.IDX, c.IDXS, c.DEPTCODE, c.CATCODE, c.CATNAME,
        ISNULL(c.DEPTNAME, d.DEPTNAME) AS DEPTNAME,
        c.CRUSER, c.EDITUSER,
        CONVERT(varchar, c.CRDATE,   23) AS CRDATE,
        CONVERT(varchar, c.EDITDATE, 23) AS EDITDATE,
        c.CRTIME, c.EDITTIME,
        c.BACK, c.WEBCATID, c.INSERT_TIME
      FROM [POSBACK_SYSTEM].[dbo].[tb_CATEGORY] c
      LEFT JOIN [POSBACK_SYSTEM].[dbo].[tb_DEPARTMENT] d
        ON d.DEPTCODE = c.DEPTCODE
      ORDER BY c.DEPTCODE ASC, c.CATCODE ASC
    `);
    return sendSuccess(res, { data: result.recordset });
  } catch (err) {
    console.error("[CatController] getCategories:", err);
    return sendError(res, "Failed to fetch categories.", 500);
  }
};

/**
 * GET /api/categories/:code
 */
const getCategoryByCode = async (req, res) => {
  const { code } = req.params;
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("code", sql.NVarChar(10), code)
      .query(`
        SELECT
          c.IDX, c.IDXS, c.DEPTCODE, c.CATCODE, c.CATNAME,
          ISNULL(c.DEPTNAME, d.DEPTNAME) AS DEPTNAME,
          c.CRUSER, c.EDITUSER,
          CONVERT(varchar, c.CRDATE,   23) AS CRDATE,
          CONVERT(varchar, c.EDITDATE, 23) AS EDITDATE,
          c.CRTIME, c.EDITTIME,
          c.BACK, c.WEBCATID
        FROM [POSBACK_SYSTEM].[dbo].[tb_CATEGORY] c
        LEFT JOIN [POSBACK_SYSTEM].[dbo].[tb_DEPARTMENT] d
          ON d.DEPTCODE = c.DEPTCODE
        WHERE c.CATCODE = @code
      `);

    if (!result.recordset.length)
      return sendError(res, "Category not found.", 404);

    return sendSuccess(res, { data: result.recordset[0] });
  } catch (err) {
    console.error("[CatController] getCategoryByCode:", err);
    return sendError(res, "Failed to fetch category.", 500);
  }
};

/**
 * Shared save — uses Sp_CategorySave stored procedure
 * Matches: @DEPTCODE, @DEPTNAME, @CATCODE, @CATNAME, @USER, @DATE (DD/MM/YYYY), @TIME (CHAR 15)
 */
const saveCategory = async (req, res, isNew) => {
  const catCode  = isNew ? req.body.catCode  : req.params.code;
  const { deptCode, deptName, catName, username } = req.body;

  if (!catCode?.trim() || !deptCode?.trim() || !catName?.trim())
    return sendError(res, "Department Code, Category Code and Category Name are required.", 400);

  try {
    const pool = await getPool();

    const now  = new Date();
    const dd   = String(now.getDate()).padStart(2, "0");
    const mm   = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    const date = `${dd}/${mm}/${yyyy}`;                      // "30/04/2026"

    const hh  = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const sec = String(now.getSeconds()).padStart(2, "0");
    const time = `${hh}:${min}:${sec}`.padEnd(15, " ");     // "14:35:22"

    await pool
      .request()
      .input("DEPTCODE", sql.NVarChar(10), deptCode.trim().toUpperCase())
      .input("DEPTNAME", sql.NVarChar(30), (deptName || "").trim())
      .input("CATCODE",  sql.NVarChar(10), catCode.trim().toUpperCase())
      .input("CATNAME",  sql.NVarChar(30), catName.trim())
      .input("USER",     sql.NVarChar(50), (username || "SYSTEM").trim())
      .input("DATE",     sql.Char(10),     date)
      .input("TIME",     sql.Char(15),     time)
      .execute("Sp_CategorySave");

    const upperCode = catCode.trim().toUpperCase();
    const message = isNew
      ? `Category "${upperCode}" created successfully.`
      : `Category "${upperCode}" updated successfully.`;

    return sendSuccess(res, {}, message, isNew ? 201 : 200);
  } catch (err) {
    console.error("[CatController] saveCategory:", err);
    return sendError(res, "Failed to save category.", 500);
  }
};

// POST /api/categories
const createCategory = (req, res) => saveCategory(req, res, true);

// PUT /api/categories/:code
const updateCategory = (req, res) => saveCategory(req, res, false);

/**
 * DELETE /api/categories/:code
 */
const deleteCategory = async (req, res) => {
  const { code } = req.params;
  try {
    const pool = await getPool();

    // 1. Check exists
    const exists = await pool
      .request()
      .input("code", sql.NVarChar(10), code)
      .query(`SELECT IDX FROM [POSBACK_SYSTEM].[dbo].[tb_CATEGORY] WHERE CATCODE = @code`);

    if (!exists.recordset.length)
      return sendError(res, "Category not found.", 404);

    // 2. Check product linkage (adjust column name if yours differs)
    const productCheck = await pool
      .request()
      .input("code", sql.NVarChar(10), code)
      .query(`
        SELECT TOP 1 PRODUCT_CODE
        FROM [POSBACK_SYSTEM].[dbo].[tb_PRODUCT]
        WHERE CATCODE = @code
      `);

    if (productCheck.recordset.length)
      return sendError(
        res,
        "Cannot delete category. Products are assigned to this category.",
        409
      );

    // 3. Delete
    await pool
      .request()
      .input("code", sql.NVarChar(10), code)
      .query(`DELETE FROM [POSBACK_SYSTEM].[dbo].[tb_CATEGORY] WHERE CATCODE = @code`);

    return sendSuccess(res, {}, "Category deleted successfully.");
  } catch (err) {
    console.error("[CatController] deleteCategory:", err);
    return sendError(res, "Failed to delete category.", 500);
  }
};

module.exports = {
  getCategories,
  getCategoryByCode,
  createCategory,
  updateCategory,
  deleteCategory,
};