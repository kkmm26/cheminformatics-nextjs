CREATE TABLE `atoms` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`molecule_id` integer NOT NULL,
	`atomic_number` integer NOT NULL,
	`x` real NOT NULL,
	`y` real NOT NULL,
	`z` real NOT NULL,
	`atom_index` integer NOT NULL,
	FOREIGN KEY (`molecule_id`) REFERENCES `molecules`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `molecules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`filename` text NOT NULL,
	`uploaded_at` text NOT NULL,
	`comment` text,
	`method` text,
	`zpve_correction` real,
	`free_energy_correction` real,
	`zpve_energy` real,
	`free_energy` real,
	`total_entropy` real,
	`log_path` text NOT NULL
);
