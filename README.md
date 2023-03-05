# Tiny Cafe
This is a small cafe game created for HCDE 438.
--
Template instructions below:

View the deployed template [here](http://twigg.gg/webdev-template/).

This template project uses `vite` to run a dev server and build the project. It
uses `gh-pages` to deploy the site to the `gh-pages` branch. The base app
imports the `lit-html` library and uses it to render a template to
`document.body`.

## Using the template

Click **Use this template** In the top right of this page, and click **Create a
new repository**. Give your repository a name, and click **Create repository
from template**. Clone the repository to your computer and open it in your
editor.

Install dependencies with `npm install`.

After dependencies are installed, use the following scripts (listed in
`package.json`) as you work on your site:

- `npm run start` - runs the local development server
- `npm run host` - runs the local development server, but makes it accessible on
  your network (so you could e.g. open the site on your phone)
- `npm run build` - builds your site to the `dist` folder
- `npm run preview` - builds your site and previews the built version locally
- `npm run deploy` - builds your site and then deploys it to Github pages

As you work on your site, install additional packages with
`npm install packagename`. They will automatically be listed in your
`package.json`.

**IMPORTANT:** When you want to deploy your site to your own Github pages
instance, you will need to update the path in the deploy script to reflect the
name of your repository. This is because Github pages projects are automatically
hosted from a subfolder on your base `username.github.io` domain. For example,
this repo is named `webdev-template`, so the deploy script sets the base path
like this:

```json
    "deploy": "vite build --base=/webdev-template/ && gh-pages -d dist"
```

If you named your repo `my-cool-project`, you should edit the deploy script to
be:

```json
    "deploy": "vite build --base=/my-cool-project/ && gh-pages -d dist"
```
