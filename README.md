# Flimble

Flimble is a browser based terminal connected to a Ubuntu server.  Users are automatically added to the server and provided access through the in browser ssh terminal.  Flimble is built on Node.js, React.js, and AWS EC2.  It features custom authentication using PostgreSQL, Redis, and JWT.

![Demo](https://raw.githubusercontent.com/zac-ng/Flimble/main/demo.gif)

It is currently accessible on https://flimble.com

If the site is not responding you can try the mirror: http://75.101.232.49:5000

To run your own instance on a local machine

### Clone the Project
```bash
  git clone https://github.com/zac-ng/Flimble
  cd ./Flimble/src/server
  npm install
 ```

### Setup Postgres Database
```bash
  sudo apt install postgresql postgresql-contrib
  sudo -u postgres psql
```

### Create Postgres Table
```bash
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE user_login (
    userid uuid DEFAULT uuid_generate_v4 (),
    username VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    password VARCHAR NOT NULL, 
    salt VARCHAR NOT NULL,
    creation_date timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ssh_password VARCHAR NOT NULL
);
ALTER USER postgres password 'password';
\q;
```

Feel free to change the default user and or password for the database.  Be sure to update your env file if neccessary.

### Create Redis Store
```bash
sudo apt install make redis-server
wget http://download.redis.io/redis-stable.tar.gz
tar xvzf redis-stable.tar.gz
cd redis-stable
make
redis-server --daemonize yes
```

### Start server

```bash
cd ~/Flimble/src/server
npm start
```


If you want to make any changes to the client side code run the following to rebuild:

```bash
cd ~/Flimble/src/client
npm run build
```

If you want to make any changes to the terminal run the following to rebuild:

```bash
cd ~/Flimble/src/client/ssh
npm run build
```