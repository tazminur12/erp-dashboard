# Backend Transaction Creation Endpoint for Personal Expenses

## Problem
The category aggregation query expects transactions with:
- `scope: "personal-expense"`
- `type: "expense"`
- `categoryId: String(categoryId)`

But the transaction creation endpoint might not be setting these fields correctly.

## Required Backend Endpoint

### POST /api/transactions/personal-expense

**Frontend sends:**
```json
{
  "date": "2024-01-15",
  "amount": 5000,
  "categoryId": "category_id_here",
  "description": "Some description",
  "tags": []
}
```

**Backend should create transaction with these fields:**

```javascript
// POST /api/transactions/personal-expense
app.post("/api/transactions/personal-expense", async (req, res) => {
  try {
    const { date, amount, categoryId, description = "", tags = [] } = req.body || {};
    
    // Validation
    if (!categoryId || !String(categoryId).trim()) {
      return res.status(400).json({ 
        error: true, 
        message: "categoryId is required" 
      });
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ 
        error: true, 
        message: "Valid amount is required" 
      });
    }
    
    // Validate category exists
    if (!ObjectId.isValid(categoryId)) {
      return res.status(400).json({ 
        error: true, 
        message: "Invalid categoryId" 
      });
    }
    
    const category = await personalExpenseCategories.findOne({ 
      _id: new ObjectId(categoryId), 
      isActive: { $ne: false } 
    });
    
    if (!category) {
      return res.status(404).json({ 
        error: true, 
        message: "Category not found" 
      });
    }
    
    // ✅ CRITICAL: Create transaction with correct fields for aggregation
    const transactionDoc = {
      // Required fields for aggregation query
      scope: "personal-expense",        // ✅ MUST be "personal-expense"
      type: "expense",                   // ✅ MUST be "expense"
      categoryId: String(categoryId),     // ✅ MUST be string, matches aggregation
      
      // Transaction details
      date: date ? String(date).slice(0, 10) : new Date().toISOString().slice(0, 10),
      amount: Number(amount),
      description: String(description || "").trim(),
      tags: Array.isArray(tags) ? tags.map(t => String(t)).filter(Boolean) : [],
      
      // Metadata
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Optional: Add user info if available
      createdBy: req.user?.email || req.user?.id || null,
      branchId: req.user?.branchId || null,
    };
    
    // Insert into transactions collection
    const result = await transactions.insertOne(transactionDoc);
    const created = await transactions.findOne({ _id: result.insertedId });
    
    // Return normalized response
    return res.status(201).json({
      _id: String(created._id),
      id: String(created._id),
      date: created.date,
      amount: Number(created.amount),
      categoryId: String(created.categoryId),  // ✅ Include in response
      categoryName: category.name || "",
      description: String(created.description || ""),
      tags: Array.isArray(created.tags) ? created.tags : [],
      createdAt: created.createdAt,
    });
  } catch (err) {
    console.error("POST /api/transactions/personal-expense error:", err);
    return res.status(500).json({ 
      error: true, 
      message: err.message || "Failed to create transaction" 
    });
  }
});
```

## DELETE /api/transactions/personal-expense/:id

```javascript
// DELETE /api/transactions/personal-expense/:id
app.delete("/api/transactions/personal-expense/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ 
        error: true, 
        message: "Invalid transaction id" 
      });
    }
    
    // Get transaction first to extract categoryId
    const transaction = await transactions.findOne({ 
      _id: new ObjectId(id),
      scope: "personal-expense"  // Only delete personal-expense transactions
    });
    
    if (!transaction) {
      return res.status(404).json({ 
        error: true, 
        message: "Transaction not found" 
      });
    }
    
    const categoryId = transaction.categoryId;
    
    // Delete transaction
    await transactions.deleteOne({ _id: new ObjectId(id) });
    
    // Return categoryId in response for frontend to invalidate cache
    return res.json({ 
      success: true, 
      message: "Transaction deleted successfully",
      categoryId: String(categoryId)  // ✅ Include in response
    });
  } catch (err) {
    console.error("DELETE /api/transactions/personal-expense/:id error:", err);
    return res.status(500).json({ 
      error: true, 
      message: err.message || "Failed to delete transaction" 
    });
  }
});
```

