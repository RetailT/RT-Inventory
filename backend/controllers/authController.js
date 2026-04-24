const { getPool, sql } = require("../config/db");
const jwt = require("jsonwebtoken");

const ALL_PERMISSION_FIELDS = [
  "DEPARTMENT","CATEGORY","SCATEGORY","VENDOR","PRODUCTS","PORDER","MASTERFILE","GRN","SUPRET","TOG",
  "TRANSACTIONMENU","PORDERREP","GRNREP","SUPRETREP","TRANSACTIONREP","REPORTS","STOCKREP","SALESREP",
  "IFUNCTION","DAYEND","MOVEMENT","CONTROL","CUSTDET","SALESMANDET","TOGREP","GROUP1","GROUP2",
  "DEBTORREP","CREDITORREP","INVOICE","INVOICEREP","CUSTPAY","CUSTCHQRET","SUPPAY","STADJUST",
  "STADJUSTQ","STADJUSTREP","CHANGEPASS","BUNDLE","INGREDIENTS","STVARIANCEQ","GIFTDET","GIFTREP",
  "GIFTPRINT","LOYALTYCUSTDET","LOYGIFTREP","LOYALTYREP","PROMOTIONDET","AREADET","GUIDEDET",
  "TOWNDET","AUTHORIZED","AUTHORIZED_GRN","AUTHORIZED_PRN","AUTHORIZED_TOG","CASHIERDET","CHEQUEDET",
  "CUSTOUTSTANDINPUT","PRODUCTREFRESH","TRANSSUMREP","SMANWISEREP","CUSTWISEREP","PRODUCTMOVEDET",
  "MOREDET","CURRSALE","JOURNAL_VIEW","LOADING","UNLOADING","LOADINGREP","UNLOADINGREP",
  "DATAADJUSTMENT","DAYENDREFRESH","LOGDETAILS","TOGACCEPT","TOGACCEPTREP","CASHBOOK","SPOFFER",
  "ACCOUNTUPLOAD","BARCODE","BASKETANALYS","COPYINVOICE","PRICECHANGEREP","QUOTATION","QUOTATIONREP",
  "TOGACCEPTEDIT","BARPRINT_MANUAL","COSTPRICE_CHANGE","UNITPRICE_CHANGE","WPRICE_CHANGE",
  "MINPRICE_CHANGE","PRICE1_CHANGE","PRICE2_CHANGE","PRICE3_CHANGE","GRNCOSTPRICE_CHANGE",
  "GRNUNITPRICE_CHANGE","GRNWPRICE_CHANGE","GRNMINPRICE_CHANGE","PRODUCTCOST_VIEW","INVOICECOST_VIEW",
  "AUTHORIZED_PRODUCTEDIT","STOCK_RECONCILATION","STOCK_RECONCILATION_DATAENTRY","DATAEXPORT",
  "TOG_REJECT","VENDOR_COSTLOCKED","GRNSAVE","BACKUP_USER","ATTENDANCE","USERLOGINRESET","LOGIN"
];

// Cache for available columns
let availableColumnsCache = null;
let lastCacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000;

async function getExistingColumns(pool) {
  const now = Date.now();
  if (availableColumnsCache && lastCacheTime && (now - lastCacheTime) < CACHE_DURATION) {
    return availableColumnsCache;
  }
  try {
    const result = await pool.request().query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'tb_USERS'
      AND DATA_TYPE = 'char'
      AND CHARACTER_MAXIMUM_LENGTH = 1
    `);
    availableColumnsCache = result.recordset.map(col => col.COLUMN_NAME);
    lastCacheTime = now;
    console.log(`📋 Available permission columns: ${availableColumnsCache.length} columns found`);
    return availableColumnsCache;
  } catch (err) {
    console.error("Error fetching columns:", err);
    return ["LOGIN", "DEPARTMENT", "CATEGORY"];
  }
}

// Helper: check if a char(1) DB value is enabled ('T' or 't')
const isEnabled = (val) => val && val.toString().trim().toUpperCase() === 'T';

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  console.log(`🔍 Login attempt: ${username}`);

  try {
    const pool = await getPool();
    const existingColumns = await getExistingColumns(pool);

    const validPermissionFields = ALL_PERMISSION_FIELDS.filter(f => existingColumns.includes(f));
    const loginExists = existingColumns.includes("LOGIN");
    const permFields = validPermissionFields.filter(f => f !== "LOGIN");

    // Build SELECT
    const selectFields = ["IDX", "USER_NAME", "PASSWORD", ...(loginExists ? ["LOGIN"] : []), ...permFields];
    const selectQuery = selectFields.map(f => `[${f}]`).join(", ");

    const result = await pool
      .request()
      .input("username", sql.NVarChar, username.trim())
      .query(`
        SELECT TOP 1 ${selectQuery}
        FROM [dbo].[tb_USERS]
        WHERE LTRIM(RTRIM(UPPER([USER_NAME]))) = LTRIM(RTRIM(UPPER(@username)))
      `);

    if (result.recordset.length === 0) {
      console.log(`❌ User not found: ${username}`);
      return res.status(401).json({ message: "Invalid username or password." });
    }

    const row = result.recordset[0];
    console.log(`✅ User found: ${row.USER_NAME}`);

    // ── 1. Password check ──────────────────────────────────────
    const dbPassword = row.PASSWORD ? row.PASSWORD.trim() : "";
    if (dbPassword !== password.trim()) {
      console.log("❌ Password mismatch");
      return res.status(401).json({ message: "Invalid username or password." });
    }
    console.log("✅ Password matched");

    // ── 2. LOGIN column check ──────────────────────────────────
    // LOGIN = 'T' means the account is active.
    // LOGIN = 'F' (or anything else) means disabled.
    if (loginExists) {
      const loginVal = row.LOGIN;
      console.log(`📊 LOGIN value: '${loginVal}'`);
      if (!isEnabled(loginVal)) {
        console.log(`❌ Account disabled for user: ${username}`);
        return res.status(401).json({
          message: "Your account is disabled. Please contact the administrator.",
        });
      }
      console.log("✅ Account is active (LOGIN = T)");
    }

    // ── 3. Build permissions ───────────────────────────────────
    const permissions = {};
    permFields.forEach((field) => {
      permissions[field] = isEnabled(row[field]);
    });
    permissions["LOGIN"] = true; // passed the check above

    // Default false for any fields not in DB
    ALL_PERMISSION_FIELDS.forEach((field) => {
      if (!permissions.hasOwnProperty(field)) {
        permissions[field] = false;
      }
    });

    const userData = {
      idx: row.IDX,
      username: row.USER_NAME ? row.USER_NAME.trim() : "",
      department: row.DEPARTMENT ? String(row.DEPARTMENT).trim() : null,
      permissions,
    };

    const token = jwt.sign(
      userData,
      process.env.JWT_SECRET || "ims_secret_key",
      { expiresIn: "8h" }
    );

    console.log(`✅ Login success: ${userData.username}`);
    console.log(`📊 Active permissions: ${Object.values(permissions).filter(Boolean).length}`);

    return res.json({ ...userData, token });

  } catch (err) {
    console.error("❌ Login error:", err);
    const errorMessage =
      process.env.NODE_ENV === "development"
        ? `Server error: ${err.message}`
        : "Server error. Please try again.";
    return res.status(500).json({ message: errorMessage });
  }
};

module.exports = { login };