# Flimble

Flimble is a web application that allows users to access an in-browser linux instance.

Built on EC2, Webssh2, and Node.js.

## Client

Client is built off of React.js and WebSSH2 and connects to an available linux machine running.

To make any changes to the client, run the following lines to rebuild using webpack.

```

cd ./src
npm install
npm run build

```

## Server

Server is built on Node.js and Nginx running on an EC2 instance.  

To make any changes to the server, run the following lines to start the server:

```

cd ./src/server
npm install
npm run start

```