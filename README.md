# Getting Started

0. Hover on the icons above right to see the tooltips. Click the icon that says _Open Preview to the side_ to see this markdown rendered as it was intended to be viewed. Close this file (**readme.md**). The preview will remain open.

1. Click _Fork_ icon above left.

2. Click _Share_ icon above left. Record your unique URL.

3. Reload this browser tab with your unique URL. You'll have to repeat step #0.

# Backend

4. In Terminal panel below, run `npm run server` to start the app server. You will see `index.html` in `public` rendered in a panel to the right.

## Backend Notes

- You will use this backend for many future practicums.

- **json-server** is a spoofed server, not a robust backend. It's an easy and awesome prototyping tool to see if your client works without you first having to write your server.

- You will write a robust server in a future Practicum that replaces **json-server**.

# Frontend

5. Copy your **public** files from your **Vanilla Practicum** into **public**.

6. Keeping all the same user functionality from Vanilla Practicum, make four changes. Except for the visual changes, this is a true refactoring.

7. Strip out all your custom CSS. Use only Tailwind for styling. Use a CDN. Do a different style GUI from your Vanilla Practicum. We want to see you have variety.

8. Strip out your fetch code. Use Axios instead.

9. Write and use your own lite version of jQuery.

10. Create and use your own favicon.

11. Make sure you comply with the **Negative Requirements** below.

12. Reset **db.json** back to its original contents (**db.bak.json**).

13. Submit your Practicum Vanilla URL.

14. Do your two peer reviews. Canvas will auto-assign them at the deadline.

15. Rejoice like you won the gold at the special olympics. You're special. You get a hug.

## Negative Requirements

[ ] Don't use non-Chrome browser.

[ ] Don't change any html tag with a _data-cy_ attribute. You can add html tags.

[ ] Tailwind and Axios are the only third party libraries.

[ ] Don't violate CRAP design principles.

[ ] Don't add images (other than favicon).

[ ] Don't add files (other than favicon).

[ ] No authentication (that'll come later).

[ ] No testing (that'll come later).

[ ] Don't add a new course or a new student (they'll come later).

[ ] No updating or deleting a past log. The log is an archive, i.e. an immutable record of history.
