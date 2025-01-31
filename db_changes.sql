
-- Added `in_house_business` cloumn for managing account
ALTER TABLE `accounts` ADD `in_house_business` TINYINT(1) NOT NULL DEFAULT '0' AFTER `location_name`;

-- Added `product_id` and `product_name` cloumn to map State - Location - Product
ALTER TABLE `state_location_map` ADD `product_id` VARCHAR(64) NULL AFTER `location_name`, ADD `product_name` VARCHAR(255) NULL AFTER `product_id`;

-- Added `shopify_order_id`, `shopify_tracking_number`, `shopify_tracking_link`, `shopify_tracking_timestamp` cloumn 
ALTER TABLE `fulfillments` ADD `shopify_order_id` VARCHAR(255) NULL AFTER `order_number`, ADD `shopify_tracking_number` TEXT NULL AFTER `shopify_order_id`, ADD `shopify_tracking_link`  TEXT NULL AFTER `shopify_tracking_number`, ADD `shopify_tracking_timestamp` VARCHAR(255) NULL AFTER `shopify_tracking_link`;

-- Added `is_requested` column to manage account request status
ALTER TABLE `requested_retailers` ADD `is_requested` TINYINT(1) NOT NULL DEFAULT '0' AFTER `rating`;

ALTER TABLE `state_location_map`  ADD `brand_id` VARCHAR(32) DEFAULT NULL AFTER `products`;
ALTER TABLE `product_location_map`  ADD `brand_id` VARCHAR(32) DEFAULT NULL AFTER `products`;
ALTER TABLE `fulfillments`  ADD `brand_id` VARCHAR(32) DEFAULT NULL AFTER `shopify_tracking_update_at`;

ALTER TABLE `brands`  ADD `store_name` VARCHAR(128) DEFAULT NULL AFTER `encrypted_details`;

-- ooper wali line remove karke yeh uncomment kardena  neeche wali do , and update model as well 
-- -- First, drop the existing boolean column if it was already added
-- ALTER TABLE `requested_retailers` DROP COLUMN `is_requested`;

-- -- Then, add the column back with the correct type and default
-- ALTER TABLE `requested_retailers` ADD `is_requested` VARCHAR(16) NOT NULL DEFAULT 'pending' AFTER `rating`;


-- Table structure for table `urls`
--
DROP TABLE IF EXISTS `urls`;

CREATE TABLE `urls` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `order_creation_url` VARCHAR(64) NOT NULL UNIQUE,
  `createdAt` BIGINT DEFAULT NULL,
  `updatedAt` BIGINT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


ALTER TABLE `brands`
ADD COLUMN `role_id` INT NOT NULL DEFAULT 3 AFTER `is_activated`;
--Adding commission to brands
ALTER TABLE `brands` ADD `commission` VARCHAR(128) NOT NULL DEFAULT '10' ;
-- New API to store fulfillment data
-- https://volleyapi.konnectshift.com/sync-fulfillment
