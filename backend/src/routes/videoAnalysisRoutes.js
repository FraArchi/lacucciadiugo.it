const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { body, param, query, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');

const prisma = new PrismaClient();

// Configurazione upload video
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/videos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `video-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato video non supportato'));
    }
  }
});

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

// Check premium subscription
const premiumRequired = async (req, res, next) => {
  if (!req.user.isPremium) {
    // Check free tier limits
    const analysisCount = await prisma.videoAnalysis.count({
      where: {
        userId: req.user.id,
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30))
        }
      }
    });
    
    if (analysisCount >= 3) {
      return res.status(403).json({
        success: false,
        message: 'Hai raggiunto il limite di analisi gratuite mensili. Passa a Premium per analisi illimitate!',
        upgradeRequired: true
      });
    }
  }
  next();
};

// ============================================
// VIDEO ANALYSIS ROUTES
// ============================================

/**
 * POST /api/videos/upload
 * Carica video per analisi AI
 */
router.post('/upload',
  authRequired,
  premiumRequired,
  upload.single('video'),
  body('dogId').isString().notEmpty(),
  body('analysisType').isIn(['BEHAVIOR', 'TRAINING', 'EXERCISE', 'HEALTH_CHECK', 'GENERAL']),
  validate,
  async (req, res) => {
    try {
      const { dogId, analysisType } = req.body;

      // Verifica ownership del cane
      const dog = await prisma.dog.findFirst({
        where: { id: dogId, ownerId: req.user.id }
      });

      if (!dog) {
        return res.status(404).json({ success: false, message: 'Cane non trovato' });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Video non fornito' });
      }

      // Crea record analisi
      const analysis = await prisma.videoAnalysis.create({
        data: {
          videoUrl: `/uploads/videos/${req.file.filename}`,
          analysisType,
          status: 'PENDING',
          dogId,
          userId: req.user.id
        }
      });

      // TODO: Invia a queue per processing AI (MediaPipe + OpenAI)
      // Per MVP, processiamo in modo simulato
      processVideoAnalysis(analysis.id);

      res.status(201).json({
        success: true,
        data: analysis,
        message: 'Video caricato! L\'analisi sarà pronta in pochi minuti.'
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      res.status(500).json({ success: false, message: 'Errore nel caricamento del video' });
    }
  }
);

/**
 * GET /api/videos/:id
 * Stato e risultati analisi
 */
router.get('/:id',
  authRequired,
  param('id').isString().notEmpty(),
  validate,
  async (req, res) => {
    try {
      const analysis = await prisma.videoAnalysis.findFirst({
        where: { id: req.params.id, userId: req.user.id },
        include: {
          dog: { select: { id: true, name: true, breed: true, photoUrl: true } }
        }
      });

      if (!analysis) {
        return res.status(404).json({ success: false, message: 'Analisi non trovata' });
      }

      res.json({ success: true, data: analysis });
    } catch (error) {
      console.error('Error fetching analysis:', error);
      res.status(500).json({ success: false, message: 'Errore nel recupero dell\'analisi' });
    }
  }
);

/**
 * GET /api/videos
 * Lista analisi utente
 */
router.get('/',
  authRequired,
  query('dogId').optional().isString(),
  query('status').optional().isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validate,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const where = { userId: req.user.id };
      if (req.query.dogId) where.dogId = req.query.dogId;
      if (req.query.status) where.status = req.query.status;

      const [analyses, total] = await Promise.all([
        prisma.videoAnalysis.findMany({
          where,
          include: {
            dog: { select: { id: true, name: true, photoUrl: true } }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.videoAnalysis.count({ where })
      ]);

      res.json({
        success: true,
        data: analyses,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      });
    } catch (error) {
      console.error('Error fetching analyses:', error);
      res.status(500).json({ success: false, message: 'Errore' });
    }
  }
);

/**
 * GET /api/videos/tutorials
 * Tutorial raccomandati basati sulle analisi
 */
router.get('/tutorials/recommended',
  authRequired,
  async (req, res) => {
    try {
      // Ottieni analisi recenti per capire i bisogni
      const recentAnalyses = await prisma.videoAnalysis.findMany({
        where: {
          userId: req.user.id,
          status: 'COMPLETED'
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      // Tutorial di esempio (in produzione: generati da AI o database)
      const tutorials = [
        {
          id: 't1',
          title: 'Addestramento Base: Il Richiamo',
          description: 'Insegna al tuo cane a venire quando chiamato',
          duration: '8 min',
          difficulty: 'principiante',
          category: 'TRAINING',
          thumbnailUrl: '/images/tutorial-richiamo.jpg'
        },
        {
          id: 't2',
          title: 'Gestire l\'Ansia da Separazione',
          description: 'Tecniche per cani ansiosi quando lasciati soli',
          duration: '12 min',
          difficulty: 'intermedio',
          category: 'BEHAVIOR',
          thumbnailUrl: '/images/tutorial-ansia.jpg'
        },
        {
          id: 't3',
          title: 'Esercizi di Agilità Casalinghi',
          description: 'Attività fisica per cani in appartamento',
          duration: '10 min',
          difficulty: 'principiante',
          category: 'EXERCISE',
          thumbnailUrl: '/images/tutorial-agilita.jpg'
        },
        {
          id: 't4',
          title: 'Passeggiata al Guinzaglio Senza Tirare',
          description: 'Tecniche per passeggiate tranquille',
          duration: '15 min',
          difficulty: 'intermedio',
          category: 'TRAINING',
          thumbnailUrl: '/images/tutorial-guinzaglio.jpg'
        }
      ];

      res.json({ success: true, data: tutorials });
    } catch (error) {
      console.error('Error fetching tutorials:', error);
      res.status(500).json({ success: false, message: 'Errore' });
    }
  }
);

/**
 * DELETE /api/videos/:id
 * Elimina analisi
 */
router.delete('/:id',
  authRequired,
  param('id').isString().notEmpty(),
  validate,
  async (req, res) => {
    try {
      const analysis = await prisma.videoAnalysis.findFirst({
        where: { id: req.params.id, userId: req.user.id }
      });

      if (!analysis) {
        return res.status(404).json({ success: false, message: 'Analisi non trovata' });
      }

      await prisma.videoAnalysis.delete({
        where: { id: req.params.id }
      });

      // TODO: Elimina file video dal filesystem

      res.json({ success: true, message: 'Analisi eliminata' });
    } catch (error) {
      console.error('Error deleting analysis:', error);
      res.status(500).json({ success: false, message: 'Errore' });
    }
  }
);

// ============================================
// FUNZIONE SIMULATA DI PROCESSING AI (MVP)
// ============================================

async function processVideoAnalysis(analysisId) {
  try {
    // Aggiorna a PROCESSING
    await prisma.videoAnalysis.update({
      where: { id: analysisId },
      data: { status: 'PROCESSING' }
    });

    // Simula tempo di elaborazione (in produzione: MediaPipe + OpenAI)
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Risultati simulati
    const results = {
      poses_detected: [
        { type: 'standing', confidence: 0.92, timestamp: 2.5 },
        { type: 'sitting', confidence: 0.88, timestamp: 8.3 },
        { type: 'walking', confidence: 0.75, timestamp: 15.0 }
      ],
      behaviors_detected: [
        { type: 'tail_wagging', confidence: 0.85 },
        { type: 'attention_seeking', confidence: 0.72 }
      ],
      overall_assessment: 'Il cane mostra buona energia e reattività. Postura corretta durante la camminata.'
    };

    const recommendations = {
      training_tips: [
        'Prova esercizi di "resta" per migliorare la pazienza',
        'Il richiamo sembra buono, pratica con distrazioni',
        'Continua con le passeggiate strutturate'
      ],
      exercises: [
        { name: 'Sit & Stay', duration: '5 min', frequency: 'daily' },
        { name: 'Recall Training', duration: '10 min', frequency: '3x week' }
      ],
      next_goals: [
        'Migliorare la concentrazione in ambienti stimolanti',
        'Lavorare sul rilassamento durante le visite di ospiti'
      ]
    };

    // Aggiorna con risultati
    await prisma.videoAnalysis.update({
      where: { id: analysisId },
      data: {
        status: 'COMPLETED',
        results,
        recommendations,
        confidence: 0.84
      }
    });

    // TODO: Invia notifica push all'utente

  } catch (error) {
    console.error('Error processing video analysis:', error);
    await prisma.videoAnalysis.update({
      where: { id: analysisId },
      data: { status: 'FAILED' }
    });
  }
}

module.exports = router;
