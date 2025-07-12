CREATE DATABASE IF NOT EXISTS `product_db`
/*!40100 DEFAULT CHARACTER SET utf8 */;


GRANT ALL PRIVILEGES ON `product_db`.* TO 'product_user'@'%';

FLUSH PRIVILEGES;

GRANT ALL PRIVILEGES ON `test_product_db`.* TO 'product_user'@'%';

FLUSH PRIVILEGES;

CREATE DATABASE IF NOT EXISTS `user_db`;
/*!40100 DEFAULT CHARACTER SET utf8 */;

GRANT ALL PRIVILEGES ON `user_db`.* TO 'product_user'@'%';

FLUSH PRIVILEGES;

CREATE DATABASE IF NOT EXISTS `test_user_db`;
/*!40100 DEFAULT CHARACTER SET utf8 */;

GRANT ALL PRIVILEGES ON `test_user_db`.* TO 'product_user'@'%';

FLUSH PRIVILEGES;

USE `product_db`;