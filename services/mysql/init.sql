DROP TABLE IF EXISTS orders_tbl;

CREATE TABLE orders_tbl (
   id INT AUTO_INCREMENT PRIMARY KEY,
   orderNo VARCHAR(50) NOT NULL,
   productName VARCHAR(50) NOT NULL,
   price FLOAT NOT NULL,
   quantity INT NOT NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

INSERT INTO orders_tbl 
   (orderNo, productName, price, quantity) 
VALUES
   ('#1', 'healing potion', 50.0, 1),
   ('#2', 'Luck potion', 50.0, 1),
   ('#3', 'Vorpal sword', 50.0, 1),
   ('#4', 'Aegis', 50.0, 1),
   ('#5', 'Brigandine', 50.0, 1),
   ('#6', 'Boots of speed', 50.0, 1),
   ('#6', 'Ring of protection', 50.0, 1),
   ('#6', 'Cloak of elvenkind', 50.0, 1),
   ('#6', 'Blood diamond', 50.0, 1),
   ('#6', 'Barbed Heart Band', 50.0, 1),
   ('#6', 'Sanguine Edge', 50.0, 1),
   ('#6', 'Noxenraths Sword', 50.0, 1),
   ('#6', 'The Queens String', 50.0, 1),
   ('#6', 'The Duchess', 50.0, 1)
;
