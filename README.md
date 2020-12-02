# Installation Requirements
- MongoDB installed on device running application, can be found at https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
- - Should also `Set-Alias mongod "C:\Program Files\MongoDB\Server\4.4\bin\mongod.exe"`
- Node installed on device, can be found at https://nodejs.org/en/
- Access to and basic knowledge of how to use termial commands

# Installation Instructions
## Download all of the files from github
- From branch main, https://github.com/dhruvkmodi/ENSE374_TheBreezySunbeans/tree/main
- Can pull the branch or download all documents as a zip file

## Initialize all nodeJS requirements
- npm init
- npm i express
- npm i -g nodemon
- npm i ejs
- npm i mongoose
- npm i dotenv
- npm i express-session, Required me to create path node_modules\random-bytes\package.json
- npm i passport
- npm i passport-local-mongoose

## Create secret
- Make a file named .env in main directory
- Enter line `SECRET=ThisIsAMoreSecureSecret!` into the file

## Run application
- Start mongoDB connection with `mongod` in a terminal
- Use command `node index.js`, or `nodemon` to run server

## View application
- Enter `http://localhost:4000` into web browser of choice
