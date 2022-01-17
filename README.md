# Restaurant-Website-Demo-Express-
A restaurant website with a login system, a way to track orders and user registration.

This website uses MongoDB with Mongoose for user data and order storage, Express for server backend with Node.js, and Pug as a template engine for rendering HTML.


Running Instructions

install dependencies:
    run "npm install"

start mongo daemon:
    run "mongod --dbpath=database"

    if you would like some initial data:
        run "node ./database-initlializer.js"

    run "node ./server.js"

    connect to http://localhost:3000/ in your browser to take you to the home page
