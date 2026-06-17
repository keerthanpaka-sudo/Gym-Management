const express = require('express');
const router = express.Router();
const NutritionPlan = require('../models/NutritionPlan');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const GOAL_TO_CATEGORY = {
  weight_loss: 'weight-loss',
  muscle_gain: 'muscle-gain',
  maintenance: 'maintenance',
  general_health: 'mediterranean',
};

const DAY_COUNT = 7;

const mealTemplateLibrary = {
  veg: {
    breakfast: ['Paneer Oats Bowl', 'Veggie Upma Plate', 'Greek Yogurt Fruit Bowl', 'Moong Chilla with Chutney', 'Peanut Butter Banana Toast', 'Overnight Oats', 'Vegetable Poha Plate'],
    lunch: ['Paneer Rice Bowl', 'Dal Rice and Salad', 'Chickpea Buddha Bowl', 'Tofu Quinoa Bowl', 'Rajma Rice Plate', 'Vegetable Khichdi Bowl', 'Paneer Wrap Plate'],
    dinner: ['Tofu Stir Fry Bowl', 'Paneer Curry with Roti', 'Lentil Soup Dinner', 'Vegetable Pasta Plate', 'Soy Chunk Rice Bowl', 'Mixed Veg Curry Meal', 'Dal Khichdi Dinner'],
    snack: ['Mixed Nuts', 'Fruit and Yogurt Cup', 'Roasted Chickpeas', 'Protein Smoothie', 'Peanut Chikki', 'Sprouts Chaat', 'Hummus with Veggie Sticks'],
  },
  eggetarian: {
    breakfast: ['Egg Oats Bowl', 'Boiled Eggs and Toast', 'Greek Yogurt Fruit Bowl', 'Veggie Omelette Plate', 'Peanut Butter Banana Toast', 'Egg Bhurji Roti Roll', 'Overnight Oats with Eggs'],
    lunch: ['Egg Rice Bowl', 'Paneer and Egg Salad Bowl', 'Egg Curry with Rice', 'Tofu Quinoa Bowl', 'Dal Rice with Boiled Eggs', 'Vegetable Khichdi with Eggs', 'Paneer Wrap with Egg Side'],
    dinner: ['Egg Curry Dinner', 'Paneer Stir Fry with Eggs', 'Tofu and Egg Rice Bowl', 'Lentil Soup with Omelette', 'Vegetable Pasta with Eggs', 'Soy Chunk Egg Bowl', 'Paneer Curry with Boiled Eggs'],
    snack: ['Boiled Eggs', 'Fruit and Yogurt Cup', 'Roasted Chickpeas', 'Protein Smoothie', 'Peanut Chikki', 'Sprouts Chaat', 'Egg Sandwich Half'],
  },
  non_veg: {
    breakfast: ['Egg Omelette Toast', 'Chicken Sandwich Plate', 'Greek Yogurt Fruit Bowl', 'Boiled Eggs and Oats', 'Protein Smoothie Bowl', 'Egg Bhurji Wrap', 'Peanut Butter Banana Toast'],
    lunch: ['Grilled Chicken Rice Bowl', 'Fish and Veggie Plate', 'Chicken Salad Bowl', 'Turkey Wrap Combo', 'Chicken Quinoa Bowl', 'Egg Fried Rice Plate', 'Grilled Fish Curry Meal'],
    dinner: ['Chicken Curry with Rice', 'Baked Fish and Veggies', 'Chicken Stir Fry Bowl', 'Turkey Rice Plate', 'Egg Curry Dinner', 'Grilled Chicken Pasta Bowl', 'Fish and Sweet Potato Plate'],
    snack: ['Boiled Eggs', 'Fruit and Yogurt Cup', 'Protein Shake', 'Trail Mix', 'Chicken Soup Cup', 'Cottage Cheese Bowl', 'Nuts and Banana'],
  },
};

const mealRatios = {
  breakfast: 0.25,
  lunch: 0.3,
  dinner: 0.3,
  snack: 0.15,
};

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

