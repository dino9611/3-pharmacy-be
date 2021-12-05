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





CREATE DEFINER=`root`@`localhost` PROCEDURE `handle_update_priceRpPerUnit`(_raw_material_id INT, _priceRpPerUnit INT, _admin_id INT)
this_proc:BEGIN
DECLARE _error_message VARCHAR(60);
DECLARE _is_admin BOOLEAN DEFAULT (SELECT role FROM user WHERE id = _admin_id)='admin';

DECLARE _priceRpPerUnit_change INT DEFAULT _priceRpPerUnit - (SELECT priceRpPerUnit FROM raw_material WHERE id = _raw_material_id);

-- dissalow null parameter
IF (_raw_material_id IS NULL OR _priceRpPerUnit IS NULL OR _admin_id IS NULL) THEN
	SET _error_message = 'NULL parameters are not allowed';
	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = _error_message;
END IF;
-- is admin
IF NOT _is_admin OR _is_admin IS NULL THEN
	SET _error_message = 'only admins are allowed to directly change priceRpPerUnit';
	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = _error_message;
END IF;

IF _priceRpPerUnit_change = 0 THEN
-- query final result of changed values (except there are no changes)
		SELECT priceRpPerUnit FROM raw_material WHERE id = _raw_material_id;

    leave this_proc;
END IF;

-- update priceRpPerUnit
UPDATE raw_material
SET priceRpPerUnit = _priceRpPerUnit
WHERE id = _raw_material_id;

-- update productPriceRp
UPDATE product A
JOIN product_composition B On A.id = B.product_id
SET A.productPriceRp = productPriceRp + amountInUnit * _priceRpPerUnit_change
WHERE A.id IN (SELECT product_id FROM product_composition WHERE raw_material_id = _raw_material_id)
AND A.id > 0; -- add redundant condition so SQL_SAFE_UPDATES doesn't trigger (id is never negative since it is an auto incrementing primary key)

-- query final result of changed values
SELECT priceRpPerUnit FROM raw_material WHERE id = _raw_material_id;

END