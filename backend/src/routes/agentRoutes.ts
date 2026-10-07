import { Router } from 'express';
import { AgentController } from '../controllers/agentController';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '../middleware/validateRequest';
import {
  createAgentSchema,
  updateAgentSchema,
  updateStatusSchema,
  queryAgentsSchema,
  agentIdParamSchema,
} from '../validators/agentValidator';

const router = Router();

// Stats overview
router.get('/stats', AgentController.getStats);

// List agents with query validation (page, limit, status, search, etc.)
router.get('/', validateQuery(queryAgentsSchema), AgentController.getAgents);

// Get single agent by ID
router.get('/:id', validateParams(agentIdParamSchema), AgentController.getAgentById);

// Create new agent with body validation
router.post('/', validateBody(createAgentSchema), AgentController.createAgent);

// Update agent with param & body validation
router.put(
  '/:id',
  validateParams(agentIdParamSchema),
  validateBody(updateAgentSchema),
  AgentController.updateAgent
);

// Toggle / update status
router.patch(
  '/:id/status',
  validateParams(agentIdParamSchema),
  validateBody(updateStatusSchema),
  AgentController.updateStatus
);

// Delete agent
router.delete('/:id', validateParams(agentIdParamSchema), AgentController.deleteAgent);

export default router;