const ingredientLibrary = {
  veg: {
    breakfast: [
      ['Oats', 'Banana', 'Chia seeds'],
      ['Poha', 'Peanuts', 'Mixed vegetables'],
      ['Paneer', 'Whole wheat toast', 'Cucumber'],
      ['Moong dal batter', 'Mint chutney', 'Carrot salad'],
    ],
    lunch: [
      ['Paneer', 'Brown rice', 'Sauteed vegetables'],
      ['Rajma', 'Jeera rice', 'Salad'],
      ['Tofu', 'Quinoa', 'Broccoli'],
      ['Dal', 'Roti', 'Cucumber salad'],
    ],
    dinner: [
      ['Tofu', 'Millet', 'Stir-fried vegetables'],
      ['Paneer curry', 'Roti', 'Salad'],
      ['Lentil soup', 'Garlic toast', 'Sauteed greens'],
      ['Soy chunks', 'Rice', 'Mixed vegetables'],
    ],
    snack: [
      ['Greek yogurt', 'Apple', 'Almonds'],
      ['Roasted chana', 'Orange'],
      ['Sprouts', 'Lemon', 'Tomato'],
      ['Protein smoothie', 'Peanut butter'],
    ],
  },
  eggetarian: {
    breakfast: [
      ['Eggs', 'Oats', 'Banana'],
      ['Omelette', 'Toast', 'Tomato'],
      ['Boiled eggs', 'Poha', 'Peanuts'],
      ['Egg bhurji', 'Roti', 'Cucumber'],
    ],
    lunch: [
      ['Egg curry', 'Rice', 'Salad'],
      ['Paneer', 'Quinoa', 'Vegetables'],
      ['Boiled eggs', 'Dal rice', 'Cucumber'],
      ['Tofu', 'Roti', 'Broccoli'],
    ],
    dinner: [
      ['Omelette', 'Millet', 'Sauteed vegetables'],
      ['Egg curry', 'Roti', 'Salad'],
      ['Paneer stir fry', 'Rice', 'Beans'],
      ['Tofu', 'Soup', 'Carrot salad'],
    ],
    snack: [
      ['Boiled eggs', 'Fruit'],
      ['Greek yogurt', 'Nuts'],
      ['Roasted chana', 'Apple'],
      ['Protein shake', 'Banana'],
    ],
  },
  non_veg: {
    breakfast: [
      ['Eggs', 'Toast', 'Avocado'],
      ['Chicken sandwich', 'Cucumber'],
      ['Boiled eggs', 'Oats', 'Banana'],
      ['Egg bhurji', 'Wrap', 'Tomato'],
    ],
    lunch: [
      ['Chicken breast', 'Brown rice', 'Broccoli'],
      ['Fish fillet', 'Rice', 'Salad'],
      ['Chicken salad', 'Quinoa'],
      ['Turkey wrap', 'Sauteed vegetables'],
    ],
    dinner: [
      ['Chicken curry', 'Rice', 'Beans'],
      ['Baked fish', 'Sweet potato', 'Salad'],
      ['Chicken stir fry', 'Noodles', 'Vegetables'],
      ['Egg curry', 'Roti', 'Cucumber'],
    ],
    snack: [
      ['Boiled eggs', 'Apple'],
      ['Protein shake', 'Banana'],
      ['Chicken soup', 'Crackers'],
      ['Yogurt', 'Trail mix'],
    ],
  },
};

const formatGoalLabel = (goal = 'general_health') => goal.replace(/_/g, ' ');

