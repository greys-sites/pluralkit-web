# PluralKit Web

A web interface for @xSke's [PluralKit](https://github.com/xSke/Pluralkit)

## Deploying Locally

If you want to do some work on it, you can run it yourself locally. To do so, follow these steps:

1. Clone the repo and `cd` into it
2. Run `npm install && cd frontend && npm install` to install all packages (alternative: `yarn install && cd frontend && yarn install`)
3. Use `npm run build` in the root folder
4. Navigate to `localhost:8080` in your browser

If you make changes in the frontend folder, you'll have to `npm run build` it again. Changes to `index.js` don't need to be rebuilt however, and you can use [supervisor](https://www.npmjs.com/package/supervisor) to automatically reload changes or `node index.js` to manually restart
