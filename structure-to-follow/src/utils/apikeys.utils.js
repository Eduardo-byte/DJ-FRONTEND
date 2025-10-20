import { SCOPE_GROUPS } from '../api/types/apikey.types';

/**
 * Helper function to get group key from group object
 * @param {string} groupKey - The group key (e.g., 'MESSAGES', 'OPPORTUNITIES')
 * @returns {string} - The formatted group key (e.g., 'messages', 'opportunities')
 */
export const getGroupKey = (groupKey) => {
  return groupKey.toLowerCase().replace('_', '-');
};

/**
 * Helper function to check if a scope matches a resource key exactly
 * @param {string} scope - The scope to check (e.g., "ai:write" or "ai-agent:read")
 * @param {string} resourceKey - The resource key to match (e.g., "ai" or "ai-agent")
 * @returns {boolean} - Whether the scope matches the resource key exactly
 */
const doesScopeMatchResource = (scope, resourceKey) => {
  const [scopeResource] = scope.split(':');
  return scopeResource === resourceKey;
};

/**
 * Helper function to check if all scopes in a group are selected
 * @param {(string|Object)[]} selectedScopes - Array of currently selected scopes
 * @param {string[]} groupScopes - Array of scopes in the group
 * @returns {boolean} - Whether all scopes in the group are selected
 */
export const isGroupFullySelected = (selectedScopes, groupScopes) => {
  // Check if there's a wildcard for this group
  const hasWildcard = selectedScopes.some(scope => {
    if (typeof scope === 'object' && scope !== null) {
      const [key, value] = Object.entries(scope)[0];
      return value === '*' && groupScopes.some(s => doesScopeMatchResource(s, key));
    }
    // Check for string wildcard format (from API)
    if (typeof scope === 'string' && scope.includes(':*')) {
      const [resource] = scope.split(':');
      return groupScopes.some(s => doesScopeMatchResource(s, resource));
    }
    return false;
  });
  
  if (hasWildcard) return true;
  
  // Check if all individual scopes are selected
  return groupScopes.every(s => selectedScopes.includes(s));
};

/**
 * Helper function to create wildcard scope object
 * @param {string} groupKey - The group key (e.g., 'MESSAGES', 'OPPORTUNITIES')
 * @returns {Object} - Wildcard scope object (e.g., {'messages': '*'})
 */
export const createWildcardScope = (groupKey) => {
  const key = getGroupKey(groupKey);
  return { [key]: '*' };
};

/**
 * Helper function to normalize scopes (convert individual scopes to wildcards where applicable)
 * @param {(string|Object)[]} scopes - Array of scopes to normalize
 * @returns {string[]} - Array of normalized scopes in API format
 */
export const normalizeScopes = (scopes) => {
  const normalized = [];
  const processedGroups = new Set();
  
  // First, convert any existing wildcard objects to API string format
  scopes.forEach(scope => {
    if (typeof scope === 'object' && scope !== null) {
      const [key, value] = Object.entries(scope)[0];
      if (value === '*') {
        // Convert object wildcard to API string format
        normalized.push(`${key}:*`);
        processedGroups.add(key);
      }
    }
  });
  
  // Group remaining individual scopes by resource
  Object.entries(SCOPE_GROUPS).forEach(([groupKey, group]) => {
    const groupResourceKey = getGroupKey(groupKey);
    
    if (processedGroups.has(groupResourceKey)) return;
    
    const groupScopes = group.scopes.filter(scope => scopes.includes(scope));
    
    if (groupScopes.length === group.scopes.length) {
      // All scopes in group are present, create wildcard in API string format
      normalized.push(`${groupResourceKey}:*`);
    } else if (groupScopes.length > 0) {
      // Some scopes in group are present, keep individual scopes
      normalized.push(...groupScopes);
    }
  });
  
  // Add any scopes that don't belong to any group
  scopes.forEach(scope => {
    if (typeof scope === 'string' && !Object.values(SCOPE_GROUPS).some(g => g.scopes.includes(scope))) {
      normalized.push(scope);
    }
  });
  
  return normalized;
};

