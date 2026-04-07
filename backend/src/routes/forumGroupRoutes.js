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

// Utility per creare slug
const createSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};

// ============================================
// FORUM GROUP ROUTES
// ============================================

/**
 * GET /api/groups
 * Lista gruppi con filtri
 */
router.get('/',
  query('location').optional().isString(),
  query('region').optional().isString(),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validate,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const where = { isPrivate: false };

      if (req.query.location) {
        where.location = { contains: req.query.location, mode: 'insensitive' };
      }
      if (req.query.region) {
        where.region = { contains: req.query.region, mode: 'insensitive' };
      }
      if (req.query.search) {
        where.OR = [
          { name: { contains: req.query.search, mode: 'insensitive' } },
          { description: { contains: req.query.search, mode: 'insensitive' } }
        ];
      }

      const [groups, total] = await Promise.all([
        prisma.forumGroup.findMany({
          where,
          include: {
            creator: { select: { id: true, username: true, avatar: true } },
            _count: { select: { members: true, posts: true } }
          },
          orderBy: { memberCount: 'desc' },
          skip,
          take: limit
        }),
        prisma.forumGroup.count({ where })
      ]);

      res.json({
        success: true,
        data: groups,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } catch (error) {
      console.error('Error fetching groups:', error);
      res.status(500).json({ success: false, message: 'Errore nel recupero dei gruppi' });
    }
  }
);

/**
 * GET /api/groups/popular
 * Gruppi popolari per regione
 */
router.get('/popular',
  query('region').optional().isString(),
  validate,
  async (req, res) => {
    try {
      const where = { isPrivate: false };
      if (req.query.region) {
        where.region = { contains: req.query.region, mode: 'insensitive' };
      }

      const groups = await prisma.forumGroup.findMany({
        where,
        include: {
          _count: { select: { members: true, posts: true } }
        },
        orderBy: { memberCount: 'desc' },
        take: 10
      });

      res.json({ success: true, data: groups });
    } catch (error) {
      console.error('Error fetching popular groups:', error);
      res.status(500).json({ success: false, message: 'Errore' });
    }
  }
);

/**
 * GET /api/groups/:slug
 * Dettagli gruppo
 */
router.get('/:slug',
  param('slug').isString().notEmpty(),
  validate,
  async (req, res) => {
    try {
      const group = await prisma.forumGroup.findUnique({
        where: { slug: req.params.slug },
        include: {
          creator: { select: { id: true, username: true, avatar: true } },
          members: {
            take: 10,
            include: {
              user: { select: { id: true, username: true, avatar: true } }
            }
          },
          _count: { select: { members: true, posts: true } }
        }
      });

      if (!group) {
        return res.status(404).json({ success: false, message: 'Gruppo non trovato' });
      }

      res.json({ success: true, data: group });
    } catch (error) {
      console.error('Error fetching group:', error);
      res.status(500).json({ success: false, message: 'Errore nel recupero del gruppo' });
    }
  }
);

/**
 * POST /api/groups
 * Crea nuovo gruppo
 */
router.post('/',
  authRequired,
  body('name').isString().trim().isLength({ min: 3, max: 100 }),
  body('description').optional().isString().trim().isLength({ max: 1000 }),
  body('location').optional().isString().trim(),
  body('region').optional().isString().trim(),
  body('isPrivate').optional().isBoolean(),
  validate,
  async (req, res) => {
    try {
      const { name, description, location, region, isPrivate, coverImage } = req.body;

      // Genera slug unico
      let slug = createSlug(name);
      let slugExists = await prisma.forumGroup.findUnique({ where: { slug } });
      let counter = 1;
      while (slugExists) {
        slug = `${createSlug(name)}-${counter}`;
        slugExists = await prisma.forumGroup.findUnique({ where: { slug } });
        counter++;
      }

      const group = await prisma.forumGroup.create({
        data: {
          name,
          description,
          slug,
          location,
          region,
          isPrivate: isPrivate || false,
          coverImage,
          creatorId: req.user.id,
          memberCount: 1
        }
      });

      // Aggiungi il creatore come admin
      await prisma.groupMember.create({
        data: {
          groupId: group.id,
          userId: req.user.id,
          role: 'ADMIN'
        }
      });

      res.status(201).json({ success: true, data: group });
    } catch (error) {
      console.error('Error creating group:', error);
      res.status(500).json({ success: false, message: 'Errore nella creazione del gruppo' });
    }
  }
);

