const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { body, param, query, validationResult } = require('express-validator');

const prisma = new PrismaClient();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const authRequired = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  next();
};

const authOptional = (req, res, next) => {
  // User may or may not be logged in
  next();
};

// ============================================
// MARKETPLACE ROUTES
// ============================================

/**
 * GET /api/marketplace
 * Lista annunci con filtri
 */
router.get('/',
  query('category').optional().isIn(['FOOD', 'ACCESSORIES', 'TOYS', 'CLOTHING', 'HEALTH', 'GROOMING', 'TRAINING', 'SERVICES', 'OTHER']),
  query('condition').optional().isIn(['NEW', 'LIKE_NEW', 'GOOD', 'USED', 'FOR_PARTS']),
  query('location').optional().isString(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validate,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const where = { isActive: true, isSold: false };

      if (req.query.category) where.category = req.query.category;
      if (req.query.condition) where.condition = req.query.condition;
      if (req.query.location) {
        where.location = { contains: req.query.location, mode: 'insensitive' };
      }
      if (req.query.minPrice || req.query.maxPrice) {
        where.price = {};
        if (req.query.minPrice) where.price.gte = parseFloat(req.query.minPrice);
        if (req.query.maxPrice) where.price.lte = parseFloat(req.query.maxPrice);
      }
      if (req.query.search) {
        where.OR = [
          { title: { contains: req.query.search, mode: 'insensitive' } },
          { description: { contains: req.query.search, mode: 'insensitive' } }
        ];
      }

      const [listings, total] = await Promise.all([
        prisma.marketplaceListing.findMany({
          where,
          include: {
            seller: {
              select: { id: true, username: true, avatar: true, location: true }
            },
            _count: { select: { inquiries: true } }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.marketplaceListing.count({ where })
      ]);

      res.json({
        success: true,
        data: listings,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching marketplace listings:', error);
      res.status(500).json({ success: false, message: 'Errore nel recupero degli annunci' });
    }
  }
);

/**
 * GET /api/marketplace/:id
 * Dettagli annuncio
 */
router.get('/:id',
  param('id').isString().notEmpty(),
  validate,
  async (req, res) => {
    try {
      const listing = await prisma.marketplaceListing.findUnique({
        where: { id: req.params.id },
        include: {
          seller: {
            select: { id: true, username: true, avatar: true, location: true, createdAt: true }
          },
          inquiries: {
            select: { id: true, createdAt: true },
            take: 0 // Just count
          }
        }
      });

      if (!listing || !listing.isActive) {
        return res.status(404).json({ success: false, message: 'Annuncio non trovato' });
      }

      // Incrementa views
      await prisma.marketplaceListing.update({
        where: { id: req.params.id },
        data: { views: { increment: 1 } }
      });

      res.json({ success: true, data: listing });
    } catch (error) {
      console.error('Error fetching listing:', error);
      res.status(500).json({ success: false, message: 'Errore nel recupero dell\'annuncio' });
    }
  }
);

/**
 * POST /api/marketplace
 * Crea nuovo annuncio
 */
router.post('/',
  authRequired,
  body('title').isString().trim().isLength({ min: 5, max: 200 }),
  body('description').isString().trim().isLength({ min: 20, max: 5000 }),
  body('price').isFloat({ min: 0, max: 100000 }),
  body('category').isIn(['FOOD', 'ACCESSORIES', 'TOYS', 'CLOTHING', 'HEALTH', 'GROOMING', 'TRAINING', 'SERVICES', 'OTHER']),
  body('condition').optional().isIn(['NEW', 'LIKE_NEW', 'GOOD', 'USED', 'FOR_PARTS']),
  body('images').optional().isArray({ max: 10 }),
  body('location').optional().isString().trim(),
  validate,
  async (req, res) => {
    try {
      const { title, description, price, category, condition, images, location, latitude, longitude } = req.body;

      const listing = await prisma.marketplaceListing.create({
        data: {
          title,
          description,
          price,
          category,
          condition: condition || 'USED',
          images: images || [],
          location: location || req.user.location,
          latitude,
          longitude,
          sellerId: req.user.id
        }
      });

      res.status(201).json({ success: true, data: listing });
    } catch (error) {
      console.error('Error creating listing:', error);
      res.status(500).json({ success: false, message: 'Errore nella creazione dell\'annuncio' });
    }
  }
);

/**
 * PUT /api/marketplace/:id
 * Aggiorna annuncio
 */
router.put('/:id',
  authRequired,
  param('id').isString().notEmpty(),
  body('title').optional().isString().trim().isLength({ min: 5, max: 200 }),
  body('description').optional().isString().trim().isLength({ min: 20, max: 5000 }),
  body('price').optional().isFloat({ min: 0, max: 100000 }),
  body('category').optional().isIn(['FOOD', 'ACCESSORIES', 'TOYS', 'CLOTHING', 'HEALTH', 'GROOMING', 'TRAINING', 'SERVICES', 'OTHER']),
  body('condition').optional().isIn(['NEW', 'LIKE_NEW', 'GOOD', 'USED', 'FOR_PARTS']),
  body('isActive').optional().isBoolean(),
  body('isSold').optional().isBoolean(),
  validate,
  async (req, res) => {
    try {
      const existing = await prisma.marketplaceListing.findFirst({
        where: { id: req.params.id, sellerId: req.user.id }
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Annuncio non trovato' });
      }

      const listing = await prisma.marketplaceListing.update({
        where: { id: req.params.id },
        data: req.body
      });

      res.json({ success: true, data: listing });
    } catch (error) {
      console.error('Error updating listing:', error);
      res.status(500).json({ success: false, message: 'Errore nell\'aggiornamento dell\'annuncio' });
    }
  }
);

/**
 * DELETE /api/marketplace/:id
 * Elimina annuncio
 */
router.delete('/:id',
  authRequired,
  param('id').isString().notEmpty(),
  validate,
  async (req, res) => {
    try {
      const existing = await prisma.marketplaceListing.findFirst({
        where: { id: req.params.id, sellerId: req.user.id }
      });

      if (!existing) {
        return res.status(404).json({ success: false, message: 'Annuncio non trovato' });
      }

      await prisma.marketplaceListing.delete({
        where: { id: req.params.id }
      });

      res.json({ success: true, message: 'Annuncio eliminato' });
    } catch (error) {
      console.error('Error deleting listing:', error);
      res.status(500).json({ success: false, message: 'Errore nell\'eliminazione dell\'annuncio' });
    }
  }
);

/**
 * POST /api/marketplace/:id/inquiry
 * Invia richiesta al venditore
 */
router.post('/:id/inquiry',
  authRequired,
  param('id').isString().notEmpty(),
  body('message').isString().trim().isLength({ min: 10, max: 1000 }),
  body('phone').optional().isString().trim(),
  validate,
  async (req, res) => {
    try {
      const listing = await prisma.marketplaceListing.findUnique({
        where: { id: req.params.id }
      });

      if (!listing || !listing.isActive) {
        return res.status(404).json({ success: false, message: 'Annuncio non trovato' });
      }

      if (listing.sellerId === req.user.id) {
        return res.status(400).json({ success: false, message: 'Non puoi contattare te stesso' });
      }

      const inquiry = await prisma.marketplaceInquiry.create({
        data: {
          message: req.body.message,
          phone: req.body.phone,
          listingId: req.params.id,
          buyerId: req.user.id
        }
      });

      // TODO: Invia notifica al venditore

      res.status(201).json({ success: true, data: inquiry });
    } catch (error) {
      console.error('Error creating inquiry:', error);
      res.status(500).json({ success: false, message: 'Errore nell\'invio della richiesta' });
    }
  }
);

/**
 * GET /api/marketplace/my/listings
 * I miei annunci
 */
router.get('/my/listings',
  authRequired,
  async (req, res) => {
    try {
      const listings = await prisma.marketplaceListing.findMany({
        where: { sellerId: req.user.id },
        include: {
          _count: { select: { inquiries: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ success: true, data: listings });
    } catch (error) {
      console.error('Error fetching my listings:', error);
      res.status(500).json({ success: false, message: 'Errore nel recupero dei tuoi annunci' });
    }
  }
);

/**
 * GET /api/marketplace/my/inquiries
 * Le mie richieste ricevute
 */
router.get('/my/inquiries',
  authRequired,
  async (req, res) => {
    try {
      const inquiries = await prisma.marketplaceInquiry.findMany({
        where: {
          listing: { sellerId: req.user.id }
        },
        include: {
          listing: { select: { id: true, title: true, price: true } },
          buyer: { select: { id: true, username: true, avatar: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      res.json({ success: true, data: inquiries });
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      res.status(500).json({ success: false, message: 'Errore nel recupero delle richieste' });
    }
  }
);

module.exports = router;
