// routes/templateRoutes.js
const express = require('express');
const {
    createTemplate,
    getAllTemplates,
    getOneTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplatesByCategory
} = require('../controllers/templateController');

const router = express.Router();

// Routes for templates
router.post('/', createTemplate);               // Create a new template
router.get('/', getAllTemplates);                   // Get all templates
router.get('/get/:id', getOneTemplate);             // Get a template by ID
router.put('/:id', updateTemplate);              // Update a template by ID
router.delete('/:id', deleteTemplate);           // Delete a template by ID
router.get('/categories/', getTemplatesByCategory);

module.exports = router;



/*


Template APIs
1. Create Template: POST /api/templates
Request JSON:

json
Copy code
{
    "title": "Sample Template Title",
    "content": "This is the content of the template.",
    "categories": [1, 2]  // Array of category IDs to associate with the template
}
Response JSON:

json
Copy code
{
    "id": 1,
    "title": "Sample Template Title",
    "content": "This is the content of the template.",
    "createdAt": "2024-10-16T12:00:00Z",
    "updatedAt": "2024-10-16T12:00:00Z",
    "categories": [
        {
            "id": 1,
            "name": "Category 1"
        },
        {
            "id": 2,
            "name": "Category 2"
        }
    ]
}
2. Get All Templates: GET /api/templates
Response JSON:

json
Copy code
[
    {
        "id": 1,
        "title": "Sample Template Title",
        "content": "This is the content of the template.",
        "createdAt": "2024-10-16T12:00:00Z",
        "updatedAt": "2024-10-16T12:00:00Z",
        "categories": [
            {
                "id": 1,
                "name": "Category 1"
            },
            {
                "id": 2,
                "name": "Category 2"
            }
        ]
    },
    {
        "id": 2,
        "title": "Another Template Title",
        "content": "This is another template's content.",
        "createdAt": "2024-10-16T12:05:00Z",
        "updatedAt": "2024-10-16T12:05:00Z",
        "categories": [
            {
                "id": 1,
                "name": "Category 1"
            }
        ]
    }
]
3. Update Template: PUT /api/templates/
Request JSON:

json
Copy code
{
    "title": "Updated Template Title",
    "content": "This is the updated content of the template.",
    "categories": [2, 3]  // Updated array of category IDs
}
Response JSON:

json
Copy code
{
    "id": 1,
    "title": "Updated Template Title",
    "content": "This is the updated content of the template.",
    "createdAt": "2024-10-16T12:00:00Z",
    "updatedAt": "2024-10-17T12:00:00Z",
    "categories": [
        {
            "id": 2,
            "name": "Category 2"
        },
        {
            "id": 3,
            "name": "Category 3"
        }
    ]
}
4. Delete Template: DELETE /api/templates/
Response JSON:

json
Copy code
{
    "message": "Template deleted successfully."
}

*/