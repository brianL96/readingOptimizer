# Best Seller Browser & Scheduler
Single page application meant to simplify browsing and picking out books on The New York Times Best Sellers. Books are displayed in each category only once: on the date of their latest appearance. Useful information like estimated wordcount, and time to read according to an adjustable reading pace, are displayed next to each book. Users can add books to a monthly reading plan. Lastly, the live server regularly polls TNYT's API to see if any category has been updated with a new list, and if so the contents of this application are updated as well.

## Tech Used:
React on the frontend. Tailwind for styling. NodeJS and Express for the server. MongoDB for the database, and Mongoose for interfacing between the server and MongoDB.

## How It Works:
Broadly the backend performs three tasks: 
1) retrieves content from two different APIs and loads this content into this app's database,
2) periodically checks if a category on The New York Times Best Sellers has been updated and if so this app's database is also updated, and
3) serves client requests.


## Future Updates:

Unfortunately, Spotify doesn't seem to have as many audiobooks as Audible, so I'll probably switch to using Audible's API. If Spotify does in fact have audiobooks which are unavailiable on Audible, then I would use both APIs.

Give users the ability to be more precise in their planning. Users can currently download a CSV file with the list of books they plan on reading over the course of a month, but I'd like to upgrade this functionality so that they could edit a calendar and export a calendar file.










