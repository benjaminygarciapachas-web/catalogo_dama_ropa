import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'src/config/catalogo.sqlite');
const uploadsDir = path.resolve(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Inicializar DB
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON;');

// Ejecutar init.sql
const initSql = fs.readFileSync(path.resolve(__dirname, 'src/config/init.sql'), 'utf-8');
db.exec(initSql);

console.log('🔄 Ejecutando inicialización limpia de estructura...');

// 1. Roles
db.exec(`
  INSERT OR IGNORE INTO roles (id, name, description) VALUES
  (1, 'admin', 'Administrador con control total del catálogo y visualización de sesiones'),
  (2, 'cliente', 'Cliente visitante del catálogo');
`);

// 2. Usuario Administrador
// Credenciales estrictas: PATTYps / PATTYpschincha452416
const adminExisting = db.prepare('SELECT id FROM usuarios WHERE username = ?').get('PATTYps');
if (!adminExisting) {
  db.prepare(`
    INSERT INTO usuarios (username, password_hash, role_id)
    VALUES (?, ?, ?)
  `).run('PATTYps', 'PATTYpschincha452416', 1);
  console.log('👑 Usuario Administrador creado: PATTYps');
}

// 3. Categorías (Ropa como única y principal)
db.exec(`
  DELETE FROM categorias WHERE id != 1;
  INSERT OR IGNORE INTO categorias (id, name, slug, icon) VALUES
  (1, 'Ropa', 'ropa', 'shirt');
  UPDATE categorias SET name = 'Ropa', slug = 'ropa', icon = 'shirt' WHERE id = 1;
`);

// 4. Subcategorías Exactas (Marca y Normal)
const subcats = [
  // Ropa - Marca
  { id: 1, categoria_id: 1, tipo_grupo: 'Marca', name: 'polivestidos de marca', slug: 'polivestidos-de-marca' },
  { id: 2, categoria_id: 1, tipo_grupo: 'Marca', name: 'polos y blusas de marca', slug: 'polos-y-blusas-de-marca' },
  { id: 3, categoria_id: 1, tipo_grupo: 'Marca', name: 'chompas y casacas de marca', slug: 'chompas-y-casacas-de-marca' },
  { id: 4, categoria_id: 1, tipo_grupo: 'Marca', name: 'pantalones shrots marca', slug: 'pantalones-shrots-marca' },
  { id: 5, categoria_id: 1, tipo_grupo: 'Marca', name: 'conjuntos de marca', slug: 'conjuntos-de-marca' },
  // Ropa - Normal
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
  { id: 16, categoria_id: 1, tipo_grupo: 'Normal', name: 'ropa_fitnes', slug: 'ropa-fitnes' },
  { id: 17, categoria_id: 1, tipo_grupo: 'Normal', name: 'blazzer', slug: 'blazzer' }
];

// Actualizar o insertar subcategorías de manera segura sin romper relaciones existentes

const insertSubcat = db.prepare(`
  INSERT OR REPLACE INTO subcategorias (id, categoria_id, tipo_grupo, name, slug)
  VALUES (?, ?, ?, ?, ?)
`);
for (const sc of subcats) {
  insertSubcat.run(sc.id, sc.categoria_id, sc.tipo_grupo, sc.name, sc.slug);
}

console.log('✅ Categorías, subcategorías y roles inicializados sin fotos de muestra.');
console.log('📷 El catálogo está limpio y listo para que el Administrador suba sus propias fotos reales.');
