# Scoreboard

**Requirements**

* node.js >= 8.*
* mongodb

**Structure**

- Web app lives in `app/` folder and may be served independently
- All other files represent server app

**Setup**

Run `npm install` in project's root directory
Run `npm install --prefix app` in project's root directory

Create `config.js` file in project's root directory

Example of `config.js`

```
module.exports = {
    httpPort: 15000,
    connectionString: 'mongodb://localhost/Scoreboard',
};
```

**Development workflow**

Run `npm run dev` in project's root directory

When in development, backend listens on hardcoded HTTP port `15000`. 
If it needs to be changed, please do not forget to change it in `app/package.json`
under key `proxy` and do not commit those changes.

**Production build**

* Start project by `npm run dev`