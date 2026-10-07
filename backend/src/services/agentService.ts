import { prisma } from '../config/prisma';
import { AgentCache } from '../cache/agentCache';
import {
  CreateAgentInput,
  UpdateAgentInput,
  QueryAgentsInput,
} from '../validators/agentValidator';
import { NotFoundError, ConflictError } from '../utils/errors';
import { PaginationMeta } from '../utils/apiResponse';
import { Agent, AgentStatus, Prisma } from '@prisma/client';

export class AgentService {
  /**
   * Create a new delivery agent
   */
  public static async createAgent(input: CreateAgentInput): Promise<Agent> {
    // Check if email already exists
    const existing = await prisma.agent.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new ConflictError(
        `A delivery agent with email "${input.email}" already exists`,
        'EMAIL_ALREADY_EXISTS'
      );
    }

    const agent = await prisma.agent.create({
      data: {
        fullName: input.fullName,
        phone: input.phone,
        email: input.email,
        serviceArea: input.serviceArea,
        status: input.status as AgentStatus,
        vehicleType: input.vehicleType ?? null,
        vehicleNumber: input.vehicleNumber ?? null,
      },
    });

    // Invalidate Redis list and stats caches
    await AgentCache.onAgentCreated();

    return agent;
  }

  /**
   * Get list of delivery agents with search, filter, and pagination
   */
  public static async getAgents(
    query: QueryAgentsInput
  ): Promise<{ data: Agent[]; pagination: PaginationMeta; cached: boolean }> {
    const cacheKey = AgentCache.getListKey(query);

    // 1. Check Redis Cache
    const cachedResult = await AgentCache.get<{
      data: Agent[];
      pagination: PaginationMeta;
    }>(cacheKey);

    if (cachedResult) {
      return {
        data: cachedResult.data,
        pagination: cachedResult.pagination,
        cached: true,
      };
    }

    // 2. Cache Miss: Query Database
    const { page, limit, status, search, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.AgentWhereInput = {};

    if (status) {
      where.status = status as AgentStatus;
    }

    if (search && search.trim() !== '') {
      const searchTerms = search.trim();
      where.OR = [
        { fullName: { contains: searchTerms, mode: 'insensitive' } },
        { email: { contains: searchTerms, mode: 'insensitive' } },
        { phone: { contains: searchTerms, mode: 'insensitive' } },
        { serviceArea: { contains: searchTerms, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.AgentOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };

    const [total, agents] = await prisma.$transaction([
      prisma.agent.count({ where }),
      prisma.agent.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    // 3. Store in Redis Cache
    await AgentCache.set(cacheKey, { data: agents, pagination });

    return {
      data: agents,
      pagination,
      cached: false,
    };
  }

  /**
   * Get single delivery agent by UUID
   */
  public static async getAgentById(
    id: string
  ): Promise<{ data: Agent; cached: boolean }> {
    const cacheKey = AgentCache.getAgentKey(id);

    // 1. Check Redis Cache
    const cachedAgent = await AgentCache.get<Agent>(cacheKey);
    if (cachedAgent) {
      return { data: cachedAgent, cached: true };
    }

    // 2. Query Database
    const agent = await prisma.agent.findUnique({
      where: { id },
    });

    if (!agent) {
      throw new NotFoundError(`Delivery agent with ID "${id}" was not found`);
    }

    // 3. Store in Redis Cache
    await AgentCache.set(cacheKey, agent);

    return { data: agent, cached: false };
  }

  /**
   * Update an existing delivery agent
   */
  public static async updateAgent(id: string, input: UpdateAgentInput): Promise<Agent> {
    const existing = await prisma.agent.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Delivery agent with ID "${id}" was not found`);
    }

    // If email is changing, verify no conflict
    if (input.email && input.email !== existing.email) {
      const emailTaken = await prisma.agent.findUnique({
        where: { email: input.email },
      });
      if (emailTaken) {
        throw new ConflictError(
          `Email address "${input.email}" is already used by another agent`,
          'EMAIL_ALREADY_EXISTS'
        );
      }
    }

    const updated = await prisma.agent.update({
      where: { id },
      data: {
        ...(input.fullName !== undefined ? { fullName: input.fullName } : {}),
        ...(input.phone !== undefined ? { phone: input.phone } : {}),
        ...(input.email !== undefined ? { email: input.email } : {}),
        ...(input.serviceArea !== undefined ? { serviceArea: input.serviceArea } : {}),
        ...(input.status !== undefined ? { status: input.status as AgentStatus } : {}),
        ...(input.vehicleType !== undefined ? { vehicleType: input.vehicleType } : {}),
        ...(input.vehicleNumber !== undefined ? { vehicleNumber: input.vehicleNumber } : {}),
      },
    });

    // Invalidate Redis cache
    await AgentCache.onAgentUpdated(id);

    return updated;
  }

  /**
   * Update agent status
   */
  public static async updateStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<Agent> {
    const existing = await prisma.agent.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Delivery agent with ID "${id}" was not found`);
    }

    const updated = await prisma.agent.update({
      where: { id },
      data: { status: status as AgentStatus },
    });

    // Invalidate Redis cache
    await AgentCache.onAgentUpdated(id);

    return updated;
  }

  /**
   * Delete delivery agent by UUID
   */
  public static async deleteAgent(id: string): Promise<Agent> {
    const existing = await prisma.agent.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundError(`Delivery agent with ID "${id}" was not found`);
    }

    const deleted = await prisma.agent.delete({
      where: { id },
    });

    // Invalidate Redis cache
    await AgentCache.onAgentDeleted(id);

    return deleted;
  }

  /**
   * Get dashboard statistics
   */
  public static async getStats(): Promise<{ stats: any; cached: boolean }> {
    const cacheKey = AgentCache.getStatsKey();

    const cachedStats = await AgentCache.get<any>(cacheKey);
    if (cachedStats) {
      return { stats: cachedStats, cached: true };
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [total, active, inactive, recentlyAdded, recentAgents] = await prisma.$transaction([
      prisma.agent.count(),
      prisma.agent.count({ where: { status: 'ACTIVE' } }),
      prisma.agent.count({ where: { status: 'INACTIVE' } }),
      prisma.agent.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.agent.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const stats = {
      total,
      active,
      inactive,
      recentlyAdded,
      recentAgents,
    };

    await AgentCache.set(cacheKey, stats, 60);

    return { stats, cached: false };
  }
}
