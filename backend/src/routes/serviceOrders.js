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
      total_value,
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
    if (total_value !== undefined) {
      updates.push(`total_value = $${paramCount++}`);
      values.push(total_value);
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

// ========== ORDER PHOTOS ROUTES ==========

// Get all photos for an order
router.get('/:id/photos', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verify order belongs to user
    const orderCheck = await pool.query(
      'SELECT id FROM service_orders WHERE id = $1 AND technician_id = $2',
      [id, userId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    const result = await pool.query(
      'SELECT * FROM order_photos WHERE order_id = $1 ORDER BY uploaded_at DESC',
      [id]
    );

    res.json({ photos: result.rows });
  } catch (error) {
    console.error('Erro ao buscar fotos:', error);
    res.status(500).json({ error: 'Erro ao buscar fotos' });
  }
});

// Upload photo - supports both JSON (photo_url) and FormData (file upload)
router.post('/:id/photos', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Support both JSON and FormData
    let photo_url, photo_type, media_type, duration_seconds;
    
    if (req.body.photo_url) {
      // JSON format
      ({ photo_url, photo_type, media_type, duration_seconds } = req.body);
    } else if (req.body.file) {
      // FormData format - for now, we'll store a placeholder URL
      // In production, you'd upload to S3/Cloudinary/etc and get the URL
      photo_url = req.body.file; // This should be the uploaded file URL
      photo_type = req.body.photoType || 'problem';
      media_type = req.body.mediaType || 'image';
      duration_seconds = req.body.durationSeconds ? parseInt(req.body.durationSeconds) : null;
    } else {
      return res.status(400).json({ error: 'photo_url ou file é obrigatório' });
    }

    // Verify order belongs to user
    const orderCheck = await pool.query(
      'SELECT id FROM service_orders WHERE id = $1 AND technician_id = $2',
      [id, userId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    if (!photo_url || !photo_type) {
      return res.status(400).json({ error: 'photo_url e photo_type são obrigatórios' });
    }

    const result = await pool.query(
      `INSERT INTO order_photos (order_id, photo_url, photo_type, media_type, duration_seconds, uploaded_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [id, photo_url, photo_type, media_type || 'image', duration_seconds || null]
    );

    res.status(201).json({ photo: result.rows[0] });
  } catch (error) {
    console.error('Erro ao adicionar foto:', error);
    res.status(500).json({ error: 'Erro ao adicionar foto' });
  }
});

// Delete photo
router.delete('/:id/photos/:photoId', authenticateToken, async (req, res) => {
  try {
    const { id, photoId } = req.params;
    const userId = req.user.userId;

    // Verify order belongs to user
    const orderCheck = await pool.query(
      'SELECT id FROM service_orders WHERE id = $1 AND technician_id = $2',
      [id, userId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    const result = await pool.query(
      'DELETE FROM order_photos WHERE id = $1 AND order_id = $2 RETURNING id',
      [photoId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Foto não encontrada' });
    }

    res.json({ message: 'Foto deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar foto:', error);
    res.status(500).json({ error: 'Erro ao deletar foto' });
  }
});

// ========== ORDER PARTS ROUTES ==========

// Get all parts for an order
router.get('/:id/parts', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verify order belongs to user
    const orderCheck = await pool.query(
      'SELECT id FROM service_orders WHERE id = $1 AND technician_id = $2',
      [id, userId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    const result = await pool.query(
      'SELECT * FROM order_parts_replaced WHERE order_id = $1 ORDER BY created_at DESC',
      [id]
    );

    res.json({ parts: result.rows });
  } catch (error) {
    console.error('Erro ao buscar peças:', error);
    res.status(500).json({ error: 'Erro ao buscar peças' });
  }
});

// Add part
router.post('/:id/parts', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { old_part, new_part, part_value } = req.body;

    // Verify order belongs to user
    const orderCheck = await pool.query(
      'SELECT id FROM service_orders WHERE id = $1 AND technician_id = $2',
      [id, userId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    if (!old_part || !new_part) {
      return res.status(400).json({ error: 'old_part e new_part são obrigatórios' });
    }

    const result = await pool.query(
      `INSERT INTO order_parts_replaced (order_id, old_part, new_part, part_value, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [id, old_part, new_part, part_value || null]
    );

    res.status(201).json({ part: result.rows[0] });
  } catch (error) {
    console.error('Erro ao adicionar peça:', error);
    res.status(500).json({ error: 'Erro ao adicionar peça' });
  }
});

// Delete part
router.delete('/:id/parts/:partId', authenticateToken, async (req, res) => {
  try {
    const { id, partId } = req.params;
    const userId = req.user.userId;

    // Verify order belongs to user
    const orderCheck = await pool.query(
      'SELECT id FROM service_orders WHERE id = $1 AND technician_id = $2',
      [id, userId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    const result = await pool.query(
      'DELETE FROM order_parts_replaced WHERE id = $1 AND order_id = $2 RETURNING id',
      [partId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Peça não encontrada' });
    }

    res.json({ message: 'Peça deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar peça:', error);
    res.status(500).json({ error: 'Erro ao deletar peça' });
  }
});

// ========== ORDER SIGNATURE ROUTES ==========

// Get signature for an order
router.get('/:id/signature', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Verify order belongs to user
    const orderCheck = await pool.query(
      'SELECT id FROM service_orders WHERE id = $1 AND technician_id = $2',
      [id, userId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    const result = await pool.query(
      'SELECT * FROM order_signatures WHERE order_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.json({ signature: null });
    }

    res.json({ signature: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    res.status(500).json({ error: 'Erro ao buscar assinatura' });
  }
});

// Create or update signature
router.post('/:id/signature', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { signature_data } = req.body;

    // Verify order belongs to user
    const orderCheck = await pool.query(
      'SELECT id FROM service_orders WHERE id = $1 AND technician_id = $2',
      [id, userId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    if (!signature_data) {
      return res.status(400).json({ error: 'signature_data é obrigatório' });
    }

    // Try to insert, if it fails (unique constraint), update instead
    let result;
    try {
      result = await pool.query(
        `INSERT INTO order_signatures (order_id, signature_data, signed_at)
         VALUES ($1, $2, NOW())
         RETURNING *`,
        [id, signature_data]
      );
    } catch (error) {
      // If unique constraint violation, update instead
      if (error.code === '23505') {
        result = await pool.query(
          `UPDATE order_signatures
           SET signature_data = $1, signed_at = NOW()
           WHERE order_id = $2
           RETURNING *`,
          [signature_data, id]
        );
      } else {
        throw error;
      }
    }

    res.status(201).json({ signature: result.rows[0] });
  } catch (error) {
    console.error('Erro ao salvar assinatura:', error);
    res.status(500).json({ error: 'Erro ao salvar assinatura' });
  }
});

// Update signature
router.put('/:id/signature', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { signature_data } = req.body;

    // Verify order belongs to user
    const orderCheck = await pool.query(
      'SELECT id FROM service_orders WHERE id = $1 AND technician_id = $2',
      [id, userId]
    );

    if (orderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    if (!signature_data) {
      return res.status(400).json({ error: 'signature_data é obrigatório' });
    }

    const result = await pool.query(
      `UPDATE order_signatures
       SET signature_data = $1, signed_at = NOW()
       WHERE order_id = $2
       RETURNING *`,
      [signature_data, id]
    );

    if (result.rows.length === 0) {
      // If no signature exists, create it
      const insertResult = await pool.query(
        `INSERT INTO order_signatures (order_id, signature_data, signed_at)
         VALUES ($1, $2, NOW())
         RETURNING *`,
        [id, signature_data]
      );
      return res.json({ signature: insertResult.rows[0] });
    }

    res.json({ signature: result.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar assinatura:', error);
    res.status(500).json({ error: 'Erro ao atualizar assinatura' });
  }
});

export default router;

