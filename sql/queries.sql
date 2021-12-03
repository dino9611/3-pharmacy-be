-- ! admin actions:
-- * admin CREATE actions
CALL handle_create_
-- * admin UPDATE actions
CALL handle_update_stock(1, 156, 1); -- (_product_id, _stock_change), 
CALL handle_update_amountInUnit(1, 2, 7.9, 1); -- (_product_id, _raw_material_id, _amountInUnit, _admin_id)
CALL handle_update_inventory(2, 400, 1); -- (_raw_material_id, _inventory, _admin_id)
-- * admin READ actions
-- * admin DELETE actions

-- ! user actions:
-- * user CREATE actions
-- * user READ actions
-- * user UPDATE actions
CALL handle_checkout_cart(1); -- (_user_id)
-- * user DELETE actions
