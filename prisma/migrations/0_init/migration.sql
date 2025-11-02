-- CreateTable
CREATE TABLE `bills` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quotation_id` INTEGER NULL,
    `bill_no` VARCHAR(50) NULL,
    `bill_date` DATE NULL DEFAULT (curdate()),
    `subtotal` DECIMAL(10, 2) NULL,
    `vat` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `service_charge` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `total_amount` DECIMAL(10, 2) NULL,
    `payment_status` ENUM('Paid', 'Unpaid', 'Pending') NULL DEFAULT 'Unpaid',

    UNIQUE INDEX `bill_no`(`bill_no`),
    INDEX `quotation_id`(`quotation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `email` VARCHAR(100) NULL,
    `address` TEXT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `expenses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `category` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `date` DATE NULL DEFAULT (curdate()),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `income` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bill_id` INTEGER NULL,
    `description` VARCHAR(255) NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `date` DATE NULL DEFAULT (curdate()),

    INDEX `bill_id`(`bill_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `job_id` INTEGER NULL,
    `image_path` VARCHAR(255) NULL,
    `type` ENUM('Before', 'After') NULL DEFAULT 'Before',

    INDEX `job_id`(`job_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jobs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quotation_id` INTEGER NULL,
    `technician` VARCHAR(100) NULL,
    `status` ENUM('Pending', 'In Progress', 'Completed') NULL DEFAULT 'Pending',
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `remarks` TEXT NULL,

    INDEX `quotation_id`(`quotation_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quotations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_id` INTEGER NULL,
    `vehicle_id` INTEGER NULL,
    `job_type` ENUM('Accident Repair', 'Normal Painting', 'Custom Work') NULL DEFAULT 'Normal Painting',
    `parts_cost` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `paint_cost` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `labor_cost` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `service_charge` DECIMAL(10, 2) NULL DEFAULT 0.00,
    `total_estimate` DECIMAL(10, 2) NULL,
    `status` ENUM('Pending', 'Approved', 'Rejected') NULL DEFAULT 'Pending',
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `customer_id`(`customer_id`),
    INDEX `vehicle_id`(`vehicle_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('Admin', 'Staff') NULL DEFAULT 'Staff',
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vehicles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customer_id` INTEGER NULL,
    `vehicle_no` VARCHAR(20) NOT NULL,
    `brand` VARCHAR(50) NULL,
    `model` VARCHAR(50) NULL,
    `color` VARCHAR(30) NULL,
    `year` YEAR NULL,
    `type` ENUM('Car', 'Van', 'Truck', 'Bike', 'Other') NULL DEFAULT 'Car',

    INDEX `customer_id`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bills` ADD CONSTRAINT `bills_ibfk_1` FOREIGN KEY (`quotation_id`) REFERENCES `quotations`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `income` ADD CONSTRAINT `income_ibfk_1` FOREIGN KEY (`bill_id`) REFERENCES `bills`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `job_images` ADD CONSTRAINT `job_images_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_ibfk_1` FOREIGN KEY (`quotation_id`) REFERENCES `quotations`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `quotations` ADD CONSTRAINT `quotations_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `quotations` ADD CONSTRAINT `quotations_ibfk_2` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

