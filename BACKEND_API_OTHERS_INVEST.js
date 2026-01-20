// ==================== OTHERS INVEST CRUD ====================
// Add this code to your backend server file (e.g., index.js, server.js, or routes file)
// Make sure you have MongoDB collection set up: const othersInvest = db.collection('othersInvest');

// ✅ POST: Create new Others Invest investment
app.post("/api/investments/others-invest", async (req, res) => {
  try {
    const {
      investmentName,
      investmentType,
      investmentAmount,
      investmentDate,
      maturityDate,
      interestRate,
      returnAmount,
      status,
      description,
      notes,
      logo
    } = req.body;

    // Validate required fields
    if (!investmentName || !investmentName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Investment name is required'
      });
    }

    if (!investmentType || !investmentType.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Investment type is required'
      });
    }

    if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Investment amount is required and must be greater than 0'
      });
    }

    if (!investmentDate) {
      return res.status(400).json({
        success: false,
        message: 'Investment date is required'
      });
    }

    if (!maturityDate) {
      return res.status(400).json({
        success: false,
        message: 'Maturity date is required'
      });
    }

    // Validate date logic
    const invDate = new Date(investmentDate);
    const matDate = new Date(maturityDate);
    
    if (isNaN(invDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid investment date format'
      });
    }

    if (isNaN(matDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid maturity date format'
      });
    }

    if (matDate <= invDate) {
      return res.status(400).json({
        success: false,
        message: 'Maturity date must be after investment date'
      });
    }

    if (interestRate === undefined || interestRate === null || interestRate === '') {
      return res.status(400).json({
        success: false,
        message: 'Interest rate is required'
      });
    }

    const interestRateNum = parseFloat(interestRate);
    if (isNaN(interestRateNum) || interestRateNum < 0 || interestRateNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'Interest rate must be between 0 and 100'
      });
    }

    if (returnAmount !== undefined && returnAmount !== null && returnAmount !== '') {
      const returnAmountNum = parseFloat(returnAmount);
      if (isNaN(returnAmountNum) || returnAmountNum < 0) {
        return res.status(400).json({
          success: false,
          message: 'Return amount must be 0 or greater'
        });
      }
    }

    if (!status || !['active', 'matured', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status is required and must be "active", "matured", or "closed"'
      });
    }

    // Create investment document
    const investment = {
      investmentName: investmentName.trim(),
      investmentType: investmentType.trim(),
      investmentAmount: parseFloat(investmentAmount),
      investmentDate: invDate,
      maturityDate: matDate,
      interestRate: interestRateNum,
      returnAmount: returnAmount ? parseFloat(returnAmount) : 0,
      status: status,
      description: description ? String(description).trim() : '',
      notes: notes ? String(notes).trim() : '',
      logo: logo ? String(logo).trim() : '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await othersInvest.insertOne(investment);

    res.status(201).json({
      success: true,
      message: 'Others Invest investment created successfully',
      data: {
        _id: String(result.insertedId),
        id: String(result.insertedId),
        ...investment
      }
    });

  } catch (error) {
    console.error('❌ Create Others Invest investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create investment',
      error: error.message
    });
  }
});

