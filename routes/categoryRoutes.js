// routes/categoryRoutes.js
const express = require('express');
const { getCategoryById,createCategory, getCategories, updateCategory, deleteCategory } = require('../controllers/categoryController');

const router = express.Router();

router.post('/', createCategory);      // Create category
router.get('/', getCategories);        // Get all categories
router.get('/getOne/:id', getCategoryById);        // Get all categories
router.put('/:id', updateCategory);     // Update category
router.delete('/:id', deleteCategory);  // Delete category

module.exports = router;


/*
Category APIs
1. Create Category: POST /api/categories
Request JSON:

json
Copy code
{
    "name": "New Category"
}
Response JSON:

json
Copy code
{
    "id": 1,
    "name": "New Category",
    "createdAt": "2024-10-16T12:00:00Z",
    "updatedAt": "2024-10-16T12:00:00Z"
}
2. Get All Categories: GET /api/categories
Response JSON:

json
Copy code
[
    {
        "id": 1,
        "name": "Category 1",
        "createdAt": "2024-10-16T12:00:00Z",
        "updatedAt": "2024-10-16T12:00:00Z"
    },
    {
        "id": 2,
        "name": "Category 2",
        "createdAt": "2024-10-16T12:05:00Z",
        "updatedAt": "2024-10-16T12:05:00Z"
    }
]
3. Update Category: PUT /api/categories/
Request JSON:

json
Copy code
{
    "name": "Updated Category Name"
}
Response JSON:

json
Copy code
{
    "id": 1,
    "name": "Updated Category Name",
    "createdAt": "2024-10-16T12:00:00Z",
    "updatedAt": "2024-10-17T12:00:00Z"
}
4. Delete Category: DELETE /api/categories/
Response JSON:

json
Copy code
{
    "message": "Category deleted successfully."
}

*/