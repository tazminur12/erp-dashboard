# Backend Implementation Guide: Investment Transactions

## Overview
When a user selects "বিনিয়োগ" (Investment) as customer type in `NewTransaction.jsx`, the frontend sends transaction data with investment-specific fields. This document explains what needs to be handled on the backend.

## Frontend Payload Structure

When `customerType === 'investment'`, the frontend sends the following data to `/api/transactions`:

```javascript
{
  transactionType: 'credit' | 'debit', // Transaction type
  partyType: 'investment', // Mapped from customerType
  partyId: 'investment_id', // Investment ID (from IATA or Others Invest)
  customerId: 'investment_id', // Same as partyId (for backward compatibility)
  customerType: 'investment', // Explicit customer type
  serviceCategory: 'investment', // Service category
  category: 'বিনিয়োগ', // Display category in Bengali
  customerName: 'Investment Name', // Investment name (airlineName or investmentName)
  customerPhone: null, // Not applicable for investments
  customerEmail: null, // Not applicable for investments
  customerAddress: null, // Not applicable for investments
  
  // Investment-specific information
  investmentInfo: {
    id: 'investment_id', // Investment ID
    name: 'Investment Name', // Investment name
    category: 'IATA & Airlines Capping' | 'Others Invest', // Investment category
    type: 'IATA' | 'Airlines Capping' | 'Stock' | 'Real Estate' | etc., // Investment type
    amount: 500000 // Investment amount (cappingAmount or investmentAmount)
  },
  
  // Standard transaction fields
  amount: 100000, // Transaction amount
  paymentMethod: 'cash' | 'bank' | 'mobile_banking' | etc.,
  paymentDetails: { ... },
  debitAccount: { ... }, // For debit transactions
  creditAccount: { ... }, // For credit transactions
  notes: 'Transaction notes',
  date: '2024-01-15',
  createdBy: 'user@example.com',
  branchId: 'main_branch',
  // ... other standard fields
}
```

## Backend Requirements

### 1. Transaction Creation Endpoint (`POST /api/transactions`)

The backend should:

1. **Detect Investment Transactions:**
   ```javascript
   const isInvestmentTransaction = 
     req.body.customerType === 'investment' || 
     req.body.partyType === 'investment' ||
     req.body.investmentInfo !== undefined;
   ```

2. **Validate Investment ID:**
   - Check if `partyId` or `customerId` exists in either:
     - `iataAirlinesCapping` collection
     - `othersInvest` collection
   - If not found, return 404 error

3. **Store Investment Reference:**
   - Save `investmentInfo` object in the transaction document
   - Store `partyId` as reference to the investment
   - Store `partyType: 'investment'` for filtering/querying

4. **Transaction Document Structure:**
   ```javascript
   {
     transactionType: 'credit' | 'debit',
     partyType: 'investment',
     partyId: ObjectId('investment_id'),
     customerId: ObjectId('investment_id'), // For backward compatibility
     customerType: 'investment',
     serviceCategory: 'investment',
     category: 'বিনিয়োগ',
     customerName: 'Investment Name',
     
     // Investment-specific data
     investmentInfo: {
       id: 'investment_id',
       name: 'Investment Name',
       category: 'IATA & Airlines Capping' | 'Others Invest',
       type: 'IATA' | 'Stock' | etc.,
       amount: 500000
     },
     
     // Standard fields
     amount: 100000,
     paymentMethod: 'cash',
     paymentDetails: { ... },
     debitAccount: { ... },
     creditAccount: { ... },
     notes: '...',
     date: ISODate('2024-01-15'),
     createdAt: ISODate(),
     updatedAt: ISODate(),
     // ... other fields
   }
   ```

### 2. Transaction Query/Filter Support

Update transaction list/query endpoints to support investment filtering:

```javascript
// GET /api/transactions?partyType=investment
// GET /api/transactions?customerType=investment
// GET /api/transactions?investmentId=xxx

// Example query
const query = {};
if (req.query.partyType === 'investment') {
  query.partyType = 'investment';
}
if (req.query.investmentId) {
  query.partyId = new ObjectId(req.query.investmentId);
}
```

### 3. Investment Transaction Aggregation

Create aggregation endpoints to get investment-related transaction summaries:

```javascript
// GET /api/investments/:id/transactions
// Returns all transactions related to a specific investment

// GET /api/investments/transactions/summary
// Returns summary of all investment transactions
```

### 4. Validation Rules

1. **Investment Existence:**
   - Verify investment exists before creating transaction
   - Check both `iataAirlinesCapping` and `othersInvest` collections

2. **Amount Validation:**
   - Standard amount validation (must be > 0)
   - Optional: Check against investment amount limits

3. **Account Validation:**
   - For debit: Verify source account has sufficient balance
   - For credit: Verify destination account exists

### 5. Example Backend Code