// ✅ GET: Get all Others Invest investments with filters and pagination
app.get("/api/investments/others-invest", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      q, // search query
      investmentType,
      status,
      dateFrom,
      dateTo,
      maturityDateFrom,
      maturityDateTo
    } = req.query || {};

    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = {
      isActive: { $ne: false }
    };

    // Search filter
    if (q) {
      const searchTerm = String(q).trim();
      query.$or = [
        { investmentName: { $regex: searchTerm, $options: 'i' } },
        { investmentType: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { notes: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Other filters
    if (investmentType) {
      query.investmentType = investmentType;
    }
    if (status) {
      query.status = status;
    }
    if (dateFrom || dateTo) {
      query.investmentDate = {};
      if (dateFrom) {
        query.investmentDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        query.investmentDate.$lte = toDate;
      }
    }
    if (maturityDateFrom || maturityDateTo) {
      query.maturityDate = {};
      if (maturityDateFrom) {
        query.maturityDate.$gte = new Date(maturityDateFrom);
      }
      if (maturityDateTo) {
        const toDate = new Date(maturityDateTo);
        toDate.setHours(23, 59, 59, 999);
        query.maturityDate.$lte = toDate;
      }
    }

    // Get total count
    const total = await othersInvest.countDocuments(query);

    // Get investments
    const investments = await othersInvest
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray();

    // Format response
    const formattedInvestments = investments.map(inv => ({
      _id: String(inv._id),
      id: String(inv._id),
      investmentName: inv.investmentName || '',
      investmentType: inv.investmentType || '',
      investmentAmount: Number(inv.investmentAmount) || 0,
      investmentDate: inv.investmentDate,
      maturityDate: inv.maturityDate,
      interestRate: Number(inv.interestRate) || 0,
      returnAmount: Number(inv.returnAmount) || 0,
      status: inv.status || 'active',
      description: inv.description || '',
      notes: inv.notes || '',
      logo: inv.logo || '',
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt
    }));

    res.json({
      success: true,
      data: formattedInvestments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error('❌ Get Others Invest investments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investments',
      error: error.message
    });
  }
});

// ✅ GET: Get single Others Invest investment by ID
app.get("/api/investments/others-invest/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid investment ID'
      });
    }

    const investment = await othersInvest.findOne({
      _id: new ObjectId(id),
      isActive: { $ne: false }
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    res.json({
      success: true,
      data: {
        _id: String(investment._id),
        id: String(investment._id),
        investmentName: investment.investmentName || '',
        investmentType: investment.investmentType || '',
        investmentAmount: Number(investment.investmentAmount) || 0,
        investmentDate: investment.investmentDate,
        maturityDate: investment.maturityDate,
        interestRate: Number(investment.interestRate) || 0,
        returnAmount: Number(investment.returnAmount) || 0,
        status: investment.status || 'active',
        description: investment.description || '',
        notes: investment.notes || '',
        logo: investment.logo || '',
        createdAt: investment.createdAt,
        updatedAt: investment.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Get Others Invest investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch investment',
      error: error.message
    });
  }
});

