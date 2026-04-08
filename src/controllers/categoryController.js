import Category from "../models/job/categoryModel.js";
import SubCategory from "../models/job/subCategoryModel.js";
import AppError from "../utils/appError.js";
import asyncErrorHandler from "../utils/asyncErrorHandler.js";

export const createCategory = asyncErrorHandler(async (req, res, next) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return next(new AppError("Category name is required", 400));
  }

  const existing = await Category.findOne({ name: name.trim() });
  if (existing) {
    return next(new AppError("Category with this name already exists", 409));
  }

  const category = await Category.create({ name: name.trim() });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    category,
  });
});

export const getAllCategories = asyncErrorHandler(async (req, res, next) => {
  const { withSubCategories } = req.query;

  const categories = await Category.find().sort({ createdAt: -1 });

  // Optionally attach subcategories to each category
  if (withSubCategories === "true") {
    const categoriesWithSubs = await Promise.all(
      categories.map(async (cat) => {
        const subCategories = await SubCategory.find(
          { category: cat._id },
          "name _id",
        );
        return { ...cat.toObject(), subCategories };
      }),
    );

    return res.status(200).json({
      success: true,
      count: categoriesWithSubs.length,
      categories: categoriesWithSubs,
    });
  }

  res.status(200).json({
    success: true,
    count: categories.length,
    categories,
  });
});

export const getCategoryById = asyncErrorHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  const subCategories = await SubCategory.find(
    { category: category._id },
    "name _id",
  );

  res.status(200).json({
    success: true,
    category: { ...category.toObject(), subCategories },
  });
});

export const updateCategory = asyncErrorHandler(async (req, res, next) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    return next(new AppError("Category name is required", 400));
  }

  // Check for name conflict with another category
  const conflict = await Category.findOne({
    name: name.trim(),
    _id: { $ne: req.params.id },
  });

  if (conflict) {
    return next(
      new AppError("Another category with this name already exists", 409),
    );
  }

  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name: name.trim() },
    { new: true, runValidators: true },
  );

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    category,
  });
});

export const deleteCategory = asyncErrorHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new AppError("Category not found", 404));
  }

  // Cascade delete all subcategories belonging to this category
  await SubCategory.deleteMany({ category: category._id });

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: "Category and its subcategories deleted successfully",
  });
});

// ─── SUBCATEGORY ─────────────────────────────────────────────────────────────

export const createSubCategory = asyncErrorHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return next(new AppError("Subcategory name is required", 400));
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    return next(new AppError("Parent category not found", 404));
  }

  // Unique per category (index already enforced in schema)
  const existing = await SubCategory.findOne({
    name: name.trim(),
    category: categoryId,
  });

  if (existing) {
    return next(
      new AppError(
        `Subcategory "${name.trim()}" already exists under "${category.name}"`,
        409,
      ),
    );
  }

  const subCategory = await SubCategory.create({
    name: name.trim(),
    category: categoryId,
  });

  res.status(201).json({
    success: true,
    message: "Subcategory created successfully",
    subCategory,
  });
});

/**
 * @desc    Get all subcategories for a category
 * @route   GET /api/admin/categories/:categoryId/subcategories
 * @access  Admin / Public
 */
export const getSubCategoriesByCategory = asyncErrorHandler(
  async (req, res, next) => {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
      return next(new AppError("Parent category not found", 404));
    }

    const subCategories = await SubCategory.find({ category: categoryId }).sort(
      {
        createdAt: -1,
      },
    );

    res.status(200).json({
      success: true,
      category: category.name,
      count: subCategories.length,
      subCategories,
    });
  },
);

/**
 * @desc    Get a single subcategory by its ID
 * @route   GET /api/admin/subcategories/:id
 * @access  Admin / Public
 */
export const getSubCategoryById = asyncErrorHandler(async (req, res, next) => {
  const subCategory = await SubCategory.findById(req.params.id).populate(
    "category",
    "name",
  );

  if (!subCategory) {
    return next(new AppError("Subcategory not found", 404));
  }

  res.status(200).json({
    success: true,
    subCategory,
  });
});

/**
 * @desc    Update a subcategory (name or parent category)
 * @route   PUT /api/admin/subcategories/:id
 * @access  Admin
 */
export const updateSubCategory = asyncErrorHandler(async (req, res, next) => {
  const { name, categoryId } = req.body;

  if (!name || !name.trim()) {
    return next(new AppError("Subcategory name is required", 400));
  }

  const subCategory = await SubCategory.findById(req.params.id);
  if (!subCategory) {
    return next(new AppError("Subcategory not found", 404));
  }

  // Use incoming categoryId or keep the existing one
  const targetCategoryId = categoryId || subCategory.category;

  const targetCategory = await Category.findById(targetCategoryId);
  if (!targetCategory) {
    return next(new AppError("Target category not found", 404));
  }

  // Check for name conflict within the target category
  const conflict = await SubCategory.findOne({
    name: name.trim(),
    category: targetCategoryId,
    _id: { $ne: req.params.id },
  });

  if (conflict) {
    return next(
      new AppError(
        `Subcategory "${name.trim()}" already exists under "${targetCategory.name}"`,
        409,
      ),
    );
  }

  subCategory.name = name.trim();
  subCategory.category = targetCategoryId;
  await subCategory.save();

  const updated = await SubCategory.findById(subCategory._id).populate(
    "category",
    "name",
  );

  res.status(200).json({
    success: true,
    message: "Subcategory updated successfully",
    subCategory: updated,
  });
});

/**
 * @desc    Delete a subcategory
 * @route   DELETE /api/admin/subcategories/:id
 * @access  Admin
 */
export const deleteSubCategory = asyncErrorHandler(async (req, res, next) => {
  const subCategory = await SubCategory.findById(req.params.id);

  if (!subCategory) {
    return next(new AppError("Subcategory not found", 404));
  }

  await subCategory.deleteOne();

  res.status(200).json({
    success: true,
    message: "Subcategory deleted successfully",
  });
});
