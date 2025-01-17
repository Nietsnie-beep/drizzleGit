ALTER TABLE `tasks` ADD `cliente` text NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `correo` text NOT NULL;--> statement-breakpoint
ALTER TABLE `tasks` ADD `notas` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `imagen1` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `imagen2` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `imagen3` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `imagen4` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `firma` text;--> statement-breakpoint
ALTER TABLE `tasks` ADD `foto` text;--> statement-breakpoint
ALTER TABLE `tasks` DROP COLUMN `name`;