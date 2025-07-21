
## Api's description. ##
http://localhost:3000/{endpoint} 
 ## Authentication ##
POST /api/auth/signup
Registers a new user with username, email, and password. Returns a JWT token on success.
POST /api/auth/login
Authenticates a user with email and password. Returns a JWT token and user info.
GET /api/protected
Accesses a protected route available only to logged-in users. Requires a valid JWT token.
## Documents ##
 create document - POST https://localhost:3000/
 Creates a new document with provided title/content. Requires user authentication.
 
edit document- PUT /:id + auth, checkPermission("edit")
Updates a document if the user has edit permissions. Requires valid JWT and permission check.

share documents - POST/api/shares
Shares a document with another user (POST)

delete document - DELETE /api/:id
Deletes a comment by its ID. Only accessible to the comment owner or document owner.

## Installations ##
## Frontend ##
Open terminal in vscode and enter
## Users\Minfy\Desktop\NotionProject\cd Frontend ##
Then  enter cd my-app
 ## npm create vite@latest my-app -- --template react ##
## npm install ##
For running we  use
## npm run dev ##
## This project runs locally ##
http://localhost:3000
## For icons install ##
npm install react-icons
npm install lucide-react
## For editor ##
npm install @tiptap/react @tiptap/core @tiptap/extension-text-style
npm install @tiptap/react @tiptap/starter-kit \
@tiptap/extension-underline \
@tiptap/extension-text-align
## For tailwind css ##
npm install tailwindcss @tailwindcss/vite

## Backend ## 
## npm install express mongoose dotenv cors  ##
## npm install --save-dev nodemon  ##
"scripts": {
  "dev": "nodemon server.js"
}
## npm install bcryptjs jsonwebtoken ##
## npm install zod ##
## npm install swagger-jsdoc swagger-ui-express ##
## npm install yamljs  ##
## npm install socket.io  ##
## npm install socket.io-client  ##

## Architecture Diagram ##


<img width="1531" height="704" alt="Screenshot 2025-07-21 124349" src="https://github.com/user-attachments/assets/91df22ff-80e4-4dcd-9780-910aac3a08a1" />

## MongoDb storage ##

<img width="1805" height="985" alt="Screenshot 2025-07-20 220305" src="https://github.com/user-attachments/assets/751cb29e-7e2e-4bd8-840b-4c589eb9f803" />

<img width="1880" height="929" alt="Screenshot 2025-07-20 220328" src="https://github.com/user-attachments/assets/48f0a654-677a-47b6-b0ef-f0c9489bcb70" />

<img width="1890" height="962" alt="Screenshot 2025-07-20 220422" src="https://github.com/user-attachments/assets/d6627958-0f96-4d99-af19-1d3df023624d" />

<img width="1882" height="877" alt="Screenshot 2025-07-20 220351" src="https://github.com/user-attachments/assets/5de56189-d3a3-4073-bb1c-e2f6868c6968" />

## Outputs ##

<img width="1865" height="974" alt="Screenshot 2025-07-20 224036" src="https://github.com/user-attachments/assets/769096d3-2c81-457e-83d0-8db882620012" />

<img width="1886" height="900" alt="Screenshot 2025-07-20 224053" src="https://github.com/user-attachments/assets/0daa3348-98d0-4b1c-822c-345d33bb9185" />

<img width="1878" height="939" alt="Screenshot 2025-07-20 224123" src="https://github.com/user-attachments/assets/b981f6b1-65da-49ce-b4b1-44dde1c189b3" />

<img width="1911" height="963" alt="Screenshot 2025-07-20 224149" src="https://github.com/user-attachments/assets/373398e8-eb92-4af9-bdd9-70fb74c2e18a" />

<img width="1891" height="990" alt="Screenshot 2025-07-20 224239" src="https://github.com/user-attachments/assets/f5e4273b-a02b-40d4-a00c-69b2e2c7b567" />























