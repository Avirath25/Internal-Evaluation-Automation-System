// backend/server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Create / connect to database
const db = new sqlite3.Database(path.join(__dirname, "../data/school.db"), (err) => {
  if (err) console.log("DB Error:", err);
  else console.log("Database connected.");
});

// Create tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS branches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS semesters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number INTEGER UNIQUE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sem_id INTEGER,
      branch_id INTEGER,
      name TEXT,
      UNIQUE(sem_id, branch_id, name),
      FOREIGN KEY (sem_id) REFERENCES semesters(id),
      FOREIGN KEY (branch_id) REFERENCES branches(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usn TEXT,
      name TEXT,
      sem_id INTEGER,
      branch_id INTEGER,
      section_id INTEGER,
      UNIQUE(usn, sem_id, branch_id, section_id),
      FOREIGN KEY (sem_id) REFERENCES semesters(id),
      FOREIGN KEY (branch_id) REFERENCES branches(id),
      FOREIGN KEY (section_id) REFERENCES sections(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      code TEXT,
      credits INTEGER,
      sem_id INTEGER,
      branch_id INTEGER
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS marks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      subject_id INTEGER,
      json_data TEXT,
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (subject_id) REFERENCES subjects(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS usn_patterns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pattern_text TEXT,
      description TEXT,
      active INTEGER DEFAULT 1
  )`);
});

// --------------------------------------
// Helper Functions
// --------------------------------------
function upsertSemester(number) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT id FROM semesters WHERE number = ?`, [number], (err, row) => {
      if (err) return reject(err);
      if (row) return resolve(row.id);
      db.run(`INSERT INTO semesters (number) VALUES (?)`, [number], function (err2) {
        if (err2) return reject(err2);
        resolve(this.lastID);
      });
    });
  });
}

function upsertBranch(name) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT id FROM branches WHERE name = ?`, [name], (err, row) => {
      if (err) return reject(err);
      if (row) return resolve(row.id);
      db.run(`INSERT INTO branches (name) VALUES (?)`, [name], function (err2) {
        if (err2) return reject(err2);
        resolve(this.lastID);
      });
    });
  });
}

function upsertSection(sem_id, branch_id, name) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT id FROM sections WHERE sem_id = ? AND branch_id = ? AND name = ?`,
      [sem_id, branch_id, name],
      (err, row) => {
        if (err) return reject(err);
        if (row) return resolve(row.id);
        db.run(
          `INSERT INTO sections (sem_id, branch_id, name) VALUES (?,?,?)`,
          [sem_id, branch_id, name],
          function (err2) {
            if (err2) return reject(err2);
            resolve(this.lastID);
          }
        );
      }
    );
  });
}

// -------------------------------------------------
// API ROUTES
// -------------------------------------------------

// List Semesters
app.get("/api/semesters", (req, res) => {
  db.all(`SELECT id, number FROM semesters ORDER BY number`, [], (err, rows) => {
    if (err) return res.json({ error: err.message });
    res.json(rows);
  });
});

// List Branches
app.get("/api/branches", (req, res) => {
  db.all(`SELECT id, name FROM branches ORDER BY name`, [], (err, rows) => {
    if (err) return res.json({ error: err.message });
    res.json(rows);
  });
});

// List Sections for a given sem + branch
app.get("/api/sections", (req, res) => {
  const { sem, branch } = req.query;
  if (!sem || !branch) return res.json([]);

  db.get(`SELECT id FROM semesters WHERE number = ?`, [sem], (err, semRow) => {
    if (!semRow) return res.json([]);

    db.get(`SELECT id FROM branches WHERE name = ?`, [branch], (err2, brRow) => {
      if (!brRow) return res.json([]);

      db.all(
        `SELECT id, name FROM sections WHERE sem_id = ? AND branch_id = ? ORDER BY name`,
        [semRow.id, brRow.id],
        (e, rows) => {
          if (e) return res.json({ error: e.message });
          res.json(rows);
        }
      );
    });
  });
});

// Fetch students for a given class
app.get("/api/students", (req, res) => {
  const { sem, branch, section } = req.query;

  const q = `
    SELECT students.usn, students.name
    FROM students
    JOIN semesters ON students.sem_id = semesters.id
    JOIN branches ON students.branch_id = branches.id
    JOIN sections ON students.section_id = sections.id
    WHERE semesters.number = ?
      AND branches.name = ?
      AND sections.name = ?
    ORDER BY students.usn
  `;

  db.all(q, [sem, branch, section], (err, rows) => {
    if (err) return res.json({ error: err.message });
    res.json(rows);
  });
});

// BULK Insert Students
app.post("/api/students/bulk", async (req, res) => {
  try {
    const { sem, branch, section, rows } = req.body;

    const sem_id = await upsertSemester(Number(sem));
    const branch_id = await upsertBranch(branch);
    const section_id = await upsertSection(sem_id, branch_id, section);

    let added = 0,
      updated = 0,
      skipped = 0;

    rows.forEach((r) => {
      const usn = r.usn || r.USN;
      const name = r.name || r.Name;

      if (!usn || !name) {
        skipped++;
        return;
      }

      db.get(
        `SELECT * FROM students WHERE usn=? AND sem_id=? AND branch_id=? AND section_id=?`,
        [usn, sem_id, branch_id, section_id],
        (err, row) => {
          if (!row) {
            db.run(
              `INSERT INTO students (usn, name, sem_id, branch_id, section_id)
               VALUES (?,?,?,?,?)`,
              [usn, name, sem_id, branch_id, section_id],
              () => added++
            );
          } else {
            if (row.name !== name) {
              db.run(`UPDATE students SET name=? WHERE id=?`, [name, row.id], () => {
                updated++;
              });
            } else skipped++;
          }
        }
      );
    });

    setTimeout(() => {
      res.json({ added, updated, skipped });
    }, 400);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload marks (old)
app.post("/upload-marks", (req, res) => {
  res.json({ imported: req.body.rows.length });
});

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Start server
app.listen(3000, () => console.log("Server running on port 3000"));
