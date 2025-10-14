const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Génère un certificat médical en PDF
 * @param {Object} certificate - Les données du certificat
 * @param {Object} player - Les informations du joueur
 * @param {Object} creator - L'utilisateur créateur du certificat
 * @returns {PDFDocument} - Le document PDF
 */
function generateCertificatePdf(certificate, player, creator) {
  // Créer un nouveau document PDF
  const doc = new PDFDocument({
    size: 'A4',
    margins: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50
    }
  });

  // Couleurs et styles
  const primaryColor = '#C8102E'; // Rouge Wydad
  const secondaryColor = '#FFD700'; // Or
  const textColor = '#333333';
  const lightGray = '#F5F5F5';

  // En-tête avec logo et titre
  doc.fontSize(24)
     .fillColor(primaryColor)
     .font('Helvetica-Bold')
     .text('WYDAD ATHLETIC CLUB', { align: 'center' });

  doc.fontSize(12)
     .fillColor(textColor)
     .font('Helvetica')
     .text('Département Médical', { align: 'center' });

  doc.moveDown(1);

  // Ligne de séparation
  doc.moveTo(50, doc.y)
     .lineTo(545, doc.y)
     .strokeColor(primaryColor)
     .lineWidth(2)
     .stroke();

  doc.moveDown(1.5);

  // Titre du document
  doc.fontSize(20)
     .fillColor(primaryColor)
     .font('Helvetica-Bold')
     .text('CERTIFICAT MÉDICAL', { align: 'center' });

  doc.moveDown(1.5);

  // Date d'émission
  const issueDate = new Date(certificate.valid_from);
  doc.fontSize(10)
     .fillColor(textColor)
     .font('Helvetica')
     .text(`Émis le ${formatDate(issueDate)}`, { align: 'right' });

  doc.moveDown(1);

  // Informations du joueur
  doc.fontSize(14)
     .fillColor(primaryColor)
     .font('Helvetica-Bold')
     .text('INFORMATIONS DU JOUEUR');

  doc.moveDown(0.5);

  // Cadre pour les infos joueur
  const playerBoxY = doc.y;
  doc.rect(50, playerBoxY, 495, 120)
     .fillAndStroke(lightGray, textColor)
     .lineWidth(0.5);

  doc.fillColor(textColor)
     .fontSize(11)
     .font('Helvetica-Bold')
     .text('Nom complet:', 70, playerBoxY + 15);
  
  doc.font('Helvetica')
     .text(`${player.first_name} ${player.last_name}`, 180, playerBoxY + 15);

  doc.font('Helvetica-Bold')
     .text('Poste:', 70, playerBoxY + 35);
  
  doc.font('Helvetica')
     .text(player.position || 'Non spécifié', 180, playerBoxY + 35);

  if (player.birth_date) {
    doc.font('Helvetica-Bold')
       .text('Date de naissance:', 70, playerBoxY + 55);
    
    doc.font('Helvetica')
       .text(formatDate(new Date(player.birth_date)), 180, playerBoxY + 55);
  }

  doc.font('Helvetica-Bold')
     .text('N° Joueur:', 70, playerBoxY + 75);
  
  doc.font('Helvetica')
     .text(player.id.substring(0, 8), 180, playerBoxY + 75);

  doc.y = playerBoxY + 130;
  doc.moveDown(1);

  // Statut médical
  doc.fontSize(14)
     .fillColor(primaryColor)
     .font('Helvetica-Bold')
     .text('STATUT MÉDICAL');

  doc.moveDown(0.5);

  // Déterminer la couleur du statut
  let statusColor;
  let statusText;
  switch(certificate.status) {
    case 'APTE':
      statusColor = '#28A745'; // Vert
      statusText = '✓ APTE À LA PRATIQUE SPORTIVE';
      break;
    case 'APTE_RESTRICTIONS':
      statusColor = '#FFC107'; // Orange
      statusText = '⚠ APTE AVEC RESTRICTIONS';
      break;
    case 'TEMP_INAPTE':
      statusColor = '#FF6B6B'; // Rouge clair
      statusText = '⏸ TEMPORAIREMENT INAPTE';
      break;
    case 'INAPTE':
      statusColor = '#DC3545'; // Rouge
      statusText = '✗ INAPTE À LA PRATIQUE SPORTIVE';
      break;
    default:
      statusColor = textColor;
      statusText = certificate.status;
  }

  const statusBoxY = doc.y;
  doc.rect(50, statusBoxY, 495, 50)
     .fillAndStroke(statusColor, statusColor)
     .lineWidth(2);

  doc.fontSize(16)
     .fillColor('#FFFFFF')
     .font('Helvetica-Bold')
     .text(statusText, 50, statusBoxY + 17, {
       width: 495,
       align: 'center'
     });

  doc.y = statusBoxY + 60;
  doc.moveDown(0.5);

  // Restrictions (si applicable)
  if (certificate.restrictions) {
    doc.fontSize(12)
       .fillColor(primaryColor)
       .font('Helvetica-Bold')
       .text('Restrictions / Observations:');

    doc.moveDown(0.3);

    const restrictionsBoxY = doc.y;
    doc.rect(50, restrictionsBoxY, 495, 80)
       .fillAndStroke('#FFF3CD', textColor)
       .lineWidth(0.5);

    doc.fontSize(10)
       .fillColor(textColor)
       .font('Helvetica-Oblique')
       .text(certificate.restrictions, 70, restrictionsBoxY + 15, {
         width: 455,
         align: 'left'
       });

    doc.y = restrictionsBoxY + 90;
    doc.moveDown(0.5);
  }

  // Période de validité
  doc.fontSize(12)
     .fillColor(primaryColor)
     .font('Helvetica-Bold')
     .text('PÉRIODE DE VALIDITÉ');

  doc.moveDown(0.3);

  const validityBoxY = doc.y;
  doc.rect(50, validityBoxY, 495, 40)
     .fillAndStroke(lightGray, textColor)
     .lineWidth(0.5);

  doc.fontSize(11)
     .fillColor(textColor)
     .font('Helvetica-Bold')
     .text('Du:', 70, validityBoxY + 15);

  doc.font('Helvetica')
     .text(formatDate(new Date(certificate.valid_from)), 120, validityBoxY + 15);

  if (certificate.valid_until) {
    doc.font('Helvetica-Bold')
       .text('Au:', 300, validityBoxY + 15);
    
    doc.font('Helvetica')
       .text(formatDate(new Date(certificate.valid_until)), 330, validityBoxY + 15);
  } else {
    doc.font('Helvetica-Oblique')
       .text('(Validité indéterminée)', 300, validityBoxY + 15);
  }

  doc.y = validityBoxY + 50;
  doc.moveDown(2);

  // Signature du médecin
  doc.fontSize(12)
     .fillColor(textColor)
     .font('Helvetica-Bold')
     .text('Médecin certifiant:', 50, doc.y);

  doc.fontSize(14)
     .fillColor(primaryColor)
     .font('Helvetica-Bold')
     .text(certificate.physician_name || 'Dr. Non spécifié', 50, doc.y + 5);

  if (creator) {
    doc.fontSize(9)
       .fillColor(textColor)
       .font('Helvetica-Oblique')
       .text(`Créé par: ${creator.first_name} ${creator.last_name} (${creator.role})`, 50, doc.y + 5);
  }

  // Pied de page
  const pageHeight = doc.page.height;
  doc.fontSize(8)
     .fillColor('#999999')
     .font('Helvetica')
     .text('_'.repeat(80), 50, pageHeight - 100, { align: 'center' });

  doc.fontSize(8)
     .fillColor('#666666')
     .text(`Certificat N°: ${certificate.id}`, 50, pageHeight - 80, { align: 'center' });

  doc.fontSize(8)
     .fillColor('#999999')
     .text('Ce document est confidentiel et destiné exclusivement à un usage médical et sportif.', 
       50, pageHeight - 65, { align: 'center', width: 495 });

  doc.fontSize(7)
     .text('Wydad Athletic Club - Département Médical - Casablanca, Maroc', 
       50, pageHeight - 50, { align: 'center', width: 495 });

  // Ligne de séparation en bas
  doc.moveTo(50, pageHeight - 35)
     .lineTo(545, pageHeight - 35)
     .strokeColor(primaryColor)
     .lineWidth(1)
     .stroke();

  return doc;
}

/**
 * Formate une date au format français
 * @param {Date} date - La date à formater
 * @returns {string} - La date formatée
 */
function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('fr-FR', options);
}

/**
 * Sauvegarde le PDF dans le système de fichiers
 * @param {Object} certificate - Les données du certificat
 * @param {Object} player - Les informations du joueur
 * @param {Object} creator - L'utilisateur créateur
 * @param {string} outputPath - Le chemin de sortie
 * @returns {Promise} - Promise résolue quand le fichier est sauvegardé
 */
function saveCertificatePdf(certificate, player, creator, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = generateCertificatePdf(certificate, player, creator);
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);
    doc.end();

    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

module.exports = {
  generateCertificatePdf,
  saveCertificatePdf
};

