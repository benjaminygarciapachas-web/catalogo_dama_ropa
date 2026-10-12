const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'catalogo.sqlite');
const initSqlPath = path.resolve(__dirname, 'init.sql');

// Instancia de base de datos SQL
const db = new DatabaseSync(dbPath);

// Habilitar claves foráneas y modo WAL con sincronización física garantizada en disco
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = FULL;');
db.exec('PRAGMA wal_autocheckpoint = 100;');

// Inicializar esquema si las tablas no existen
function initDatabase() {
  try {
    if (fs.existsSync(initSqlPath)) {
      const sql = fs.readFileSync(initSqlPath, 'utf-8');
      db.exec(sql);
      console.log('✅ [DATABASE] Tablas y esquema SQL inicializados correctamente.');
    }

    // 1. Auto-migración segura de columnas en caso de bases de datos preexistentes
    const columns = db.prepare('PRAGMA table_info(productos)').all().map(c => c.name);
    if (!columns.includes('code')) {
      db.exec('ALTER TABLE productos ADD COLUMN code VARCHAR(100);');
      console.log('✅ [DATABASE] Columna `code` agregada a productos.');
    }
    if (!columns.includes('images')) {
      db.exec('ALTER TABLE productos ADD COLUMN images TEXT;');
      console.log('✅ [DATABASE] Columna `images` agregada a productos.');
    }

    // 2. Roles
    db.exec(`
      INSERT OR IGNORE INTO roles (id, name, description) VALUES
      (1, 'admin', 'Administrador con control total del catálogo'),
      (2, 'cliente', 'Cliente visitante del catálogo');
    `);

    // 3. Usuario Administrador PATTYps
    const adminUser = process.env.ADMIN_USER || 'PATTYps';
    const adminPass = process.env.ADMIN_PASS || 'PATTYpschincha452416';
    const existingAdmin = db.prepare('SELECT id FROM usuarios WHERE username = ?').get(adminUser);
    if (!existingAdmin) {
      db.prepare('INSERT INTO usuarios (username, password_hash, role_id) VALUES (?, ?, ?)')
        .run(adminUser, adminPass, 1);
      console.log('👑 [DATABASE] Usuario Administrador PATTYps creado.');
    }

    // 4. Categoría principal: Ropa (única y más grande)
    db.exec(`
      DELETE FROM categorias WHERE id != 1;
      INSERT OR IGNORE INTO categorias (id, name, slug, icon) VALUES
      (1, 'Ropa', 'ropa', 'shirt');
      UPDATE categorias SET name = 'Ropa', slug = 'ropa', icon = 'shirt' WHERE id = 1;
    `);

    // 5. Subcategorías exactas para CATALOGO DAMA ROPA:
    // Subdividida en Marca y Normal
    const subcats = [
      // Grupo Marca (5 subcategorías)
      { id: 1, categoria_id: 1, tipo_grupo: 'Marca', name: 'polivestidos de marca', slug: 'polivestidos-de-marca' },
      { id: 2, categoria_id: 1, tipo_grupo: 'Marca', name: 'polos y blusas de marca', slug: 'polos-y-blusas-de-marca' },
      { id: 3, categoria_id: 1, tipo_grupo: 'Marca', name: 'chompas y casacas de marca', slug: 'chompas-y-casacas-de-marca' },
      { id: 4, categoria_id: 1, tipo_grupo: 'Marca', name: 'pantalones shrots marca', slug: 'pantalones-shrots-marca' },
      { id: 5, categoria_id: 1, tipo_grupo: 'Marca', name: 'conjuntos de marca', slug: 'conjuntos-de-marca' },
      // Grupo Normal (11 subcategorías)
      { id: 6, categoria_id: 1, tipo_grupo: 'Normal', name: 'pantalones, enterizos y jeans', slug: 'pantalones-enterizos-y-jeans' },
      { id: 7, categoria_id: 1, tipo_grupo: 'Normal', name: 'shorts y faldas', slug: 'shorts-y-faldas' },
      { id: 8, categoria_id: 1, tipo_grupo: 'Normal', name: 'plussize', slug: 'plussize' },
      { id: 9, categoria_id: 1, tipo_grupo: 'Normal', name: 'vestidos', slug: 'vestidos' },
      { id: 10, categoria_id: 1, tipo_grupo: 'Normal', name: 'polos', slug: 'polos' },
      { id: 11, categoria_id: 1, tipo_grupo: 'Normal', name: 'blusas', slug: 'blusas' },
      { id: 12, categoria_id: 1, tipo_grupo: 'Normal', name: 'poleras', slug: 'poleras' },
      { id: 13, categoria_id: 1, tipo_grupo: 'Normal', name: 'casacas', slug: 'casacas' },
      { id: 14, categoria_id: 1, tipo_grupo: 'Normal', name: 'chompas', slug: 'chompas' },
      { id: 15, categoria_id: 1, tipo_grupo: 'Normal', name: 'conjuntos', slug: 'conjuntos' },
      { id: 16, categoria_id: 1, tipo_grupo: 'Normal', name: 'ropa_fitnes', slug: 'ropa-fitnes' }
    ];

    // Limpiar subcategorías antiguas que no correspondan
    db.exec(`DELETE FROM subcategorias WHERE id > 16 OR categoria_id != 1;`);

    const insertSubcat = db.prepare(`
      INSERT OR REPLACE INTO subcategorias (id, categoria_id, tipo_grupo, name, slug)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const sc of subcats) {
      insertSubcat.run(sc.id, sc.categoria_id, sc.tipo_grupo, sc.name, sc.slug);
    }
  } catch (error) {
    console.error('❌ [DATABASE] Error al inicializar esquema SQL:', error);
  }
}

initDatabase();

// Métodos auxiliares para consultas limpias y seguras
const dbHelper = {
  // Retorna todas las filas encontradas
  all(sql, params = []) {
    try {
      const stmt = db.prepare(sql);
      const rows = stmt.all(...params);
      // Convertir prototipos u objetos limpios
      return rows.map(r => ({ ...r }));
    } catch (err) {
      console.error(`[DB ERROR all] ${sql}`, err);
      throw err;
    }
  },

  // Retorna una única fila
  get(sql, params = []) {
    try {
      const stmt = db.prepare(sql);
      const row = stmt.get(...params);
      return row ? { ...row } : null;
    } catch (err) {
      console.error(`[DB ERROR get] ${sql}`, err);
      throw err;
    }
  },

  // Ejecuta INSERT, UPDATE o DELETE
  run(sql, params = []) {
    try {
      const stmt = db.prepare(sql);
      const result = stmt.run(...params);
      return {
        changes: Number(result.changes),
        lastInsertRowid: Number(result.lastInsertRowid)
      };
    } catch (err) {
      console.error(`[DB ERROR run] ${sql}`, err);
      throw err;
    }
  },

  // Ejecuta sentencias directas
  exec(sql) {
    return db.exec(sql);
  },

  raw: db
};

module.exports = dbHelper;