/**
 * Helper function to expand wildcards to individual scopes for UI display
 * @param {(string|Object)[]} scopes - Array of scopes to expand
 * @returns {string[]} - Array of individual scope strings
 */
export const expandScopesForUI = (scopes) => {
  const expanded = [];
  
  scopes.forEach(scope => {
    if (typeof scope === 'object' && scope !== null) {
      const [key, value] = Object.entries(scope)[0];
      if (value === '*') {
        // Find the group and add all its scopes
        const group = Object.values(SCOPE_GROUPS).find(g => 
          g.scopes.some(s => doesScopeMatchResource(s, key))
        );
        if (group) {
          expanded.push(...group.scopes);
        }
      }
    } else if (typeof scope === 'string') {
      // Handle string wildcards from API (like "messages:*")
      if (scope.includes(':*')) {
        const [resource] = scope.split(':');
        const group = Object.values(SCOPE_GROUPS).find(g => 
          g.scopes.some(s => doesScopeMatchResource(s, resource))
        );
        if (group) {
          expanded.push(...group.scopes);
        }
      } else {
        expanded.push(scope);
      }
    }
  });
  
  return expanded;
};

/**
 * Helper function to handle individual checkbox changes
 * @param {string} scope - The scope being changed
 * @param {boolean} isSelected - Whether the scope is being selected or deselected
 * @param {(string|Object)[]} currentScopes - Current array of scopes
 * @param {Function} setScopes - State setter function
 */
export const handleIndividualScopeChange = (scope, isSelected, currentScopes, setScopes) => {
  setScopes(prev => {
    if (isSelected) {
      // Adding a scope
      const newScopes = [...prev];
      
      // Remove any existing wildcard for this group
      const filteredScopes = newScopes.filter(s => {
        if (typeof s === 'object' && s !== null) {
          const [key, value] = Object.entries(s)[0];
          if (value === '*') {
            // Check if this scope belongs to this wildcard group
            const belongsToGroup = Object.values(SCOPE_GROUPS).some(g => 
              g.scopes.includes(scope) && g.scopes.some(gs => doesScopeMatchResource(gs, key))
            );
            if (belongsToGroup) {
              // Expand the wildcard to individual scopes, then add the new one
              const group = Object.values(SCOPE_GROUPS).find(g => 
                g.scopes.some(gs => doesScopeMatchResource(gs, key))
              );
              if (group) {
                newScopes.push(...group.scopes.filter(gs => gs !== scope));
              }
              return false; // Remove the wildcard
            }
          }
        }
        // Handle string wildcard format
        if (typeof s === 'string' && s.includes(':*')) {
          const [resource] = s.split(':');
          const belongsToGroup = Object.values(SCOPE_GROUPS).some(g => 
            g.scopes.includes(scope) && g.scopes.some(gs => doesScopeMatchResource(gs, resource))
          );
          if (belongsToGroup) {
            // Expand the wildcard to individual scopes, then add the new one
            const group = Object.values(SCOPE_GROUPS).find(g => 
              g.scopes.some(gs => doesScopeMatchResource(gs, resource))
            );
            if (group) {
              newScopes.push(...group.scopes.filter(gs => gs !== scope));
            }
            return false; // Remove the wildcard
          }
        }
        return true;
      });
      
      filteredScopes.push(scope);
      return [...new Set(filteredScopes)];
    } else {
      // Removing a scope
      return prev.filter(s => {
        if (typeof s === 'object') return true; // Keep wildcards
        if (typeof s === 'string' && s.includes(':*')) return true; // Keep string wildcards
        return s !== scope; // Remove the individual scope
      });
    }
  });
};

/**
 * Handle group checkbox changes (select/deselect all scopes in a group)
 * @param {(string|Object)[]} currentScopes - Current array of scopes
 * @param {Function} setScopes - State setter function
 * @param {string} groupName - The group name (e.g., 'MESSAGES', 'OPPORTUNITIES')
 * @param {string[]} groupScopes - Array of scopes in the group
 * @param {boolean} isSelected - Whether the group is being selected or deselected
 */
