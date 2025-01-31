-- Create users table
CREATE TABLE IF NOT EXISTS `main`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `createdAt` BIGINT NULL DEFAULT NULL,
  `updatedAt` BIGINT NULL DEFAULT NULL,
  `name` VARCHAR(128) CHARACTER SET 'utf8mb4' COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `email` VARCHAR(128) CHARACTER SET 'utf8mb4' COLLATE utf8mb4_general_ci NOT NULL,
  `password` VARCHAR(255) CHARACTER SET 'utf8mb4' COLLATE utf8mb4_general_ci NOT NULL,
  `contact_number` VARCHAR(255) CHARACTER SET 'utf8mb4' COLLATE utf8mb4_general_ci NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT '1',
  `role_id` INT NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id` (`id` ASC) VISIBLE,
  UNIQUE INDEX `email` (`email` ASC) VISIBLE)
  ENGINE = InnoDB
  AUTO_INCREMENT = 1;

-- Add key for relation between tables
ALTER TABLE `main`.`brands`
  ADD COLUMN `user_id` INT NULL DEFAULT NULL,
  ADD CONSTRAINT `fk_brands_users` FOREIGN KEY (`user_id`) REFERENCES `main`.`users`(`id`) ON DELETE SET NULL;

-- Export data from brands to users
INSERT INTO `main`.`users` (
  `createdAt`, `updatedAt`, `name`, `email`, `password`, `contact_number`, `is_active`, `role_id`
)
SELECT
  `createdAt`,
  `updatedAt`,
  `brand_name` AS `name`,
  `email`,
  `password`,
  `contact_no` AS `contact_number`,
  `is_activated` AS `is_active`,
  `role_id`
FROM `main`.`brands`;

-- Relate brands table with users by using email as key
UPDATE `main`.`brands` b
  JOIN `main`.`users` u ON b.email = u.email
SET b.user_id = u.id
WHERE b.user_id IS NULL;

-- Update user id in requested_retailers
UPDATE `main`.`requested_retailers` rr
  JOIN `main`.`brands` b ON rr.user_id = b.id
  JOIN `main`.`users` u ON b.email = u.email
SET rr.user_id = u.id;

-- Drop old fields from brands table
ALTER TABLE `main`.`brands`
  DROP COLUMN `email`,
  DROP COLUMN `password`,
  DROP COLUMN `contact_no`,
  DROP COLUMN `is_activated`,
  DROP COLUMN `role_id`;

-- Move users from staff table
INSERT INTO `main`.`users` (
  `createdAt`, `updatedAt`, `name`, `email`, `password`, `contact_number`, `is_active`, `role_id`
) SELECT
  `createdAt`,
  `updatedAt`,
  `name`,
  `email`,
  `password`,
  `contact_number`,
  `status` AS `is_active`,
  1 as `role_id` -- staff role
FROM `main`.`staff`
WHERE deleted_at is NULL;

-- And drop 'staff' table
DROP TABLE IF EXISTS `main`.`staff`;

-- The same for super_admin
INSERT INTO `main`.`users` (
  `createdAt`, `updatedAt`, `name`, `email`, `password`, `contact_number`, `is_active`, `role_id`
)
SELECT
  `createdAt`,
  `updatedAt`,
  `name`,
  `email`,
  `password`,
  `contact_number`,
  `is_enabled` AS `is_active`,
  0 AS `role_id` -- super admin role
FROM `main`.`super_admin`;

-- And drop table
DROP TABLE IF EXISTS `main`.`super_admin`;
