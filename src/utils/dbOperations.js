import supabase from './supabaseClient';

/**
 * Generic database operations
 */
const dbOperations = {
  /**
   * Fetch data from a table with optional filters
   * @param {string} table - Table name
   * @param {Object} options - Query options
   * @param {Object} [options.filters] - Filter conditions
   * @param {Array} [options.select] - Columns to select
   * @returns {Promise<{data: Array, error: Error}>}
   */
  async fetch(table, { filters = {}, select = ['*'] } = {}) {
    try {
      let query = supabase
        .from(table)
        .select(select.join(','));

      // Apply filters if any
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });

      const { data, error } = await query;
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error(`Error fetching from ${table}:`, error.message);
      return { data: null, error };
    }
  },

  /**
   * Insert data into a table
   * @param {string} table - Table name
   * @param {Object|Array} data - Data to insert
   * @returns {Promise<{data: Array, error: Error}>}
   */
  async insert(table, data) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert(data)
        .select();

      if (error) throw error;

      return { data: result, error: null };
    } catch (error) {
      console.error(`Error inserting into ${table}:`, error.message);
      return { data: null, error };
    }
  },

  /**
   * Update data in a table
   * @param {string} table - Table name
   * @param {Object} data - Data to update
   * @param {Object} match - Match conditions
   * @returns {Promise<{data: Array, error: Error}>}
   */
  async update(table, data, match) {
    try {
      const { data: result, error } = await supabase
        .from(table)
        .update(data)
        .match(match)
        .select();

      if (error) throw error;

      return { data: result, error: null };
    } catch (error) {
      console.error(`Error updating ${table}:`, error.message);
      return { data: null, error };
    }
  }
};

export default dbOperations; 