import Joi from "joi";
import { PROJECT_CATEGORIES } from "../constants/project-categories.js";

const categories = Object.values(PROJECT_CATEGORIES);

const techStackSchema = Joi.alternatives().try(
  Joi.array().items(Joi.string().trim()).max(10),
  Joi.string().trim().custom((value, helpers) => {
    const parts = value.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 10) {
      return helpers.message("Tech stack cannot exceed 10 items");
    }
    return parts;
  })
);

export const createProject = Joi.object({
  title: Joi.string().max(150).required().messages({
    "any.required": "Title is required",
    "string.empty": "Title cannot be empty",
    "string.max": "Title cannot exceed 150 characters",
  }),
  description: Joi.string().max(5000).required().messages({
    "any.required": "Description is required",
    "string.empty": "Description cannot be empty",
    "string.max": "Description cannot exceed 5000 characters",
  }),
  demoLink: Joi.string().uri({ scheme: ["http", "https"] }).allow("").optional().messages({
    "string.uri": "Demo Link must be a valid http or https URL",
  }),
  githubLink: Joi.string().uri({ scheme: ["http", "https"] }).pattern(/^https:\/\/github\.com\//).allow("").optional().messages({
    "string.uri": "GitHub Link must be a valid http or https URL",
    "string.pattern.base": "GitHub Link must match pattern https://github.com/*",
  }),
  category: Joi.string().valid(...categories).required().messages({
    "any.required": "Category is required",
    "any.only": `Category must be one of: ${categories.join(", ")}`,
  }),
  techStack: techStackSchema.optional(),
});

export const updateProject = Joi.object({
  title: Joi.string().max(150).optional().messages({
    "string.empty": "Title cannot be empty",
    "string.max": "Title cannot exceed 150 characters",
  }),
  description: Joi.string().max(5000).optional().messages({
    "string.empty": "Description cannot be empty",
    "string.max": "Description cannot exceed 5000 characters",
  }),
  demoLink: Joi.string().uri({ scheme: ["http", "https"] }).allow("").optional().messages({
    "string.uri": "Demo Link must be a valid http or https URL",
  }),
  githubLink: Joi.string().uri({ scheme: ["http", "https"] }).pattern(/^https:\/\/github\.com\//).allow("").optional().messages({
    "string.uri": "GitHub Link must be a valid http or https URL",
    "string.pattern.base": "GitHub Link must match pattern https://github.com/*",
  }),
  category: Joi.string().valid(...categories).optional().messages({
    "any.only": `Category must be one of: ${categories.join(", ")}`,
  }),
  techStack: techStackSchema.optional(),
});

// Enforces that query filters are strings/numbers, blocking NoSQL inject operators
export const listProjectsQuery = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(50).optional(),
  category: Joi.string().valid(...categories).optional(),
  techStack: Joi.string().trim().optional(),
  status: Joi.string().valid("PENDING", "APPROVED", "REJECTED", "HIDDEN").optional(),
  sortBy: Joi.string().valid("likes", "oldest", "latest").optional(),
});

export const searchProjectsQuery = Joi.object({
  q: Joi.string().trim().allow("").optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(50).optional(),
  category: Joi.string().valid(...categories).optional(),
  techStack: Joi.string().trim().optional(),
  status: Joi.string().valid("PENDING", "APPROVED", "REJECTED", "HIDDEN").optional(),
});

export default {
  createProject,
  updateProject,
  listProjectsQuery,
  searchProjectsQuery,
};