/**
 * POST /api/groups/:slug/join
 * Unisciti al gruppo
 */
router.post('/:slug/join',
  authRequired,
  param('slug').isString().notEmpty(),
  validate,
  async (req, res) => {
    try {
      const group = await prisma.forumGroup.findUnique({
        where: { slug: req.params.slug }
      });

      if (!group) {
        return res.status(404).json({ success: false, message: 'Gruppo non trovato' });
      }

      // Controlla se già membro
      const existingMember = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: { groupId: group.id, userId: req.user.id }
        }
      });

      if (existingMember) {
        return res.status(400).json({ success: false, message: 'Sei già membro di questo gruppo' });
      }

      await prisma.groupMember.create({
        data: {
          groupId: group.id,
          userId: req.user.id,
          role: 'MEMBER'
        }
      });

      // Aggiorna contatore
      await prisma.forumGroup.update({
        where: { id: group.id },
        data: { memberCount: { increment: 1 } }
      });

      res.json({ success: true, message: 'Ti sei unito al gruppo!' });
    } catch (error) {
      console.error('Error joining group:', error);
      res.status(500).json({ success: false, message: 'Errore nell\'iscrizione al gruppo' });
    }
  }
);

/**
 * POST /api/groups/:slug/leave
 * Lascia il gruppo
 */
router.post('/:slug/leave',
  authRequired,
  param('slug').isString().notEmpty(),
  validate,
  async (req, res) => {
    try {
      const group = await prisma.forumGroup.findUnique({
        where: { slug: req.params.slug }
      });

      if (!group) {
        return res.status(404).json({ success: false, message: 'Gruppo non trovato' });
      }

      // Non può lasciare se è il creatore
      if (group.creatorId === req.user.id) {
        return res.status(400).json({ success: false, message: 'Il creatore non può lasciare il gruppo' });
      }

      await prisma.groupMember.delete({
        where: {
          groupId_userId: { groupId: group.id, userId: req.user.id }
        }
      });

      await prisma.forumGroup.update({
        where: { id: group.id },
        data: { memberCount: { decrement: 1 } }
      });

      res.json({ success: true, message: 'Hai lasciato il gruppo' });
    } catch (error) {
      console.error('Error leaving group:', error);
      res.status(500).json({ success: false, message: 'Errore nell\'uscita dal gruppo' });
    }
  }
);

/**
 * GET /api/groups/:slug/posts
 * Post del gruppo
 */
router.get('/:slug/posts',
  param('slug').isString().notEmpty(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validate,
  async (req, res) => {
    try {
      const group = await prisma.forumGroup.findUnique({
        where: { slug: req.params.slug }
      });

      if (!group) {
        return res.status(404).json({ success: false, message: 'Gruppo non trovato' });
      }

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          where: { groupId: group.id, published: true },
          include: {
            author: { select: { id: true, username: true, avatar: true } },
            _count: { select: { comments: true, likes: true } }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.post.count({ where: { groupId: group.id, published: true } })
      ]);

      res.json({
        success: true,
        data: posts,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } catch (error) {
      console.error('Error fetching group posts:', error);
      res.status(500).json({ success: false, message: 'Errore nel recupero dei post' });
    }
  }
);

/**
 * GET /api/groups/my/memberships
 * I miei gruppi
 */
router.get('/my/memberships',
  authRequired,
  async (req, res) => {
    try {
      const memberships = await prisma.groupMember.findMany({
        where: { userId: req.user.id },
        include: {
          group: {
            include: {
              _count: { select: { members: true, posts: true } }
            }
          }
        },
        orderBy: { joinedAt: 'desc' }
      });

      res.json({ success: true, data: memberships });
    } catch (error) {
      console.error('Error fetching memberships:', error);
      res.status(500).json({ success: false, message: 'Errore' });
    }
  }
);

module.exports = router;
