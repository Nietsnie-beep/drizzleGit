import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Tabla de tareas
export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  taskId: integer('taskId'),
  titulo: text('titulo'),
  fecha_vencimiento: text('fecha_vencimiento'),
  cliente: text('cliente').notNull(),
  correo: text('correo').notNull(),
  notas: text('notas'),
  image_1_base64: text('image_1_base64'),
  image_2_base64: text('image_2_base64'),
  image_3_base64: text('image_3_base64'),
  image_4_base64: text('image_4_base64'),
  firma_base64: text('firma_base64'),
  firma_2: text('firma_2'),
  image_persona_2: text('image_persona_2'),
  foto_base64: text('foto_base64'),
  status_envio: integer('status_envio').default(1),
  marca: integer('marca').default(1),
});


// Exportar el tipo Task para usar como interfaz en tu aplicación
export type Task = typeof tasks.$inferSelect;