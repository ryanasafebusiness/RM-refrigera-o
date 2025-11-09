// Service Orders routes
import express from 'express';
import { pool } from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all service orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT so.*, 
              p.name as technician_name
       FROM service_orders so
       LEFT JOIN profiles p ON p.user_id = so.technician_id
       WHERE so.technician_id = $1
       ORDER BY so.created_at DESC`,
      [userId]
    );

    res.json({ orders: result.rows });
  } catch (error) {
    console.error('Erro ao buscar ordens de serviço:', error);
    res.status(500).json({ error: 'Erro ao buscar ordens de serviço' });
  }
});

// Get single service order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT so.*, 
              p.name as technician_name
       FROM service_orders so
       LEFT JOIN profiles p ON p.user_id = so.technician_id
       WHERE so.id = $1 AND so.technician_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    res.json({ order: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar ordem de serviço:', error);
    res.status(500).json({ error: 'Erro ao buscar ordem de serviço' });
  }
});

// Create service order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      client_name,
      location,
      contact_name,
      contact_phone,
      problem_description,
      service_description,
      internal_notes,
      status = 'Pendente',
    } = req.body;

    // Validation
    if (!client_name || !location || !contact_name || !contact_phone || !problem_description) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }

    const result = await pool.query(
      `INSERT INTO service_orders (
        technician_id, client_name, location, contact_name, contact_phone,
        problem_description, service_description, internal_notes, status,
        start_datetime, created_at, updated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), NOW())
       RETURNING *`,
      [
        userId,
        client_name,
        location,
        contact_name,
        contact_phone,
        problem_description,
        service_description || null,
        internal_notes || null,
        status,
      ]
    );

    res.status(201).json({ order: result.rows[0] });
  } catch (error) {
    console.error('Erro ao criar ordem de serviço:', error);
    res.status(500).json({ error: 'Erro ao criar ordem de serviço' });
  }
});

// Update service order
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const {
      client_name,
      location,
      contact_name,
      contact_phone,
      problem_description,
      service_description,
      internal_notes,
      status,
      completion_datetime,
    } = req.body;

    // Check if order exists and belongs to user
    const checkResult = await pool.query(
      'SELECT id FROM service_orders WHERE id = $1 AND technician_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (client_name !== undefined) {
      updates.push(`client_name = $${paramCount++}`);
      values.push(client_name);
    }
    if (location !== undefined) {
      updates.push(`location = $${paramCount++}`);
      values.push(location);
    }
    if (contact_name !== undefined) {
      updates.push(`contact_name = $${paramCount++}`);
      values.push(contact_name);
    }
    if (contact_phone !== undefined) {
      updates.push(`contact_phone = $${paramCount++}`);
      values.push(contact_phone);
    }
    if (problem_description !== undefined) {
      updates.push(`problem_description = $${paramCount++}`);
      values.push(problem_description);
    }
    if (service_description !== undefined) {
      updates.push(`service_description = $${paramCount++}`);
      values.push(service_description);
    }
    if (internal_notes !== undefined) {
      updates.push(`internal_notes = $${paramCount++}`);
      values.push(internal_notes);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (completion_datetime !== undefined) {
      updates.push(`completion_datetime = $${paramCount++}`);
      values.push(completion_datetime);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE service_orders
       SET ${updates.join(', ')}
       WHERE id = $${paramCount} AND technician_id = $${paramCount + 1}
       RETURNING *`,
      [...values, userId]
    );

    res.json({ order: result.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar ordem de serviço:', error);
    res.status(500).json({ error: 'Erro ao atualizar ordem de serviço' });
  }
});

// Delete service order
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      'DELETE FROM service_orders WHERE id = $1 AND technician_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    res.json({ message: 'Ordem de serviço deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar ordem de serviço:', error);
    res.status(500).json({ error: 'Erro ao deletar ordem de serviço' });
  }
});

export default router;

