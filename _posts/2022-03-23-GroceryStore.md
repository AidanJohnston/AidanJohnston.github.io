---
layout: post
title: 'Grocery Store Full Stack Webapp'
tags: Angular Typescript Firebase
category: github
gitlink: https://github.com/AidanJohnston/GroceryStore
sitelink: https://grocerystore.aidanjohnston.ca
---
Implemented a full stack grocery store web app using Angular and Firebase following an agile
methodology.

# Introduction

An online Grocery Store allows customers to place orders for items and/or services from a store that caters to both walk-in and online shoppers. The online Store system displays everything they intend to sell on the internet. Customers can use this web-based application to select products and add them to their shopping cart. Customers enter their address and contact information, and their desired products are delivered to their home.

# Interaction Diagrams

## Website Hierarchy

<p align="center">
<img src="\assets\img\groceryStore\image8.png">
</p>

## Web Page Mockups
<p align="center">
<img src="\assets\img\groceryStore\image31.png">
</p>
<p align="center">
<img src="\assets\img\groceryStore\image26.png">
<img src="\assets\img\groceryStore\image3.png">
<img src="\assets\img\groceryStore\image11.png">
<img src="\assets\img\groceryStore\image16.png">
<img src="\assets\img\groceryStore\image25.png">
</p>

## Database Design
The design of the database can be split into two different sections, the items, and the users. The items collection contains a set of item documents.  Similarly the users collection contains a set of users documents.  Each user contains a collection of transactions.  Notice in the transaction documents the information for each item is duplicated.  In a traditional database, we would include a reference to the item in the item table.  In Firestore it is easier, and significantly less resource intensive to duplicate the data.  

<p align="center">
<img src="\assets\img\groceryStore\image13.png">
</p>

# Angular Design
The following section describes the major components, services, and guards used for creating the project.
  
The naming convention used for naming files followed a heavily descriptive process. The file name is split into three parts, the file name; the angular type; and then the file type. 

## Components
A component is one of the main building blocks of angular. Its main goal is to be as contained and reusable as possible.  A component is a collection of four files.  The file name.component.css defines specific css styles for that component.  The file name.component.html defines the html used for that component.  The file name.component.ts defines the controller class of named NameComponent, and an exported html tag of name app-name.  Finally name.component.spec.ts defines a testing file for that component.

### add-to-cart
The add-to-cart component acts as a reusable component for each item page.  The component consists of two buttons and a counter.  When the + button is pressed the counter increases and adds the current page’s item to the cart.  When the - button is clicked the count is reduced reducing the count in the cart and or removing it from the cart.  If there is a count of zero, the - button is disabled.  If the user presses either button while not logged in the action is canceled and the user is redirected to the login page.

<p align="center">
<img src="\assets\img\groceryStore\image29.png">
<img src="\assets\img\groceryStore\image27.png">
</p>

### footer
The footer sits at the bottom of every page.  If there is not enough content for the footer to be pushed naturally to the bottom, it snaps to the bottom of the screen.

<p align="center">
<img src="\assets\img\groceryStore\image6.png">
</p>

### nabvar
The navbar sits at the top of each content page.  The login, signup, etc, pages do not have the nav bar.  When the user is signed in a cart, an account, and a logout button are displayed.  When the user is not logged in a login and sign up button are displayed.
<p align="center">
<img src="\assets\img\groceryStore\image14.png">
<img src="\assets\img\groceryStore\image21.png">
</p>

When the screen size is large the navigation bar displays normally.  Having the website title, and navigation buttons on the left, and the account buttons on the right.

<p align="center">
<img src="\assets\img\groceryStore\image4.png">
</p>

When the screen size is too small, ie. a mobile screen, the menu is compressed into a hamburger menu.

<p align="center">
<img src="\assets\img\groceryStore\image22.png">
</p>

## Services
Services in angular act as the client side background functionality.  They do not have any html or css associated with them.  Other services, components, guards etc, can import services and use their functionality.  Services consist of two files: name.service.ts which acts at the main controlling class.  This file exports a class of name NameService. The second file is name.service.spec.ts which acts as the testing file for the service. 

### AuthService
AuthService acts as the main authentication service for the application.  AuthSerice makes calls to the firebase backend for account creation, request for an email verification to be sent, user login, user logout.  AuthService allows for any component, service, guard, etc, to request current user information or update current user information.


### CartService
CartService acts as the main manager for the user's cart.  Whenever the user requests changes to the local cart, CartService provides functionality to do so.  CartService also allows for the user to checkout their current cart.


### ItemSerivce
ItemService acts as the main connection to the firebase database for items.  ItemService stores item information and provides functionality for components, services, guards, etc to request item information.  This could be things such as item price, item photos, or an item title.

## Guards
Guards act as a way to check if the current user should be accessing certain pages.  In our case, failing a guard almost always resulted in the user being redirected to the home page.  Guards consist of two files: name.guard.ts which contains the guards logic, and name.guard.spec.ts which contains testing for that guard.  Guards run first when loading a page, meaning no content is loaded before the guard check passes.

### Auth-LoggedIn
Auth-LoggedIn checks if the user is logged in.  The guard checks AuthService to see if a user is logged in.  If there is no user logged in, the page redirects to the home page.

### Auth-NotLoggedIn
Auth-NotLoggedIn does the opposite of Auth-LoggedIn. It will redirect the user to the main page if they are logged in.

### Verify-Email
Verify-Email checks to see if the user has verified their email.  If their email is not verified they are redirected to the verified email page.  Almost every page has the verify-email guard on it.


## Classes
Classes act as a reusable object definition to be used between components, services, guards, etc.  The main use for classes was to reflect the database design.  Rather than update each value in the database separately, classes are used to create order on what can be pushed to the database.  Remember with noSQL our document structure is schemaless, any document can contain any content.  Using classes for this, again, allows us to keep some form structure when pushing data, and to fail gracefully when incorrect data is returned.


### CartItem
Cart item acts as a wrapper around items in the user's cart.  Cart items contain an item along with the current count of items.

```
export class CartItem{
    constructor(item : Item, id : string){
      this.item = item;  
      this.id = id;
    }
    item:Item;
    quantity:number = 0;
    id: string;

    get price():number{
        return this.item.price * this.quantity;
    }
}
```

### Item
Item acts as a database interface.  The item interface should be the same as the items stored in the database.
```
export interface Item {
    id: string,
    name: string,
    description : string,
    photo_ref : string,
    price : number
    tags : string[]
}
```

### Transaction
Transaction acts as a database interface.  The transaction interface should be the same as the transaction stored in the database.
```
export interface Transaction {
    address : Address,
    time : number,
    cart: CartItem[]
    total: number
}
```

### User
User acts as a database interface.  The user interface should be the same as the users stored in the database.
```
export interface User {
    uid?: string;
    address : Address,
    email : string,
    fName : string,
    lName : string,
}
```

### Address
Address acts as a database interface.  The Address interface should be the same as the Address stored in the database.
```
export interface Address {
    address_1: string,
    city : string,
    province : string,
    postalCode : string,
}
```