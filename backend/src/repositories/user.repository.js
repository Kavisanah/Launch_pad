import BaseRepository from "./base.repository.js";
import User from "../models/user.model.js";

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByAuth0Sub(auth0Sub) {
    return await this.model.findOne({ auth0Sub });
  }

  async findByEmail(email) {
    return await this.model.findOne({ email });
  }

  async findStudents() {
    return await this.model.find({ role: "STUDENT" });
  }

  async findRecruiters() {
    return await this.model.find({ role: "RECRUITER" });
  }

  async findAdmins() {
    return await this.model.find({ role: "ADMIN" });
  }

  /**
   * Retrieves active users with pagination.
   * @param {number} page 
   * @param {number} limit 
   * @returns {Promise<{users: Array, total: number, page: number, totalPages: number}>}
   */
  async findActiveUsers(page = 1, limit = 12) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.model.find({ isActive: true }).skip(skip).limit(limit).lean(),
      this.model.countDocuments({ isActive: true }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { users, total, page, totalPages };
  }

  /**
   * Searches for active users by name (case-insensitive regex) with pagination.
   * @param {string} query 
   * @param {number} page 
   * @param {number} limit 
   * @returns {Promise<{users: Array, total: number, page: number, totalPages: number}>}
   */
  async searchByName(query, page = 1, limit = 12) {
    const skip = (page - 1) * limit;
    const filter = {
      name: { $regex: query, $options: "i" },
      isActive: true,
    };
    const [users, total] = await Promise.all([
      this.model.find(filter).skip(skip).limit(limit).lean(),
      this.model.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { users, total, page, totalPages };
  }
}

export default UserRepository;