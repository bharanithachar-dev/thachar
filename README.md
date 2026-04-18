# Thachar Decors Business Software

This project is now a full static business app for quotation and estimate sharing.

## What it does

- Store company details
- Maintain package library
- Maintain client database
- Create estimates for clients
- Generate one sharable customer link per estimate
- Show detailed estimate to customer
- Open Razorpay payment link from the customer page
- Print the estimate or save it as PDF from the browser

## Files

- `index.html` - app shell
- `styles.css` - complete admin and customer UI design
- `app.js` - all business logic and local data storage

## How to use

1. Open `index.html`
2. Go to `Company` and update your business details
3. Go to `Packages` and add Silver, Gold, Diamond or any custom package
4. Go to `Clients` and add customer details
5. Go to `Estimates` and create an estimate
6. Click `Copy Link` or `Open` for the customer link

## Important note

This version works fully in the browser using `localStorage`, so your data stays in that browser on that device.

If you want a later version with:

- login
- cloud database
- staff users
- WhatsApp integration
- auto invoice PDF
- payment status tracking from Razorpay

that will need a backend server and deployment.
