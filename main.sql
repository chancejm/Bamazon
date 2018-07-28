create database bamazon;

use bamazon;

create table products(
	item_id integer(10) auto_increment not null,
    product_name varchar(300),
    department_name varchar(300),
    price decimal(10, 2),
    stock_quantity integer(10),
    primary key(item_id)
);