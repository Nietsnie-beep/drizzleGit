import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Tabla de tareas
export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  list_id: integer('list_id')
    .notNull()
    .references(() => lists.id),
  cliente: text('cliente').notNull(),
  correo: text('correo').notNull(),
  notas: text('notas'),
  imagen1: text('imagen1'),
  imagen2: text('imagen2'),
  imagen3: text('imagen3'),
  imagen4: text('imagen4'),
  firma: text('firma'),
  foto: text('foto'),
});

// Tabla de listas
export const lists = sqliteTable('lists', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
});

// Exportar el tipo Task para usar como interfaz en tu aplicación
export type Task = typeof tasks.$inferSelect;