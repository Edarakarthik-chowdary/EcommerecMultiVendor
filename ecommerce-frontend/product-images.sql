-- Review this file before running it in MySQL.
-- It replaces image rows only for products listed below.
USE Ecommercevendor;

DELETE FROM product_images WHERE product_id = 2;
INSERT INTO product_images (product_id, image_url) VALUES (2, '/images/2-wireless-bluetooth-headphones.jpg');

DELETE FROM product_images WHERE product_id = 5;
INSERT INTO product_images (product_id, image_url) VALUES (5, '/images/5-daily-skin-care-cream.jpg');

DELETE FROM product_images WHERE product_id = 6;
INSERT INTO product_images (product_id, image_url) VALUES (6, '/images/6-fitness-yoga-mat.jpg');

DELETE FROM product_images WHERE product_id = 7;
INSERT INTO product_images (product_id, image_url) VALUES (7, '/images/7-wireless-gaming-mouse.jpg');

DELETE FROM product_images WHERE product_id = 8;
INSERT INTO product_images (product_id, image_url) VALUES (8, '/images/8-mechanical-gaming-keyboard.jpg');

DELETE FROM product_images WHERE product_id = 10;
INSERT INTO product_images (product_id, image_url) VALUES (10, '/images/10-laptop-backpack.jpg');

DELETE FROM product_images WHERE product_id = 11;
INSERT INTO product_images (product_id, image_url) VALUES (11, '/images/11-smart-led-desk-lamp.jpg');

