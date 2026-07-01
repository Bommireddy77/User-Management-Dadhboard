# User Management Dashboard

A responsive React application for viewing, adding, editing, deleting, searching, sorting, filtering, and paginating users from the JSONPlaceholder mock API.

## Features

- Fetches users from `https://jsonplaceholder.typicode.com/users`
- Displays user details: ID, first name, last name, email, and department
- Add new users with simulated API POST requests
- Edit existing users with simulated API PUT requests
- Delete users with API DELETE requests
- Search and sort records by columns
- Pagination with 10, 25, 50, and 100 page sizes
- Filter popup for first name, last name, email, and department
- Responsive UI with clean, modern styling
- Error handling for failed API requests

## Setup

1. Install dependencies

```bash
npm install
```

2. Start the development server

```bash
npm run dev
```

3. Open the displayed local URL in your browser

## Notes

- JSONPlaceholder is a mock API, so POST, PUT, and DELETE requests succeed but do not persist across refreshes.
- For fetched users, the `department` field is derived from the `company.name` field.

## Challenges faced

- The API is mock-only, so add/edit/delete actions do not persist on the server beyond the current session.
- Client-side persistence had to be added to keep changes visible after refresh.
- Sorting and pagination needed careful handling once local edits were introduced.

## Improvements

- Add real backend persistence using a database and custom API
- Add user detail pages and stronger form validation
- Improve infinite scroll or server-side pagination for large data sets
- Add unit tests and integration tests for components and hooks
