// Initializes the npm packages used
var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table");

// Initializes the connection variable to sync with a MySQL database
var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "Tatum",

    // Your password
    password: "America1990",
    database: "bamazon"
});

// Creates the connection with the server and loads the product data upon a successful connection
connection.connect(function (err) {
    if (err) {
        console.error("error connecting: " + err.stack);
    }
    loadProducts();
});

// Function to load the products table from the database and print results to the console
function loadProducts() {
    // Selects all of the data from the MySQL products table
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        // Draw the table in the terminal using the response
        console.table(res);

        // Then prompt the customer for their choice of product, pass all the products to promptCustomerForItem
        promptCustomerForItem(res);
    });
}

// Prompt the customer for a product ID
function promptCustomerForItem(inventory) {
    // Prompts user for what they would like to purchase
    inquirer.prompt([
        {
            type: "input",
            message: "What is the ID of the item you would like to purchase?",
            name: "product"
        }
    ]).then(function (answer) {
        var item = answer.product;
        connection.query("SELECT * FROM products WHERE item_id=?", item, function (err, res) {
            if (err) throw err;
            if (res.length === 0) {
                console.log("Please enter a valid Product ID")
                promptCustomerForItem();
            } else {
                inquirer.prompt([
                    {
                        type: "input",
                        message: "How many would you like to purchase?",
                        name: "quantity"
                    }
                ]).then(function (answer2) {
                    var quantity = answer2.quantity;

                    if (quantity > res[0].stock_quantity) {
                        console.log("We don't have enough for that, but we can sell you " + res[0].stock_quantity + " of those if you are interested!")

                        promptCustomerForItem();
                    } else {    
                        var total = quantity * res[0].price;

                        console.log("");
                        console.log("You purchased " + quantity + " " + res[0].product_name + " for $" + total + "!");

                        var newQuantity = res[0].stock_quantity - quantity;

                        connection.query(
                            "UPDATE products SET stock_quantity = " + newQuantity + " WHERE item_id = " + item, function (err, res) {
                                if (err) throw err;
                                console.log("");

                                checkIfShouldExit();
                            }
                        )
                    }
                })
            }
        })

    }
    );
}

// Check to see if the user wants to quit the program
function checkIfShouldExit() {
    inquirer.prompt([
        {
            type: "input",
            message: "Want to keep shopping?",
            name: "quit"
        }
    ]).then(function (answer3) {
        var test = answer3.quit;
        if (test === "yes") {
            loadProducts();
        } else {
            process.exit(0);
        }
    })
}