const getPortionProfile = (weight) => {
  if (weight <= 50) {
    return {
      proteinServing: '100 g',
      grainServing: '1 cup',
      produceServing: '1 cup',
      snackServing: '1 small bowl',
    };
  }

  if (weight <= 70) {
    return {
      proteinServing: '150 g',
      grainServing: '1.5 cups',
      produceServing: '1.5 cups',
      snackServing: '1 medium bowl',
    };
  }

  return {
    proteinServing: '200 g',
    grainServing: '2 cups',
    produceServing: '2 cups',
    snackServing: '1 large bowl',
  };
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeIngredient = (ingredient) => {
  if (typeof ingredient === 'string') {
    return { name: ingredient.trim(), quantity: '' };
  }

  if (!ingredient || typeof ingredient !== 'object') {
    return null;
  }

  return {
    name: ingredient.name || ingredient.item || '',
    quantity: ingredient.quantity || '',
    calories: toNumber(ingredient.calories),
    protein: toNumber(ingredient.protein),
    carbs: toNumber(ingredient.carbs),
    fat: toNumber(ingredient.fat),
  };
};

const buildMealIngredients = (dietPreference, mealType, day) => {
  const library = ingredientLibrary[dietPreference] || ingredientLibrary.veg;
  const ingredientSets = library[mealType] || [];
  const selectedSet = ingredientSets[(day - 1) % Math.max(ingredientSets.length, 1)] || [];

  return selectedSet.map((name) => ({ name, quantity: '' }));
};

const buildGeneratedMeal = (dietPreference, day, mealType, calories, dailyMacros, weight) => {
  const templates = mealTemplateLibrary[dietPreference] || mealTemplateLibrary.veg;
  const mealNames = templates[mealType] || [];
  const mealCalories = Math.round(calories * mealRatios[mealType]);
  const macroShare = mealRatios[mealType];
  const protein = Math.round((dailyMacros.protein || 0) * macroShare);
  const carbs = Math.round((dailyMacros.carbs || 0) * macroShare);
  const fat = Math.round((dailyMacros.fat || 0) * macroShare);
  const portionProfile = getPortionProfile(weight);
  const baseIngredients = buildMealIngredients(dietPreference, mealType, day).map((ingredient, index) => {
    if (index === 0) {
      return {
        ...ingredient,
        quantity: mealType === 'snack' ? portionProfile.snackServing : portionProfile.proteinServing,
      };
    }

    if (index === 1) {
      return {
        ...ingredient,
        quantity: mealType === 'snack' ? portionProfile.snackServing : portionProfile.grainServing,
      };
    }

    return {
      ...ingredient,
      quantity: portionProfile.produceServing,
    };
  });

  return {
    day,
    type: mealType,
    mealType,
    name: mealNames[(day - 1) % mealNames.length] || `${mealType} meal`,
    calories: mealCalories,
    totalCalories: mealCalories,
    protein,
    carbs,
    fat,
    ingredients: baseIngredients,
    instructions: `Prepare a balanced ${mealType} for Day ${day} for a ${weight} kg member using ${portionProfile.proteinServing} protein portions and a ${dietPreference === 'veg' ? 'vegetarian' : dietPreference === 'eggetarian' ? 'eggetarian' : 'non-vegetarian'} meal pattern.`,
  };
};

const goalCalorieMultiplier = {
  weight_loss: 28,
  muscle_gain: 35,
  maintenance: 31,
  general_health: 30,
};

const goalMacroProfile = {
  weight_loss: { proteinPerKg: 1.8, fatPerKg: 0.7 },
  muscle_gain: { proteinPerKg: 2, fatPerKg: 0.9 },
  maintenance: { proteinPerKg: 1.6, fatPerKg: 0.8 },
  general_health: { proteinPerKg: 1.5, fatPerKg: 0.8 },
};

const calculateCaloriesFromWeight = (weight, goal) => {
  const multiplier = goalCalorieMultiplier[goal] || goalCalorieMultiplier.general_health;
  return Math.round(weight * multiplier);
};

const calculateMacrosFromWeight = (weight, calories, goal) => {
  const profile = goalMacroProfile[goal] || goalMacroProfile.general_health;
  const protein = Math.round(weight * profile.proteinPerKg);
  const fat = Math.round(weight * profile.fatPerKg);
  const carbsCalories = Math.max(calories - ((protein * 4) + (fat * 9)), 0);
  const carbs = Math.round(carbsCalories / 4);
  return { protein, carbs, fat };
};

const buildAutoMeals = ({ weight, dietPreference, calories, macros, goal }) => {
  const safeWeight = Math.max(toNumber(weight, 60), 30);
  const safeDietPreference = ['veg', 'eggetarian', 'non_veg'].includes(dietPreference) ? dietPreference : 'veg';
  const safeGoal = goal || 'general_health';
  const safeCalories = Math.max(toNumber(calories, calculateCaloriesFromWeight(safeWeight, safeGoal)), 1200);
  const inferredMacros = calculateMacrosFromWeight(safeWeight, safeCalories, safeGoal);
  const resolvedMacros = {
    protein: toNumber(macros?.protein) || inferredMacros.protein,
    carbs: toNumber(macros?.carbs) || inferredMacros.carbs,
    fat: toNumber(macros?.fat) || inferredMacros.fat,
  };

  const meals = [];
  for (let day = 1; day <= DAY_COUNT; day += 1) {
    mealTypes.forEach((mealType) => {
      meals.push(buildGeneratedMeal(safeDietPreference, day, mealType, safeCalories, resolvedMacros, safeWeight));
    });
  }

  return { meals, macros: resolvedMacros, calories: safeCalories };
};

const normalizeMeals = (meals = []) => {
  return meals
    .map((meal, index) => {
      const mealType = meal.mealType || meal.type || 'breakfast';
      const normalizedIngredients = Array.isArray(meal.ingredients)
        ? meal.ingredients.map(normalizeIngredient).filter(Boolean)
        : [];

      const calories = toNumber(meal.calories ?? meal.totalCalories);
      return {
        day: Math.max(toNumber(meal.day, Math.floor(index / mealTypes.length) + 1), 1),
        type: mealType,
        mealType,
        name: meal.name || `${mealType} meal`,
        calories,
        totalCalories: calories,
        protein: toNumber(meal.protein),
        carbs: toNumber(meal.carbs),
        fat: toNumber(meal.fat),
        ingredients: normalizedIngredients,
        instructions: meal.instructions || '',
        image: meal.image || '',
      };
    })
    .sort((a, b) => (a.day - b.day) || mealTypes.indexOf(a.mealType) - mealTypes.indexOf(b.mealType));
};

const normalizePlanPayload = (payload, fallbackUserId, fallbackAssignedBy) => {
  const goal = payload.goal || 'general_health';
  const weight = toNumber(payload.weight, 0);
  const dietPreference = ['veg', 'eggetarian', 'non_veg'].includes(payload.dietPreference) ? payload.dietPreference : 'veg';
  const calories = toNumber(payload.calories, 0);
  const providedMacros = {
    protein: toNumber(payload.macros?.protein ?? payload.protein),
    carbs: toNumber(payload.macros?.carbs ?? payload.carbs),
    fat: toNumber(payload.macros?.fat ?? payload.fat ?? payload.fats),
  };

  const autoGenerated = !Array.isArray(payload.meals) || payload.meals.length === 0;
  const generated = autoGenerated ? buildAutoMeals({ weight, dietPreference, calories, macros: providedMacros, goal }) : null;
  const macros = generated?.macros || providedMacros;
  const meals = autoGenerated ? generated.meals : normalizeMeals(payload.meals);
  const resolvedCalories = generated?.calories || calories;
  const preferenceLabel = dietPreference === 'non_veg' ? 'Non-Veg' : dietPreference === 'eggetarian' ? 'Eggetarian' : 'Veg';
  const planName = payload.name || payload.title || `${weight}kg ${formatGoalLabel(goal)} ${preferenceLabel} Nutrition Plan`;

  return {
    user: payload.user || fallbackUserId,
    assignedBy: payload.assignedBy || fallbackAssignedBy,
    name: planName,
    title: payload.title || planName,
    description: payload.description || `Auto-generated ${formatGoalLabel(goal).toLowerCase()} nutrition plan for a ${weight} kg member with a ${dietPreference === 'veg' ? 'vegetarian' : dietPreference === 'eggetarian' ? 'eggetarian' : 'non-vegetarian'} preference, including portion sizes adjusted to body weight.`,
    goal,
    weight,
    dietPreference,
    category: payload.category || GOAL_TO_CATEGORY[goal] || 'maintenance',
    calories: resolvedCalories,
    macros,
    protein: macros.protein,
    carbs: macros.carbs,
    fat: macros.fat,
    fats: macros.fat,
    duration: Math.max(toNumber(payload.duration, 1), 1),
    targetCalories: payload.targetCalories || {
      min: resolvedCalories ? Math.max(resolvedCalories - 100, 0) : 0,
      max: resolvedCalories ? resolvedCalories + 100 : 0,
    },
    difficulty: payload.difficulty || 'beginner',
    meals,
    supplements: Array.isArray(payload.supplements) ? payload.supplements : [],
    updatedAt: Date.now(),
  };
};

// Get all nutrition plans for a user
router.get('/', auth, async (req, res) => {
  try {
    const { userId } = req.query;
    const user = userId || req.user.id;

    // Check permissions - users can only see their own plans, trainers can see their clients' plans
    if (req.user.role !== 'admin' && req.user.role !== 'trainer' && req.user.id !== user) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const plans = await NutritionPlan.find({ user })
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(plans);
  } catch (error) {
    console.error('Error fetching nutrition plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get nutrition plan by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const plan = await NutritionPlan.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedBy', 'name email');

    if (!plan) {
      return res.status(404).json({ message: 'Nutrition plan not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'trainer' && req.user.id !== plan.user.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Error fetching nutrition plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create nutrition plan
router.post('/', [
  auth,
  body('user').optional().isMongoId().withMessage('Valid user ID required'),
  body('weight').isNumeric().withMessage('Weight must be a number'),
  body('dietPreference').isIn(['veg', 'eggetarian', 'non_veg']).withMessage('Diet preference must be veg, eggetarian or non_veg'),
  body('goal').optional().isIn(['weight_loss', 'muscle_gain', 'maintenance', 'general_health']).withMessage('Invalid goal'),
  body('calories').optional().isNumeric().withMessage('Calories must be a number'),
  body('meals').optional().isArray().withMessage('Meals must be an array'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const bodyUser = req.body.user;
    const targetUser = bodyUser || req.user.id;

    // Check permissions - only trainers and admins can create plans for others
    if (req.user.role !== 'admin' && req.user.role !== 'trainer' && req.user.id !== targetUser) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const plan = new NutritionPlan(
      normalizePlanPayload(req.body, targetUser, req.user.id)
    );

    await plan.save();
    await plan.populate('user', 'name email');
    await plan.populate('assignedBy', 'name email');

    res.status(201).json(plan);
  } catch (error) {
    console.error('Error creating nutrition plan:', error);
    res.status(500).json({
      message: error.message || 'Server error',
    });
  }
});

// Update nutrition plan
router.put('/:id', auth, async (req, res) => {
  try {
    const plan = await NutritionPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Nutrition plan not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'trainer' && req.user.id !== plan.user.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const mergedPayload = {
      ...plan.toObject(),
      ...req.body,
      meals: req.body.meals !== undefined ? req.body.meals : plan.meals,
    };

    const updatedPlan = await NutritionPlan.findByIdAndUpdate(
      req.params.id,
      normalizePlanPayload(mergedPayload, plan.user.toString(), plan.assignedBy?.toString() || req.user.id),
      { new: true }
    ).populate('user', 'name email').populate('assignedBy', 'name email');

    res.json(updatedPlan);
  } catch (error) {
    console.error('Error updating nutrition plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete nutrition plan
router.delete('/:id', auth, async (req, res) => {
  try {
    const plan = await NutritionPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Nutrition plan not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'trainer' && req.user.id !== plan.user.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await NutritionPlan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Nutrition plan deleted successfully' });
  } catch (error) {
    console.error('Error deleting nutrition plan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Log nutrition intake
router.post('/:id/log', auth, async (req, res) => {
  try {
    const { date, mealType, food, calories, macros } = req.body;

    const plan = await NutritionPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'Nutrition plan not found' });
    }

    // Check permissions
    if (req.user.id !== plan.user.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const logEntry = {
      date: date || new Date(),
      mealType,
      food,
      calories,
      macros,
    };

    plan.nutritionLogs.push(logEntry);
    await plan.save();

    res.status(201).json(logEntry);
  } catch (error) {
    console.error('Error logging nutrition:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
