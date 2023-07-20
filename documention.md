# AUTHCONTROLLERS

### 1. protect middleware

- To Check the Token sent in request during Login
- Makes sure the request has either the Bearer Token (Postman testing) or JWT cookie.
- Decodes the JWT token.
- Fetch the user from the DB, using the \_id obtained from the decoded token.
- Makes sure password was NOT changed after this token was issued.
- Inserts the user details in the request `req.user = freshUser`
- Inserts the user details in the response `res.locals.user = freshUser`
- The jump to the next middleware

### 2. isLoggedIn middleware

- To Verify the Token sent during every other request.
- Makes sure the request has JWT cookie.
- If the JWT val is specifically `loggedoutval`, jump to next middleware.
- Else, Decodes the JWT token.
- Fetch the user from the DB, using the \_id obtained from the decoded token.
- Makes sure password was NOT changed after this token was issued.
- Inserts the user details in the response `res.locals.user = freshUser`
- Then jump to next middleware.

### 3. restrictTo middleware

- Wrapper function to the actual middleware - designed to take paramters
- Takes paramters: `restrictTo(role1, role2) -- only these roles are allowed
- If the role of the logged in user `req.user.role` is not among the specified roles, throw error
- else, permit to next middleware.

### 4. updatePassword middleware

- For updating passwords when logged in. autcontroller.protect check is there
- PATCH request to `/updatePassword`
- expects `currentPassword` , `newPassword`, `newConfirmPassword` from request body.
- validates the `currentPassword` first and only then proceeds.
- tries to save the new and confirm passwords in DB.
- if they dont match, mongoose should throw validation error

# USERCONTROLLER

### 1. updateMe

- For updating the user details. (name & email)
- PATCH reqest to `/updateMe`
- Does not allow password updation (use Authcontroller/updatePassword)

<!--
Issues
======
implement feature: password updation from updateMe
issue with logging out in /me page
-->
