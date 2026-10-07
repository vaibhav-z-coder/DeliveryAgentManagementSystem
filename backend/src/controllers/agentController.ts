import { Request, Response, NextFunction } from 'express';
import { AgentService } from '../services/agentService';
import { sendSuccess } from '../utils/apiResponse';
import {
  CreateAgentInput,
  UpdateAgentInput,
  QueryAgentsInput,
} from '../validators/agentValidator';

export class AgentController {
  /**
   * POST /api/agents
   * Create a new delivery agent
   */
  public static async createAgent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const agent = await AgentService.createAgent(req.body);
      sendSuccess(res, agent, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/agents
   * List delivery agents with pagination, search, and status filter
   */
  public static async getAgents(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { data, pagination, cached } = await AgentService.getAgents(req.query as any);
      sendSuccess(res, data, 200, pagination, cached);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/agents/:id
   * Get delivery agent details by UUID
   */
  public static async getAgentById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { data, cached } = await AgentService.getAgentById(req.params.id);
      sendSuccess(res, data, 200, undefined, cached);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/agents/:id
   * Update delivery agent details
   */
  public static async updateAgent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const updated = await AgentService.updateAgent(req.params.id, req.body);
      sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/agents/:id/status
   * Toggle or update delivery agent status
   */
  public static async updateStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const updated = await AgentService.updateStatus(req.params.id, req.body.status);
      sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/agents/:id
   * Delete delivery agent by UUID
   */
  public static async deleteAgent(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const deleted = await AgentService.deleteAgent(req.params.id);
      sendSuccess(res, { id: deleted.id, message: 'Delivery agent successfully deleted' }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/agents/stats or /api/stats
   * Get overview statistics
   */
  public static async getStats(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { stats, cached } = await AgentService.getStats();
      sendSuccess(res, stats, 200, undefined, cached);
    } catch (error) {
      next(error);
    }
  }
}
