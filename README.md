# Best Seller Browser & Scheduler
Single page application meant to simplify browsing and picking out books on The New York Times Best Sellers. Books are displayed in each category only once: on the date of their latest appearance. Useful information like estimated wordcount, and time to read according to an adjustable reading pace, are displayed next to each book. Users can add books to a monthly reading plan. Lastly, the live server regularly polls TNYT's API to see if any category has been updated with a new list, and if so the contents of this application are updated as well.

## Tech Used:
React on the frontend. Tailwind for styling. NodeJS and Express for the server. MongoDB for the database, and Mongoose for interfacing between the server and MongoDB.

## How It Works:
Broadly the backend performs three tasks: retrieves content from two different APIs, updates content 