export const handleGroupChange = (currentScopes, setScopes, groupName, groupScopes, isSelected) => {
  setScopes(prev => {
    if (isSelected) {
      // Select all scopes in the group
      // First remove any individual scopes from this group
      const filteredScopes = prev.filter(scope => {
        if (typeof scope === 'string') {
          return !groupScopes.includes(scope);
        }
        return true;
      });
      
      // Add wildcard for this group
      const groupKey = getGroupKey(groupName);
      const wildcard = createWildcardScope(groupName);
      
      return [...filteredScopes, wildcard];
    } else {
      // Deselect all scopes in the group
      const filteredScopes = prev.filter(scope => {
        // Remove individual scopes from this group
        if (typeof scope === 'string' && groupScopes.includes(scope)) {
          return false;
        }
        // Remove wildcard for this group
        if (typeof scope === 'object' && scope !== null) {
          const [key, value] = Object.entries(scope)[0];
          if (value === '*') {
            const groupKey = getGroupKey(groupName);
            return key !== groupKey;
          }
        }
        return true;
      });
      
      return filteredScopes;
    }
  });
};

/**
 * Get scope label for display
 * @param {string|Object} scope - The scope to get label for
 * @returns {string} - Human readable scope label
 */
export const getScopeLabel = (scope) => {
  // Handle wildcard scopes (object format - for UI display)
  if (typeof scope === 'object' && scope !== null) {
    const [groupKey, value] = Object.entries(scope)[0];
    if (value === '*') {
      const group = Object.values(SCOPE_GROUPS).find(g => 
        g.scopes.some(s => doesScopeMatchResource(s, groupKey.toLowerCase().replace('_', '-')))
      );
      return group ? `Full access to ${group.label}` : `Full access to ${groupKey}`;
    }
  }

  // Handle string-based wildcard scopes (from API responses)
  if (typeof scope === 'string' && scope.includes(':*')) {
    const [resource] = scope.split(':');
    const group = Object.values(SCOPE_GROUPS).find(g => 
      g.scopes.some(s => doesScopeMatchResource(s, resource))
    );
    return group ? `Full access to ${group.label}` : `Full access to ${resource}`;
  }

  const labels = {
    'opportunities:read': 'Read Opportunities',
    'opportunities:write': 'Write Opportunities',
    'opportunities:update': 'Update Opportunities',
    'opportunities:delete': 'Delete Opportunities',
    'messages:read': 'Read Messages',
    'messages:write': 'Write Messages',
    'messages:update': 'Update Messages',
    'messages:delete': 'Delete Messages',
    'ai-agent:read': 'Read AI Agents',
    'ai-agent:write': 'Write AI Agents',
    'ai-agent:update': 'Update AI Agents',
    'ai-agent:delete': 'Delete AI Agents',
    'metrics:read': 'Read Metrics',
    'ai:write': 'Generate AI Responses',
    'scraper:read': 'Read Scraper',
    'scraper:write': 'Write Scraper',
    'scraped-content:read': 'Read Scraped Content',
    'scraped-content:update': 'Update Scraped Content',
    'scraped-content:delete': 'Delete Scraped Content',
    'webhooks:read': 'Read Webhooks',
    'webhooks:write': 'Write Webhooks'
  };
  return labels[scope] || scope;
};

/**
 * Convert API scopes to UI format
 * @param {string[]} scopes - Array of scopes from API
 * @returns {(string|Object)[]} - Array of scopes in UI format
 */
export const convertApiScopesToUI = (scopes) => {
  return scopes.map(scope => {
    if (typeof scope === 'string' && scope.includes(':*')) {
      const [resource] = scope.split(':');
      return { [resource]: '*' };
    }
    return scope;
  });
};

/**
 * Format date for display
 * @param {string} dateString - Date string to format
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Check if a date is expired
 * @param {string} expiresAt - Expiration date string
 * @returns {boolean} - Whether the date is expired
 */
export const isExpired = (expiresAt) => {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
};