```javascript
// POST /api/transactions
app.post("/api/transactions", async (req, res) => {
  try {
    const {
      customerType,
      partyType,
      partyId,
      customerId,
      investmentInfo,
      // ... other fields
    } = req.body;

    // Check if this is an investment transaction
    if (customerType === 'investment' || partyType === 'investment' || investmentInfo) {
      const investmentId = partyId || customerId;
      
      if (!investmentId) {
        return res.status(400).json({
          success: false,
          message: 'Investment ID is required for investment transactions'
        });
      }

      // Verify investment exists
      const [iataInvestment, othersInvestment] = await Promise.all([
        iataAirlinesCapping.findOne({ 
          _id: new ObjectId(investmentId),
          isActive: { $ne: false }
        }),
        othersInvest.findOne({ 
          _id: new ObjectId(investmentId),
          isActive: { $ne: false }
        })
      ]);

      if (!iataInvestment && !othersInvestment) {
        return res.status(404).json({
          success: false,
          message: 'Investment not found'
        });
      }

      // Use found investment to populate investmentInfo if not provided
      const investment = iataInvestment || othersInvestment;
      const finalInvestmentInfo = investmentInfo || {
        id: String(investment._id),
        name: investment.airlineName || investment.investmentName,
        category: iataInvestment ? 'IATA & Airlines Capping' : 'Others Invest',
        type: investment.investmentType,
        amount: investment.cappingAmount || investment.investmentAmount
      };

      // Create transaction with investment info
      const transaction = {
        transactionType: req.body.transactionType,
        partyType: 'investment',
        partyId: new ObjectId(investmentId),
        customerId: new ObjectId(investmentId), // Backward compatibility
        customerType: 'investment',
        serviceCategory: 'investment',
        category: 'বিনিয়োগ',
        customerName: finalInvestmentInfo.name,
        investmentInfo: finalInvestmentInfo,
        // ... other transaction fields
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await transactions.insertOne(transaction);
      
      return res.status(201).json({
        success: true,
        message: 'Investment transaction created successfully',
        data: {
          _id: String(result.insertedId),
          ...transaction
        }
      });
    }

    // Handle other transaction types...
    
  } catch (error) {
    console.error('❌ Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create transaction',
      error: error.message
    });
  }
});
```

### 6. Transaction List/Query Updates

Update transaction list endpoints to properly display investment transactions:

```javascript
// GET /api/transactions
app.get("/api/transactions", async (req, res) => {
  try {
    const { partyType, customerType, investmentId } = req.query;
    
    const query = {};
    
    // Filter by investment
    if (partyType === 'investment' || customerType === 'investment') {
      query.partyType = 'investment';
    }
    
    if (investmentId) {
      query.partyId = new ObjectId(investmentId);
    }
    
    const transactions = await transactionsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    
    // Format response
    const formattedTransactions = transactions.map(tx => ({
      _id: String(tx._id),
      transactionType: tx.transactionType,
      partyType: tx.partyType,
      partyId: String(tx.partyId),
      customerId: String(tx.customerId),
      customerType: tx.customerType,
      customerName: tx.customerName,
      investmentInfo: tx.investmentInfo || null, // Include investment info
      amount: tx.amount,
      // ... other fields
    }));
    
    res.json({
      success: true,
      data: formattedTransactions
    });
  } catch (error) {
    console.error('❌ Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
});
```

### 7. Investment Transaction Summary

Create endpoint to get transaction summary for an investment:

```javascript
// GET /api/investments/:id/transactions
app.get("/api/investments/:id/transactions", async (req, res) => {
  try {
    const { id } = req.params;
    
    const investmentTransactions = await transactionsCollection
      .find({
        partyType: 'investment',
        partyId: new ObjectId(id)
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Calculate totals
    const totalCredit = investmentTransactions
      .filter(tx => tx.transactionType === 'credit')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
    
    const totalDebit = investmentTransactions
      .filter(tx => tx.transactionType === 'debit')
      .reduce((sum, tx) => sum + (tx.amount || 0), 0);
    
    res.json({
      success: true,
      data: {
        transactions: investmentTransactions,
        summary: {
          totalCredit,
          totalDebit,
          netAmount: totalCredit - totalDebit,
          transactionCount: investmentTransactions.length
        }
      }
    });
  } catch (error) {
    console.error('❌ Get investment transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investment transactions',
      error: error.message
    });
  }
});
```

## Summary

### Key Points:
1. ✅ Detect `customerType === 'investment'` or `partyType === 'investment'`
2. ✅ Validate investment exists in `iataAirlinesCapping` or `othersInvest` collections
3. ✅ Store `investmentInfo` object in transaction document
4. ✅ Support filtering transactions by `partyType: 'investment'`
5. ✅ Include `investmentInfo` in transaction list responses
6. ✅ Create investment-specific transaction summary endpoints

### Fields to Store:
- `partyType: 'investment'`
- `partyId: investment_id`
- `customerType: 'investment'`
- `investmentInfo: { id, name, category, type, amount }`
- `customerName: investment_name`

### Collections to Check:
- `iataAirlinesCapping` - For IATA & Airlines Capping investments
- `othersInvest` - For Other investments
