/**
 * Utility functions for formatting and normalizing data
 */

/**
 * Normalizes a model string to match the format used in the configData.js file
 * 
 * @param {string} modelString - The model string to normalize (e.g., "GPT 4o Mini")
 * @returns {string} - The normalized model string (e.g., "gpt-4o-mini")
 */
export const normalizeModelString = (modelString) => {
  if (!modelString) return '';
  
  // Convert to lowercase
  let normalized = modelString.toLowerCase();
  
  // Replace spaces with hyphens
  normalized = normalized.replace(/\s+/g, '-');
  
  // Handle common variations
  normalized = normalized.replace(/gpt4/g, 'gpt-4');
  normalized = normalized.replace(/gpt3/g, 'gpt-3');
  
  return normalized;
};

/**
 * Finds the matching model key from the available models
 * 
 * @param {string} modelString - The model string to match (e.g., "GPT 4o Mini")
 * @param {Array} availableModels - Array of model objects with key and name properties
 * @returns {string|null} - The matching model key or null if no match is found
 */
export const findMatchingModelKey = (modelString, availableModels) => {
  if (!modelString || !availableModels || !availableModels.length) return null;
  
  // Normalize the input model string
  const normalizedModel = normalizeModelString(modelString);
  
  // Try to find an exact match by key
  const exactMatch = availableModels.find(model => model.key === normalizedModel);
  if (exactMatch) return exactMatch.key;
  
  // Try to find a match by normalized name
  const nameMatch = availableModels.find(model => 
    normalizeModelString(model.name) === normalizedModel
  );
  if (nameMatch) return nameMatch.key;
  
  // Try to find a fuzzy match (ignoring hyphens and spaces completely)
  const fuzzyNormalizedModel = normalizedModel.replace(/-/g, '');
  const fuzzyMatch = availableModels.find(model => 
    model.key.replace(/-/g, '') === fuzzyNormalizedModel ||
    normalizeModelString(model.name).replace(/-/g, '') === fuzzyNormalizedModel
  );
  
  return fuzzyMatch ? fuzzyMatch.key : null;
};

/**
 * Normalizes a goal string to match the format used in the configData.js file
 * Converts spaces to hyphens and makes the string lowercase
 * 
 * @param {string} goalString - The goal string to normalize (e.g., "Customer Support")
 * @returns {string} - The normalized goal string (e.g., "customer-support")
 */
export const normalizeGoalString = (goalString) => {
  if (!goalString) return '';
  
  // Convert to lowercase and replace spaces with hyphens
  return goalString.toLowerCase().replace(/\s+/g, '-');
};

/**
 * Finds the matching goal key from the available goals
 * 
 * @param {string} goalString - The goal string to match (e.g., "Customer Support")
 * @param {Array} availableGoals - Array of goal objects with key and name properties
 * @returns {string|null} - The matching goal key or null if no match is found
 */
export const findMatchingGoalKey = (goalString, availableGoals) => {
  if (!goalString || !availableGoals || !availableGoals.length) return null;
  
  // Normalize the input goal string
  const normalizedGoal = normalizeGoalString(goalString);
  
  // Try to find an exact match by key
  const exactMatch = availableGoals.find(goal => goal.key === normalizedGoal);
  if (exactMatch) return exactMatch.key;
  
  // Try to find a match by normalized name
  const nameMatch = availableGoals.find(goal => 
    normalizeGoalString(goal.name) === normalizedGoal
  );
  if (nameMatch) return nameMatch.key;
  
  // Try to find a fuzzy match (ignoring hyphens and spaces completely)
  const fuzzyNormalizedGoal = normalizedGoal.replace(/-/g, '');
  const fuzzyMatch = availableGoals.find(goal => 
    goal.key.replace(/-/g, '') === fuzzyNormalizedGoal ||
    normalizeGoalString(goal.name).replace(/-/g, '') === fuzzyNormalizedGoal
  );
  
  return fuzzyMatch ? fuzzyMatch.key : null;
};
