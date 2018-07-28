const mysql = require('mysql');
const inquirer = require('inquirer');
let totalItems = 0;

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    port: 3306,
    password: "PASSWORD",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("Database Connected");
});

function insert() {//Used This Function to insert the 10 initial items
    let sql = "INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ?";
    let values = [
        ['Apple Iphone X', 'Cell Phones', 1145.00, 30],
        ['Google Pixel', 'Cell Phones', 729.95, 20],
        ['Samsung Galaxy S9', 'Cell Phones', 710.31, 30],
        ['XBOX ONE S', 'Gaming Consoles', 269.99, 10],
        ['PlayStation 4 Pro', 'Gaming Consoles', 499.99, 10],
        ['Nintendo Switch', 'Gaming Consoles', 299.00, 10],
        ['Starcraft 2: Battle Chest', 'PC Games', 19.99, 50],
        ['Warcraft 3: Battle Chest', 'PC Games', 34.98, 50],
        ['Call of Duty: Black Ops 4', 'Video Games', 59.99, 50],
        ['Silly Putty', 'Toys', 24.99, 50]
    ];
    connection.query(sql, [values], function (err, result) {
        if (err) throw err;
        console.log("INSERT SUCCESSFUL");
    });
};

function forSale() {//(Called on Line 124)(Called inside continueShopping)Display Items For Sale
    let sql = "SELECT * FROM products";
    connection.query(sql, function (err, result) {
        if (err) throw err;
        totalItems = result.length;
        for (let i = 0; i < result.length; i++) {
            console.log("\nID: " + result[i].item_id + "\nProduct: " + result[i].product_name + "\nDepartment: " + result[i].department_name + "\nPrice: $" + result[i].price + "\nIn Stock: " + result[i].stock_quantity);
        };
    });
};

let selectItem = function () {//(Called on line 127)(Potential Call inside of selectQuantity)(Potential Call inside continueShopping)Prompts User For Item Selection by item_id
    inquirer.prompt([
        {
            type: "input",
            name: "item",
            message: "Select Item ID:"
        }
    ]).then(function (input) {
        if (input.item <= totalItems && input.item > 0) {
            let sql = "SELECT * FROM products WHERE item_id = " + input.item;
            connection.query(sql, function (err, result) {
                if (err) throw err;
                console.log("Item Selected: "+result[0].product_name);
                selectQuantity(result[0].item_id, result[0].stock_quantity, result[0].product_name, result[0].price);
            });
        } else {
            console.log("\n"+input.item+": Invalid Item ID\n");
            selectItem();
        };
    });
};

let selectQuantity = function (itemid, quantity, name, price) {// (Called inside of selectItem() so that we can pass in the values from the select query) Prompts User for the Quantity of the Item they selected for purchase. Once Selected the Transaction is completed if possible, Database is Updated, and Logs(displays) a Recipt for the Customer.
    inquirer.prompt([
        {
            type: "input",
            name: "quantity",
            message: "Select Quantity:"
        }
    ]).then(function (input) {
        if (input.quantity <= quantity && input.quantity >= 0) {
            var sql = "UPDATE products SET stock_quantity = " + quantity + " - " + input.quantity + " WHERE item_id = " + itemid;
            connection.query(sql, function (err, result) {
                if (err) throw err;
                console.log("Thank You!!!\nItem(s) Purchased: " + name + "\nQuantity: " + input.quantity + "\nTotal: $" + (price * input.quantity).toFixed(2));
            });
            setTimeout(() => {
                continueShopping();
            }, 1000);
        } else {
            if (input.quantity > quantity) {
                console.log("\nSorry, we can't fulfill order of " + input.quantity + " for " + name + " at this time.\n\n****Redirecting to Item Selection****\n");
                setTimeout(() => {
                    selectItem();
                }, 1000);
            } else {
                console.log("Invalid Entry\n\n****Redirecting to Item Selection****\n");
                setTimeout(() => {
                    selectItem();
                }, 1000);
            };
        };
    });
};

let continueShopping = function () {// (Called inside of selectQuantity) After the User selects a valid quantity for purchase & recieves thier receipt. This then prompts the user with a Yes/No list to choose from regarding wether they would like to continue shopping or not. IF YES show updated item list & prompt Item selection, IF NO thank user for using application & end connection.
    inquirer.prompt([
        {
            type: "list",
            name: "cs",
            message: "Continue Shopping?",
            choices: ["Yes","No"]
        }
    ]).then(function(input){
        switch(input.cs){
            case ("Yes"): forSale(); setTimeout(() => { selectItem();}, 1000);
            break;
            case ("No"): console.log("Thank You for Shopping with Bamazon!"); setTimeout(() => { connection.end();}, 1000);
            break;
            default: console.log("UH OH :(");
            break;
        }
    });
};

forSale();

setTimeout(() => {
    selectItem();
}, 300);