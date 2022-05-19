# Uber Eats

The Backend of Uber Eats Clone

## User Model:

 - id
 - createdAt
 - updatedAt

 - email
 - password
 - role(client|owner|delivery)

 ## User CRUD:

 - Create Account
 - Log In
 - See Profile
 - Edit Profile
 - Verify Email

## Restaurant Model:
 - name
 - category
 - address
 - coverImage
 - owner

 - See Categories
 - See Restaurants by Category (pagination)
 - See Restaurants (pagination)
 - See Restaurant
 - Edit Restaurant
 - Delete Restaurant
 - Create Dish
 - Edit Dish
 - Delete Dish


 - Orders Subscription:

   - Pending Orders (Owner) (T: createOrder)
   - Order Status (Customer, Delivery, Owner) (T: editOrder)
   - Pending Pickup Order (Delivery)