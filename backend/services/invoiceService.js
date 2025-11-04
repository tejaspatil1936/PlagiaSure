import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Generate a professional PDF invoice
 * @param {Object} paymentData - Payment information
 * @param {Object} userData - User information
 * @returns {Buffer} PDF buffer
 */
export const generateInvoicePDF = async (paymentData, userData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4',
        margin: 50,
        info: {
          Title: `Invoice - ${paymentData.razorpay_payment_id}`,
          Author: 'PlagiaSure',
          Subject: 'Payment Invoice',
          Creator: 'PlagiaSure Invoice System'
        }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Colors matching the theme
      const colors = {
        primary: '#2D4B7C',
        secondary: '#3282B8', 
        accent: '#3AB795',
        success: '#52DE97',
        text: '#333333',
        lightText: '#666666',
        background: '#f8f9fa'
      };

      // Header with gradient effect (simulated with rectangles)
      doc.rect(0, 0, doc.page.width, 120)
         .fillAndStroke(colors.primary, colors.primary);
      
      doc.rect(0, 0, doc.page.width, 120)
         .fillOpacity(0.8)
         .fill(colors.secondary);

      // Logo and Company Name
      doc.fillColor('white')
         .fontSize(28)
         .font('Helvetica-Bold')
         .text('🔍 PlagiaSure', 50, 40);

      doc.fontSize(14)
         .font('Helvetica')
         .text('Advanced AI & Plagiarism Detection Platform', 50, 75);

      // Invoice Title
      doc.fillColor('white')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('PAYMENT INVOICE', doc.page.width - 200, 40, { align: 'right', width: 150 });

      // Invoice Date
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Date: ${new Date(paymentData.created_at).toLocaleDateString()}`, doc.page.width - 200, 75, { align: 'right', width: 150 });

      // Reset fill opacity
      doc.fillOpacity(1);

      // Company Information Section
      let yPosition = 160;
      
      doc.fillColor(colors.text)
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('From:', 50, yPosition);

      yPosition += 25;
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor(colors.text)
         .text('PlagiaSure', 50, yPosition)
         .text('AI Detection Suite', 50, yPosition + 15)
         .text('Advanced Plagiarism Detection Service', 50, yPosition + 30)
         .text('Email: support@plagiasure.com', 50, yPosition + 45);

      // Customer Information Section
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor(colors.text)
         .text('Bill To:', 300, 160);

      doc.fontSize(12)
         .font('Helvetica')
         .text(userData.email || 'Customer', 300, 185)
         .text(userData.school_name || 'Educational Institution', 300, 200);

      // Payment Details Section
      yPosition = 280;
      
      // Table Header
      doc.rect(50, yPosition, doc.page.width - 100, 30)
         .fillAndStroke(colors.secondary, colors.secondary);

      doc.fillColor('white')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('Description', 60, yPosition + 10)
         .text('Plan Type', 250, yPosition + 10)
         .text('Amount', 450, yPosition + 10);

      yPosition += 30;

      // Table Row
      doc.rect(50, yPosition, doc.page.width - 100, 50)
         .fillAndStroke(colors.background, '#e9ecef');

      const planNames = {
        'basic_monthly': 'Basic Plan (Monthly)',
        'basic_yearly': 'Basic Plan (Yearly)',
        'pro_monthly': 'Pro Plan (Monthly)', 
        'pro_yearly': 'Pro Plan (Yearly)'
      };

      doc.fillColor(colors.text)
         .fontSize(11)
         .font('Helvetica-Bold')
         .text(planNames[paymentData.subscriptions?.plan_type] || 'Subscription Plan', 60, yPosition + 10);

      doc.fontSize(9)
         .font('Helvetica')
         .fillColor(colors.lightText)
         .text('Premium AI & Plagiarism Detection Service', 60, yPosition + 25);

      doc.fontSize(11)
         .font('Helvetica')
         .fillColor(colors.text)
         .text(paymentData.subscriptions?.plan_type || 'N/A', 250, yPosition + 15);

      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor(colors.success)
         .text(`₹${(paymentData.amount / 100).toFixed(0)}`, 450, yPosition + 15);

      // Payment Information
      yPosition += 80;
      
      doc.rect(50, yPosition, doc.page.width - 100, 120)
         .fillAndStroke('#f8f9fa', '#e9ecef');

      doc.fillColor(colors.text)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('Payment Information', 60, yPosition + 15);

      yPosition += 35;
      const paymentInfo = [
        ['Payment ID:', paymentData.razorpay_payment_id],
        ['Order ID:', paymentData.razorpay_order_id],
        ['Payment Method:', paymentData.payment_method || 'Razorpay'],
        ['Status:', 'PAID'],
        ['Currency:', paymentData.currency || 'INR']
      ];

      paymentInfo.forEach(([label, value], index) => {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor(colors.lightText)
           .text(label, 60, yPosition + (index * 15))
           .fillColor(colors.text)
           .font('Helvetica-Bold')
           .text(value, 150, yPosition + (index * 15));
      });

      // Total Amount Section
      yPosition += 120;
      
      doc.rect(doc.page.width - 250, yPosition, 200, 40)
         .fillAndStroke(colors.accent, colors.accent);

      doc.fillColor('white')
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('Total Amount:', doc.page.width - 240, yPosition + 12);

      doc.fontSize(20)
         .text(`₹${(paymentData.amount / 100).toFixed(0)}`, doc.page.width - 120, yPosition + 12);

      // Footer
      yPosition = doc.page.height - 120;
      
      doc.fillColor(colors.lightText)
         .fontSize(10)
         .font('Helvetica')
         .text('Thank you for choosing PlagiaSure!', 50, yPosition, { align: 'center', width: doc.page.width - 100 });

      doc.text('This invoice was generated automatically. For any queries, please contact our support team.', 50, yPosition + 20, { align: 'center', width: doc.page.width - 100 });

      doc.text(`Generated on ${new Date().toLocaleString()} | PlagiaSure - Advanced AI Detection Platform`, 50, yPosition + 40, { align: 'center', width: doc.page.width - 100 });

      // Finalize the PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get plan display name
 * @param {string} planType - Plan type identifier
 * @returns {string} Human readable plan name
 */
export const getPlanDisplayName = (planType) => {
  const planNames = {
    'basic_monthly': 'Basic Plan (Monthly)',
    'basic_yearly': 'Basic Plan (Yearly)',
    'pro_monthly': 'Pro Plan (Monthly)',
    'pro_yearly': 'Pro Plan (Yearly)'
  };
  return planNames[planType] || planType;
};