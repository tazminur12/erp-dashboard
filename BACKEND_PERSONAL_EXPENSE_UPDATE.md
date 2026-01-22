# Backend Issue: Personal Expense Transaction - Category Total Not Updating

## Problem
When a personal expense transaction is created from NewTransaction.jsx (selecting "ব্যক্তিগত/ পারিবারিক"), the category's `totalAmount` is not updating in:
- ExpenseDetails.jsx (category details page)
- FamilyMemberProfile.jsx (showing categories linked to family member)

## Frontend Changes Made

### 1. Query Invalidation & Refetch
- ✅ Updated `useCreatePersonalExpenseTransactionV2` to invalidate and refetch categories
- ✅ Updated `useDeletePersonalExpenseTransactionV2` to invalidate and refetch categories
- ✅ Reduced `staleTime` from 5 minutes to 1 minute
- ✅ Added `refetchOnWindowFocus` and `refetchOnMount` to category queries

### 2. Specific Category Invalidation
- ✅ When transaction is created/deleted, specific category is invalidated and refetched
- ✅ All category queries are invalidated and refetched

## Backend Requirements

### 1. Transaction Creation Endpoint
**Endpoint:** `POST /api/transactions/personal-expense`

**Current Payload:**
```json
{
  "date": "2024-01-15",
  "amount": 5000,
  "categoryId": "category_id_here",
  "description": "Some description",
  "tags": []
}
```

**Required Backend Behavior:**
1. ✅ Create the transaction
2. ❌ **MUST UPDATE** the category's `totalAmount` field:
   ```javascript
   // After creating transaction
   await Category.findByIdAndUpdate(categoryId, {
     $inc: { totalAmount: amount },
     lastUpdated: new Date()
   });
   ```
3. ❌ **MUST UPDATE** `lastUpdated` field in category

### 2. Transaction Deletion Endpoint
**Endpoint:** `DELETE /api/transactions/personal-expense/:id`

**Required Backend Behavior:**
1. ✅ Delete the transaction
2. ❌ **MUST DECREMENT** the category's `totalAmount`:
   ```javascript
   // Before deleting transaction, get the transaction
   const transaction = await Transaction.findById(id);
   if (transaction && transaction.categoryId) {
     await Category.findByIdAndUpdate(transaction.categoryId, {
       $inc: { totalAmount: -transaction.amount },
       lastUpdated: new Date()
     });
   }
   ```
3. ❌ **MUST UPDATE** `lastUpdated` field in category

### 3. Transaction Response
**When creating/deleting, backend should return:**
```json
{
  "success": true,
  "data": {
    "_id": "transaction_id",
    "categoryId": "category_id",  // ✅ MUST include this
    "amount": 5000,
    "date": "2024-01-15",
    // ... other fields
  }
}
```

### 4. Category Model
**Ensure category has these fields:**
- `totalAmount` (Number) - Sum of all transactions for this category
- `lastUpdated` (Date) - Last time category was updated
- `familyMemberId` (ObjectId, optional) - Link to family member if applicable

## Testing Checklist

- [ ] Create personal expense transaction → Category `totalAmount` increases
- [ ] Delete personal expense transaction → Category `totalAmount` decreases
- [ ] Update transaction amount → Category `totalAmount` updates correctly
- [ ] Category `lastUpdated` field updates on transaction create/delete
- [ ] Family member profile shows updated category totals
- [ ] ExpenseDetails page shows updated `totalAmount`

## Example Backend Implementation

```javascript
// POST /api/transactions/personal-expense
const createPersonalExpenseTransaction = async (req, res) => {
  try {
    const { date, amount, categoryId, description, tags } = req.body;
    
    // Validate
    if (!categoryId || !amount || amount <= 0) {
      return res.status(400).json({ 
        error: true, 
        message: 'categoryId and amount are required' 
      });
    }
    
    // Create transaction
    const transaction = await PersonalExpenseTransaction.create({
      date,
      amount: Number(amount),
      categoryId,
      description: description || '',
      tags: tags || []
    });
    
    // ✅ CRITICAL: Update category totalAmount
    await PersonalExpenseCategory.findByIdAndUpdate(categoryId, {
      $inc: { totalAmount: Number(amount) },
      lastUpdated: new Date()
    });
    
    res.json({
      success: true,
      data: {
        ...transaction.toObject(),
        categoryId: String(categoryId) // Ensure categoryId is included
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: true, 
      message: error.message 
    });
  }
};

// DELETE /api/transactions/personal-expense/:id
const deletePersonalExpenseTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get transaction first to get categoryId and amount
    const transaction = await PersonalExpenseTransaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ 
        error: true, 
        message: 'Transaction not found' 
      });
    }
    
    const categoryId = transaction.categoryId;
    const amount = transaction.amount;
    
    // Delete transaction
    await PersonalExpenseTransaction.findByIdAndDelete(id);
    
    // ✅ CRITICAL: Decrement category totalAmount
    if (categoryId) {
      await PersonalExpenseCategory.findByIdAndUpdate(categoryId, {
        $inc: { totalAmount: -Number(amount) },
        lastUpdated: new Date()
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Transaction deleted',
      data: { categoryId: String(categoryId) } // Include categoryId in response
    });
  } catch (error) {
    res.status(500).json({ 
      error: true, 
      message: error.message 
    });
  }
};
```

## Notes

1. **Atomic Operations**: Use database transactions to ensure both transaction creation and category update happen together
2. **Error Handling**: If category update fails, rollback transaction creation
3. **Validation**: Ensure category exists before updating
4. **Negative Amounts**: Handle edge cases where totalAmount might go negative (shouldn't happen, but validate)

## Frontend is Ready

The frontend is now properly configured to:
- ✅ Invalidate category queries when transactions are created/deleted
- ✅ Refetch specific category data
- ✅ Show updated totals in ExpenseDetails.jsx
- ✅ Show updated totals in FamilyMemberProfile.jsx

**The issue is likely in the backend not updating the category's `totalAmount` field when transactions are created/deleted.**
