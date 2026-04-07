const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { body, param, query, validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Middleware per validare errori
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// Auth middleware placeholder (da implementare)
const authRequired = (req, res, next) => {
  // TODO: Implementare JWT validation
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  next();
};

// ============================================
// DOG ROUTES
// ============================================

/**
 * GET /api/dogs
 * Ottieni tutti i cani dell'utente corrente
 */
router.get('/', authRequired, async (req, res) => {
  try {
    const dogs = await prisma.dog.findMany({
      where: { ownerId: req.user.id },
      include: {
        healthRecords: {
          orderBy: { date: 'desc' },
          take: 5
        },
        _count: {
          select: {
            videoAnalyses: true,
            iotDevices: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: dogs });
  } catch (error) {
    console.error('Error fetching dogs:', error);
    res.status(500).json({ success: false, message: 'Errore nel recupero dei cani' });
  }
});

/**
 * GET /api/dogs/:id
 * Ottieni dettagli di un cane specifico
 */
router.get('/:id',
  authRequired,
  param('id').isString().notEmpty(),
  validate,
  async (req, res) => {
    try {
      const dog = await prisma.dog.findFirst({
        where: {
          id: req.params.id,
          ownerId: req.user.id
        },
        include: {
          healthRecords: {
            orderBy: { date: 'desc' }
          },
          videoAnalyses: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          iotDevices: true
        }
      });

      if (!dog) {
        return res.status(404).json({ success: false, message: 'Cane non trovato' });
      }

      res.json({ success: true, data: dog });
    } catch (error) {
      console.error('Error fetching dog:', error);
      res.status(500).json({ success: false, message: 'Errore nel recupero del cane' });
    }
  }
);

/**
 * POST /api/dogs
 * Crea un nuovo profilo cane
 */
router.post('/',
  authRequired,
  body('name').isString().trim().isLength({ min: 1, max: 100 }),
  body('breed').optional().isString().trim(),
  body('birthDate').optional().isISO8601(),
  body('weight').optional().isFloat({ min: 0, max: 200 }),
  body('gender').optional().isIn(['male', 'female']),
  body('chipId').optional().isString().trim(),
  body('isNeutered').optional().isBoolean(),
  body('notes').optional().isString().trim(),
  validate,
  async (req, res) => {
    try {
      const { name, breed, birthDate, weight, gender, chipId, isNeutered, notes, photoUrl } = req.body;

      const dog = await prisma.dog.create({
        data: {
          name,
          breed,
          birthDate: birthDate ? new Date(birthDate) : null,
          weight,
          gender,
          chipId,
          isNeutered: isNeutered || false,
          notes,
          photoUrl,
          ownerId: req.user.id
        }
      });

      res.status(201).json({ success: true, data: dog });
    } catch (error) {
      console.error('Error creating dog:', error);
      res.status(500).json({ success: false, message: 'Errore nella creazione del profilo cane' });
    }
  }
);

/**
 * PUT /api/dogs/:id
 * Aggiorna un profilo cane
 */
router.put('/:id',
  authRequired,
  param('id').isString().notEmpty(),
  body('name').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('breed').optional().isString().trim(),
  body('birthDate').optional().isISO8601(),
  body('weight').optional().isFloat({ min: 0, max: 200 }),
  body('gender').optional().isIn(['male', 'female']),
  body('chipId').optional().isString().trim(),
  body('isNeutered').optional().isBoolean(),
  body('notes').optional().isString().trim(),
  validate,
  async (req, res) => {
    try {
      // Verifica ownership
      const existing = await prisma.dog.findFirst({
        where: { id: req.params.id, ownerId: req.user.id }
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Cane non trovato' });
      }

      const { name, breed, birthDate, weight, gender, chipId, isNeutered, notes, photoUrl } = req.body;

      const dog = await prisma.dog.update({
        where: { id: req.params.id },
        data: {
          ...(name && { name }),
          ...(breed !== undefined && { breed }),
          ...(birthDate && { birthDate: new Date(birthDate) }),
          ...(weight !== undefined && { weight }),
          ...(gender && { gender }),
          ...(chipId !== undefined && { chipId }),
          ...(isNeutered !== undefined && { isNeutered }),
          ...(notes !== undefined && { notes }),
          ...(photoUrl !== undefined && { photoUrl })
        }
      });

      res.json({ success: true, data: dog });
    } catch (error) {
      console.error('Error updating dog:', error);
      res.status(500).json({ success: false, message: 'Errore nell\'aggiornamento del cane' });
    }
  }
);

/**
 * DELETE /api/dogs/:id
 * Elimina un profilo cane
 */
router.delete('/:id',
  authRequired,
  param('id').isString().notEmpty(),
  validate,
  async (req, res) => {
    try {
      const existing = await prisma.dog.findFirst({
        where: { id: req.params.id, ownerId: req.user.id }
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Cane non trovato' });
      }

      await prisma.dog.delete({
        where: { id: req.params.id }
      });

      res.json({ success: true, message: 'Cane eliminato con successo' });
    } catch (error) {
      console.error('Error deleting dog:', error);
      res.status(500).json({ success: false, message: 'Errore nell\'eliminazione del cane' });
    }
  }
);

// ============================================
// HEALTH RECORDS
// ============================================

/**
 * POST /api/dogs/:id/health
 * Aggiungi un record salute
 */
router.post('/:id/health',
  authRequired,
  param('id').isString().notEmpty(),
  body('type').isIn(['VACCINE', 'CHECKUP', 'MEDICATION', 'SURGERY', 'ALLERGY', 'WEIGHT_CHECK', 'OTHER']),
  body('date').isISO8601(),
  body('description').isString().trim().isLength({ min: 1, max: 1000 }),
  body('vetName').optional().isString().trim(),
  body('vetPhone').optional().isString().trim(),
  body('notes').optional().isString().trim(),
  body('remindDate').optional().isISO8601(),
  validate,
  async (req, res) => {
    try {
      // Verifica ownership
      const dog = await prisma.dog.findFirst({
        where: { id: req.params.id, ownerId: req.user.id }
      });

      if (!dog) {
        return res.status(404).json({ success: false, message: 'Cane non trovato' });
      }

      const { type, date, description, vetName, vetPhone, notes, remindDate, attachments } = req.body;

      const healthRecord = await prisma.dogHealthRecord.create({
        data: {
          type,
          date: new Date(date),
          description,
          vetName,
          vetPhone,
          notes,
          remindDate: remindDate ? new Date(remindDate) : null,
          attachments: attachments || [],
          dogId: req.params.id
        }
      });

      res.status(201).json({ success: true, data: healthRecord });
    } catch (error) {
      console.error('Error creating health record:', error);
      res.status(500).json({ success: false, message: 'Errore nella creazione del record salute' });
    }
  }
);

/**
 * GET /api/dogs/:id/health
 * Ottieni tutti i record salute di un cane
 */
router.get('/:id/health',
  authRequired,
  param('id').isString().notEmpty(),
  query('type').optional().isIn(['VACCINE', 'CHECKUP', 'MEDICATION', 'SURGERY', 'ALLERGY', 'WEIGHT_CHECK', 'OTHER']),
  validate,
  async (req, res) => {
    try {
      const dog = await prisma.dog.findFirst({
        where: { id: req.params.id, ownerId: req.user.id }
      });

      if (!dog) {
        return res.status(404).json({ success: false, message: 'Cane non trovato' });
      }

      const where = { dogId: req.params.id };
      if (req.query.type) {
        where.type = req.query.type;
      }

      const healthRecords = await prisma.dogHealthRecord.findMany({
        where,
        orderBy: { date: 'desc' }
      });

      res.json({ success: true, data: healthRecords });
    } catch (error) {
      console.error('Error fetching health records:', error);
      res.status(500).json({ success: false, message: 'Errore nel recupero dei record salute' });
    }
  }
);

/**
 * DELETE /api/dogs/:dogId/health/:recordId
 * Elimina un record salute
 */
router.delete('/:dogId/health/:recordId',
  authRequired,
  param('dogId').isString().notEmpty(),
  param('recordId').isString().notEmpty(),
  validate,
  async (req, res) => {
    try {
      const dog = await prisma.dog.findFirst({
        where: { id: req.params.dogId, ownerId: req.user.id }
      });

      if (!dog) {
        return res.status(404).json({ success: false, message: 'Cane non trovato' });
      }

      await prisma.dogHealthRecord.delete({
        where: { id: req.params.recordId }
      });

      res.json({ success: true, message: 'Record salute eliminato' });
    } catch (error) {
      console.error('Error deleting health record:', error);
      res.status(500).json({ success: false, message: 'Errore nell\'eliminazione del record' });
    }
  }
);

module.exports = router;
