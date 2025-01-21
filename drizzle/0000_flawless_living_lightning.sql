CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`taskId` integer,
	`titulo` text,
	`fecha_vencimiento` text,
	`cliente` text NOT NULL,
	`correo` text NOT NULL,
	`notas` text,
	`image_1_base64` text,
	`image_2_base64` text,
	`image_3_base64` text,
	`image_4_base64` text,
	`firma_base64` text,
	`firma_2` text,
	`image_persona_2` text,
	`foto_base64` text,
	`status_envio` integer DEFAULT 1,
	`marca` integer DEFAULT 1
);
