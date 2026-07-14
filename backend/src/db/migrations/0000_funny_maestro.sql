CREATE TABLE `lapangan` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nama` varchar(255) NOT NULL,
	`harga` int NOT NULL,
	CONSTRAINT `lapangan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reservasi` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lapangan_id` int,
	`user_id` int,
	`tanggal` date NOT NULL,
	`jam` time NOT NULL,
	`durasi` int NOT NULL,
	`status` varchar(50) DEFAULT 'Menunggu Pembayaran',
	CONSTRAINT `reservasi_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nama` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role` varchar(50) NOT NULL DEFAULT 'user',
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `reservasi` ADD CONSTRAINT `reservasi_lapangan_id_lapangan_id_fk` FOREIGN KEY (`lapangan_id`) REFERENCES `lapangan`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reservasi` ADD CONSTRAINT `reservasi_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;