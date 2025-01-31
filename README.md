# volley-backend

a [Sails v1](https://sailsjs.com) application


### Links

+ [Sails framework documentation](https://sailsjs.com/get-started)
+ [Version notes / upgrading](https://sailsjs.com/documentation/upgrading)
+ [Deployment tips](https://sailsjs.com/documentation/concepts/deployment)
+ [Community support options](https://sailsjs.com/support)
+ [Professional / enterprise options](https://sailsjs.com/enterprise)

## System Dependencies
+ MySQL
+ Redis
+ NodeJS 12

### Setup
+ Configure `.env` file your shopify, stripe and sendgrid credentials.  
+ Setup MySQL on you server and configure `DB_URL` in `.env` file `mysql://<db_username>:<db_password>@<db_host>:<db_port>/<db_name>`.
+ DB schema definitions are defined in `schema.sql`
+ Configure `REDIS_HOST` and `REDIS_PORT` in `.env` file.
+ Configure `WEB_HOST` as url of your frontend application (e.g. `https://volleyapp.konnectshift.com`). `STRIPE_REFRESH_HOST` as url of this backend application(e.g. `https://volleyapi.konnectshift.com`).
+ install project libraries using `npm install` command
+ run your application `app.js` using some production ready process manager like `PM2 or forever`


