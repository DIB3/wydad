const MedicalCertificate = require('../models/medical_certificates');
const Player = require('../models/player');
const User = require('../models/user');
const Attachment = require('../models/attachment');
const { emitCertificateCreated, emitCertificateDeleted } = require('../socket');
const { generateCertificatePdf, saveCertificatePdf } = require('../utils/certificatePdfGenerator');
const path = require('path');
const fs = require('fs');

exports.create = async (req, res) => {
  try {
    const certificate = await MedicalCertificate.create(req.body);
    
    // Recharger avec les associations
    const fullCertificate = await MedicalCertificate.findByPk(certificate.id, {
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'first_name', 'last_name', 'position', 'birth_date']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'role']
        }
      ]
    });

    // Générer automatiquement le PDF
    try {
      const uploadsDir = path.join(__dirname, '../../uploads/certificates');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `certificat_${certificate.id}.pdf`;
      const filePath = path.join(uploadsDir, fileName);

      await saveCertificatePdf(
        fullCertificate.toJSON(),
        fullCertificate.player.toJSON(),
        fullCertificate.creator ? fullCertificate.creator.toJSON() : null,
        filePath
      );

      // Créer une entrée d'attachement pour le PDF
      const attachment = await Attachment.create({
        file_name: `Certificat_Medical_${fullCertificate.player.last_name}_${fullCertificate.player.first_name}.pdf`,
        file_path: `uploads/certificates/${fileName}`,
        file_size: fs.statSync(filePath).size,
        mime_type: 'application/pdf',
        entity_type: 'certificate',
        entity_id: certificate.id,
        uploaded_by: req.body.created_by
      });

      // Mettre à jour le certificat avec l'ID de l'attachement
      await certificate.update({ pdf_attachment_id: attachment.id });
      
    } catch (pdfError) {
      console.error('Erreur génération PDF:', pdfError);
      // Ne pas bloquer la création du certificat si la génération PDF échoue
    }
    
    emitCertificateCreated(certificate.player_id, certificate.id); // temps réel
    res.status(201).json(fullCertificate);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const certificates = await MedicalCertificate.findAll({
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'first_name', 'last_name', 'position'],
          required: false
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'role'],
          required: false
        }
      ],
      order: [['valid_from', 'DESC']]
    });
    res.json(certificates);
  } catch (err) {
    console.error('Erreur getAll certificates:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getByPlayerId = async (req, res) => {
  try {
    const { playerId } = req.params;
    const certificates = await MedicalCertificate.findAll({
      where: { player_id: playerId },
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'first_name', 'last_name', 'position'],
          required: false
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'role'],
          required: false
        }
      ],
      order: [['valid_from', 'DESC']]
    });
    res.json(certificates);
  } catch (err) {
    console.error('Erreur getByPlayerId certificates:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getLatest = async (req, res) => {
  try {
    const { playerId } = req.params;
    const certificate = await MedicalCertificate.findOne({
      where: { player_id: playerId },
      order: [['valid_from', 'DESC']],
    });
    if (!certificate) return res.status(404).json({ error: 'Aucun certificat trouvé' });
    res.json(certificate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const certificate = await MedicalCertificate.findByPk(req.params.id, {
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'first_name', 'last_name', 'position', 'birth_date'],
          required: false // Ne pas échouer si le joueur n'existe pas
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'role'],
          required: false // Ne pas échouer si le créateur n'existe pas
        }
      ]
    });
    if (!certificate) return res.status(404).json({ error: 'Certificat non trouvé' });
    res.json(certificate);
  } catch (err) {
    console.error('Erreur getById certificate:', err);
    console.error('Stack:', err.stack);
    res.status(500).json({ error: err.message, details: err.stack });
  }
};

exports.download = async (req, res) => {
  try {
    const certificate = await MedicalCertificate.findByPk(req.params.id, {
      include: [
        {
          model: Player,
          as: 'player',
          required: false
        },
        {
          model: User,
          as: 'creator',
          required: false
        }
      ]
    });
    
    if (!certificate) {
      return res.status(404).json({ error: 'Certificat non trouvé' });
    }

    if (!certificate.player) {
      return res.status(400).json({ error: 'Le joueur associé au certificat est introuvable' });
    }

    // Générer le PDF
    const doc = generateCertificatePdf(
      certificate.toJSON(),
      certificate.player.toJSON(),
      certificate.creator ? certificate.creator.toJSON() : null
    );

    // Configurer les en-têtes pour le téléchargement
    const fileName = `certificat_medical_${certificate.player.last_name}_${certificate.player.first_name}_${new Date(certificate.valid_from).toISOString().split('T')[0]}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Envoyer le PDF
    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error('Erreur download certificate:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const certificate = await MedicalCertificate.findByPk(req.params.id);
    if (!certificate) return res.status(404).json({ error: 'Certificat non trouvé' });
    await certificate.destroy();
    emitCertificateDeleted(certificate.player_id, certificate.id); // temps réel
    res.json({ message: 'Certificat supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
