import bcrypt from "bcryptjs";

/**
 * Hash a plain-text password
 * @param {string} plainPassword
 * @returns {Promise<string>} hashed password
 */
export const hashPassword = async (plainPassword) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(plainPassword, salt);
  return hash;
};

/**
 * Compare plain-text password with a stored hash
 * @param {string} plainPassword
 * @param {string} hash
 * @returns {Promise<boolean>} true if match
 */
export const comparePassword = async (plainPassword, hash) => {
  return bcrypt.compare(plainPassword, hash);
};