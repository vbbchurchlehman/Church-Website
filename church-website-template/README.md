# Church Website Template

A simple static church website template you can upload to GitHub and deploy with Cloudflare Pages.

## Files

- `index.html` - main website page
- `styles.css` - styling and responsive layout
- `script.js` - mobile menu and footer year

## How to use with GitHub

1. Create a new GitHub repository.
2. Upload these files to the repository root.
3. Commit the files.

## Deploy with Cloudflare Pages

1. Go to Cloudflare Dashboard.
2. Open **Workers & Pages**.
3. Choose **Create application**.
4. Select **Pages**.
5. Connect your GitHub repository.
6. Use these build settings:
   - Framework preset: `None`
   - Build command: leave blank
   - Build output directory: `/`
7. Deploy.

## Customize

Edit `index.html` to change:

- Church name
- Service times
- Address
- Phone number
- Email
- Events
- Sermon links

Edit `styles.css` to change colors. The main colors are at the top under `:root`.

## Note about the contact form

This template includes a static contact form layout. Cloudflare Pages will display it, but it will not send messages unless you connect it to a form service, Cloudflare Worker, or another backend.
