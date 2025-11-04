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
        margin: 40,
        info: {
          Title: `Invoice - ${paymentData.razorpay_payment_id}`,
          Author: 'PlagiaSure',
          Subject: 'Payment Invoice',
          Creator: 'PlagiaSure Invoice System'
        }
      });

      // Add subtle page border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .strokeColor('#e0e0e0')
         .lineWidth(1)
         .stroke();

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

      // Header with professional gradient
      const headerHeight = 140;
      
      // Primary gradient background
      doc.rect(0, 0, doc.page.width, headerHeight)
         .fillAndStroke(colors.primary, colors.primary);
      
      // Secondary gradient overlay
      doc.rect(0, 0, doc.page.width, headerHeight)
         .fillOpacity(0.7)
         .fill(colors.secondary);

      // Reset opacity
      doc.fillOpacity(1);

      // Company Logo Area (Left Side) - Enhanced
      // Logo background circle
      doc.circle(70, 55, 20)
         .fillAndStroke('rgba(255,255,255,0.2)', 'rgba(255,255,255,0.3)');

      doc.fillColor('white')
         .fontSize(28)
         .font('Helvetica-Bold')
         .text('🔍', 62, 45);

      // Company Name with better styling
      doc.fontSize(28)
         .font('Helvetica-Bold')
         .fillColor('white')
         .text('PlagiaSure', 100, 40);

      // Company Tagline
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('rgba(255,255,255,0.9)')
         .text('Advanced AI & Plagiarism Detection Platform', 90, 70);

      // Company Contact
      doc.fontSize(10)
         .text('support@plagiasure.com | www.plagiasure.com', 90, 90);

      // Invoice Title (Right Side) - Better positioned
      doc.fillColor('white')
         .fontSize(28)
         .font('Helvetica-Bold')
         .text('INVOICE', doc.page.width - 180, 35);

      // Invoice Number
      doc.fontSize(12)
         .font('Helvetica')
         .text(`#${paymentData.razorpay_payment_id?.slice(-8) || 'INV-001'}`, doc.page.width - 180, 70);

      // Invoice Date - Better positioned
      doc.fontSize(11)
         .text(`Date: ${new Date(paymentData.created_at).toLocaleDateString('en-IN')}`, doc.page.width - 180, 90);

      // Due Date
      doc.text(`Status: PAID`, doc.page.width - 180, 105);

      // Billing Information Section - Better spaced
      let yPosition = headerHeight + 40; // Start after header with proper spacing
      
      // From Section (Left)
      doc.fillColor(colors.text)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('FROM:', 50, yPosition);

      yPosition += 20;
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(colors.primary)
         .text('PlagiaSure Technologies', 50, yPosition);
      
      doc.fontSize(11)
         .fillColor(colors.text)
         .text('AI Detection & Plagiarism Prevention', 50, yPosition + 18)
         .text('Email: support@plagiasure.com', 50, yPosition + 33)
         .text('Website: www.plagiasure.com', 50, yPosition + 48);

      // Bill To Section (Right) - Better positioned
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor(colors.text)
         .text('BILL TO:', 320, headerHeight + 40);

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor(colors.primary)
         .text(userData.email || 'Customer', 320, headerHeight + 60);
      
      doc.fontSize(11)
         .font('Helvetica')
         .fillColor(colors.text)
         .text(userData.school_name || 'Educational Institution', 320, headerHeight + 78)
         .text(`Customer ID: ${paymentData.user_id || 'N/A'}`, 320, headerHeight + 93);

      yPosition = headerHeight + 140; // Update position for next section

      // Service Details Table - Professional layout
      yPosition += 20;
      
      // Table Header with better styling
      const tableWidth = doc.page.width - 100;
      doc.rect(50, yPosition, tableWidth, 35)
         .fillAndStroke(colors.primary, colors.primary);

      doc.fillColor('white')
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('DESCRIPTION', 60, yPosition + 12)
         .text('PLAN', 280, yPosition + 12)
         .text('AMOUNT', 450, yPosition + 12);

      yPosition += 35;

      // Service Row with better spacing
      doc.rect(50, yPosition, tableWidth, 60)
         .fillAndStroke('#fafafa', '#e0e0e0');

      const planNames = {
        'basic_monthly': 'Basic Plan (Monthly)',
        'basic_yearly': 'Basic Plan (Yearly)',
        'pro_monthly': 'Pro Plan (Monthly)', 
        'pro_yearly': 'Pro Plan (Yearly)'
      };

      const planName = planNames[paymentData.subscriptions?.plan_type] || 'Premium Subscription';
      
      // Service description
      doc.fillColor(colors.text)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('PlagiaSure Premium Subscription', 60, yPosition + 12);

      doc.fontSize(10)
         .font('Helvetica')
         .fillColor(colors.lightText)
         .text('Advanced AI Detection & Plagiarism Analysis', 60, yPosition + 28)
         .text('Full access to premium features and reports', 60, yPosition + 42);

      // Plan type
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor(colors.text)
         .text(planName, 280, yPosition + 20);

      // Amount with better formatting
      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor(colors.success)
         .text(`₹${(paymentData.amount / 100).toLocaleString('en-IN')}`, 450, yPosition + 18);

      yPosition += 60;

      // Payment Information Section - Better layout
      yPosition += 30;
      
      // Payment details box
      doc.rect(50, yPosition, doc.page.width - 100, 140)
         .fillAndStroke('#f8f9fa', '#ddd');

      doc.fillColor(colors.primary)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('PAYMENT DETAILS', 60, yPosition + 15);

      yPosition += 40;
      
      // Two column layout for payment info
      const paymentInfo = [
        ['Payment ID:', paymentData.razorpay_payment_id],
        ['Order ID:', paymentData.razorpay_order_id],
        ['Payment Method:', paymentData.payment_method || 'Razorpay Gateway'],
        ['Transaction Date:', new Date(paymentData.created_at).toLocaleDateString('en-IN')],
        ['Status:', 'COMPLETED'],
        ['Currency:', paymentData.currency || 'INR']
      ];

      // Left column
      paymentInfo.slice(0, 3).forEach(([label, value], index) => {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor(colors.lightText)
           .text(label, 60, yPosition + (index * 20));
           
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor(colors.text)
           .text(value, 160, yPosition + (index * 20));
      });

      // Right column
      paymentInfo.slice(3).forEach(([label, value], index) => {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor(colors.lightText)
           .text(label, 320, yPosition + (index * 20));
           
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .fillColor(colors.text)
           .text(value, 420, yPosition + (index * 20));
      });

      yPosition += 80;

      // Total Amount Section - Prominent display
      yPosition += 30;
      
      // Total amount box - right aligned
      const totalBoxWidth = 220;
      const totalBoxX = doc.page.width - totalBoxWidth - 50;
      
      doc.rect(totalBoxX, yPosition, totalBoxWidth, 50)
         .fillAndStroke(colors.success, colors.success);

      doc.fillColor('white')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('TOTAL AMOUNT PAID:', totalBoxX + 15, yPosition + 12);

      doc.fontSize(22)
         .font('Helvetica-Bold')
         .text(`₹${(paymentData.amount / 100).toLocaleString('en-IN')}`, totalBoxX + 15, yPosition + 28);

      yPosition += 70;

      // Thank You Section
      yPosition += 20;
      
      doc.rect(50, yPosition, doc.page.width - 100, 60)
         .fillAndStroke('#f0f8ff', '#cce7ff');

      doc.fillColor(colors.primary)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('Thank you for choosing PlagiaSure!', 50, yPosition + 15, { 
           align: 'center', 
           width: doc.page.width - 100 
         });

      doc.fontSize(11)
         .font('Helvetica')
         .fillColor(colors.text)
         .text('Your subscription gives you access to advanced AI detection and plagiarism analysis tools.', 50, yPosition + 35, { 
           align: 'center', 
           width: doc.page.width - 100 
         });

      // Footer with generation info
      yPosition = doc.page.height - 80;
      
      // Footer line
      doc.moveTo(50, yPosition)
         .lineTo(doc.page.width - 50, yPosition)
         .strokeColor('#ddd')
         .stroke();

      yPosition += 15;
      
      doc.fillColor(colors.lightText)
         .fontSize(9)
         .font('Helvetica')
         .text('This invoice was generated automatically by PlagiaSure Invoice System.', 50, yPosition, { 
           align: 'center', 
           width: doc.page.width - 100 
         });

      doc.text(`Generated on ${new Date().toLocaleString('en-IN')} | For support: support@plagiasure.com`, 50, yPosition + 15, { 
         align: 'center', 
         width: doc.page.width - 100 
       });

      doc.fontSize(8)
         .text('PlagiaSure - Advanced AI & Plagiarism Detection Platform', 50, yPosition + 30, { 
           align: 'center', 
           width: doc.page.width - 100 
         });

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