## GET /api/transactions/personal-expense/:id

```javascript
// GET /api/transactions/personal-expense/:id
app.get("/api/transactions/personal-expense/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ 
        error: true, 
        message: "Invalid transaction id" 
      });
    }
    
    const transaction = await transactions.findOne({ 
      _id: new ObjectId(id),
      scope: "personal-expense"
    });
    
    if (!transaction) {
      return res.status(404).json({ 
        error: true, 
        message: "Transaction not found" 
      });
    }
    
    // Get category name if needed
    let categoryName = "";
    if (transaction.categoryId) {
      const category = await personalExpenseCategories.findOne({ 
        _id: new ObjectId(transaction.categoryId) 
      });
      categoryName = category?.name || "";
    }
    
    return res.json({
      _id: String(transaction._id),
      id: String(transaction._id),
      date: transaction.date,
      amount: Number(transaction.amount),
      categoryId: String(transaction.categoryId),
      categoryName: categoryName,
      description: String(transaction.description || ""),
      tags: Array.isArray(transaction.tags) ? transaction.tags : [],
      createdAt: transaction.createdAt,
    });
  } catch (err) {
    console.error("GET /api/transactions/personal-expense/:id error:", err);
    return res.status(500).json({ 
      error: true, 
      message: err.message || "Failed to get transaction" 
    });
  }
});
```

## Key Points

1. **Transaction Document Structure:**
   ```javascript
   {
     scope: "personal-expense",     // ✅ Required for aggregation
     type: "expense",                // ✅ Required for aggregation
     categoryId: String(categoryId), // ✅ Must be string, matches aggregation
     date: "2024-01-15",
     amount: 5000,
     description: "...",
     tags: [],
     createdAt: new Date(),
     updatedAt: new Date()
   }
   ```

2. **Aggregation Query (from your category endpoints):**
   ```javascript
   transactions.aggregate([
     { 
       $match: { 
         scope: "personal-expense",  // ✅ Must match
         type: "expense",             // ✅ Must match
         categoryId: { $in: idStrings } // ✅ Must match (string comparison)
       } 
     },
     { 
       $group: { 
         _id: "$categoryId", 
         total: { $sum: "$amount" }, 
         last: { $max: "$date" } 
       } 
     }
   ])
   ```

3. **Response Format:**
   - Always include `categoryId` in response (as string)
   - This allows frontend to invalidate specific category cache

## Testing

1. Create a transaction:
   ```bash
   POST /api/transactions/personal-expense
   {
     "date": "2024-01-15",
     "amount": 5000,
     "categoryId": "category_id",
     "description": "Test"
   }
   ```

2. Check if transaction was created with correct fields:
   ```bash
   GET /api/transactions/personal-expense/:id
   ```

3. Verify category total updated:
   ```bash
   GET /api/personal-expenses/categories/:id
   # Should show totalAmount = 5000 (or previous + 5000)
   ```

4. Check aggregation directly:
   ```javascript
   // In MongoDB shell or backend
   db.transactions.aggregate([
     { $match: { scope: "personal-expense", type: "expense", categoryId: "category_id" } },
     { $group: { _id: "$categoryId", total: { $sum: "$amount" } } }
   ])
   ```

## Common Issues

1. **Transaction not showing in category total:**
   - Check if `scope` is exactly `"personal-expense"` (case-sensitive)
   - Check if `type` is exactly `"expense"` (case-sensitive)
   - Check if `categoryId` is a string (not ObjectId)

2. **Category total not updating:**
   - Verify aggregation query matches transaction fields
   - Check if transaction was actually inserted
   - Verify `categoryId` format matches (string vs ObjectId)

3. **Frontend not updating:**
   - Frontend is already configured to invalidate queries
   - If backend aggregation is correct, frontend should auto-update
   - Check browser network tab to verify API responses
