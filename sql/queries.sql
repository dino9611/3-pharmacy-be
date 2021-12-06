-- ! admin actions:
-- * admin CREATE actions
-- CALL handle_create_product()
-- * admin READ actions
-- CALL is_admin(1); -- (_admin_id)
-- * admin UPDATE actions
-- raw_material
CALL handle_update_inventory(2, 10, 1); -- (_raw_material_id, _bottle_change, _admin_id)
CALL handle_update_priceRpPerUnit(1, 13000, 1); -- (_raw_material_id INT, _priceRpPerUnit INT, _admin_id INT)
-- product
CALL handle_update_amountInUnit(1, 2, 7.9, 1); -- (_product_id, _raw_material_id, _amountInUnit, _admin_id)
CALL handle_update_stock(1, 156, 1); -- (_product_id, _stock_change)
-- * admin DELETE actions

-- ! user actions:
-- * user CREATE actions
-- * user READ actions
-- * user UPDATE actions
CALL handle_checkout_cart(1); -- (_user_id)
-- * user DELETE actions