// ✅ PUT: Update Others Invest investment by ID
app.put("/api/investments/others-invest/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid investment ID'
      });
    }

    const existingInvestment = await othersInvest.findOne({
      _id: new ObjectId(id),
      isActive: { $ne: false }
    });

    if (!existingInvestment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    // Prepare update document
    const updateDoc = {
      updatedAt: new Date()
    };

    // Update fields if provided
    if (updateData.investmentName !== undefined) {
      if (!updateData.investmentName || !updateData.investmentName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Investment name cannot be empty'
        });
      }
      updateDoc.investmentName = updateData.investmentName.trim();
    }

    if (updateData.investmentType !== undefined) {
      if (!updateData.investmentType || !updateData.investmentType.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Investment type cannot be empty'
        });
      }
      updateDoc.investmentType = updateData.investmentType.trim();
    }

    if (updateData.investmentAmount !== undefined) {
      const amount = parseFloat(updateData.investmentAmount);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Investment amount must be a positive number'
        });
      }
      updateDoc.investmentAmount = amount;
    }

    if (updateData.returnAmount !== undefined && updateData.returnAmount !== null && updateData.returnAmount !== '') {
      const returnAmount = parseFloat(updateData.returnAmount);
      if (isNaN(returnAmount) || returnAmount < 0) {
        return res.status(400).json({
          success: false,
          message: 'Return amount must be 0 or greater'
        });
      }
      updateDoc.returnAmount = returnAmount;
    }

    if (updateData.investmentDate !== undefined) {
      const invDate = new Date(updateData.investmentDate);
      if (isNaN(invDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid investment date format'
        });
      }
      updateDoc.investmentDate = invDate;
    }

    if (updateData.maturityDate !== undefined) {
      const matDate = new Date(updateData.maturityDate);
      if (isNaN(matDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid maturity date format'
        });
      }
      updateDoc.maturityDate = matDate;
    }

    // Validate date logic if both dates are being updated
    if (updateDoc.investmentDate && updateDoc.maturityDate) {
      if (updateDoc.maturityDate <= updateDoc.investmentDate) {
        return res.status(400).json({
          success: false,
          message: 'Maturity date must be after investment date'
        });
      }
    } else if (updateDoc.investmentDate && existingInvestment.maturityDate) {
      if (existingInvestment.maturityDate <= updateDoc.investmentDate) {
        return res.status(400).json({
          success: false,
          message: 'Maturity date must be after investment date'
        });
      }
    } else if (updateDoc.maturityDate && existingInvestment.investmentDate) {
      if (updateDoc.maturityDate <= existingInvestment.investmentDate) {
        return res.status(400).json({
          success: false,
          message: 'Maturity date must be after investment date'
        });
      }
    }

    if (updateData.interestRate !== undefined) {
      const interestRateNum = parseFloat(updateData.interestRate);
      if (isNaN(interestRateNum) || interestRateNum < 0 || interestRateNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'Interest rate must be between 0 and 100'
        });
      }
      updateDoc.interestRate = interestRateNum;
    }

    if (updateData.status !== undefined) {
      if (!['active', 'matured', 'closed'].includes(updateData.status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be "active", "matured", or "closed"'
        });
      }
      updateDoc.status = updateData.status;
    }

    if (updateData.description !== undefined) {
      updateDoc.description = String(updateData.description || '').trim();
    }

    if (updateData.notes !== undefined) {
      updateDoc.notes = String(updateData.notes || '').trim();
    }

    if (updateData.logo !== undefined) {
      updateDoc.logo = String(updateData.logo || '').trim();
    }

    // Update investment
    const result = await othersInvest.updateOne(
      { _id: new ObjectId(id), isActive: { $ne: false } },
      { $set: updateDoc }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    const updatedInvestment = await othersInvest.findOne({
      _id: new ObjectId(id),
      isActive: { $ne: false }
    });

    res.json({
      success: true,
      message: 'Investment updated successfully',
      data: {
        _id: String(updatedInvestment._id),
        id: String(updatedInvestment._id),
        investmentName: updatedInvestment.investmentName || '',
        investmentType: updatedInvestment.investmentType || '',
        investmentAmount: Number(updatedInvestment.investmentAmount) || 0,
        investmentDate: updatedInvestment.investmentDate,
        maturityDate: updatedInvestment.maturityDate,
        interestRate: Number(updatedInvestment.interestRate) || 0,
        returnAmount: Number(updatedInvestment.returnAmount) || 0,
        status: updatedInvestment.status || 'active',
        description: updatedInvestment.description || '',
        notes: updatedInvestment.notes || '',
        logo: updatedInvestment.logo || '',
        createdAt: updatedInvestment.createdAt,
        updatedAt: updatedInvestment.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Update Others Invest investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update investment',
      error: error.message
    });
  }
});

// ✅ DELETE: Delete Others Invest investment by ID (soft delete)
app.delete("/api/investments/others-invest/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid investment ID'
      });
    }

    const existingInvestment = await othersInvest.findOne({
      _id: new ObjectId(id),
      isActive: { $ne: false }
    });

    if (!existingInvestment) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    const result = await othersInvest.updateOne(
      { _id: new ObjectId(id), isActive: { $ne: false } },
      {
        $set: {
          isActive: false,
          deletedAt: new Date(),
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Investment not found'
      });
    }

    res.json({
      success: true,
      message: 'Investment deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete Others Invest investment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete investment',
      error: error.message
    });
  }
});
