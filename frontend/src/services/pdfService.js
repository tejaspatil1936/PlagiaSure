import { jsPDF } from 'jspdf';

// Your website color scheme
const colors = {
  darkBlue: '#2D4B7C',
  midBlue: '#3282B8',
  teal: '#3AB795',
  brightGreen: '#52DE97',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#666666'
};

// Plan names mapping
const planNames = {
  'basic_monthly': 'Basic Plan (Monthly)',
  'basic_yearly': 'Basic Plan (Yearly)',
  'pro_monthly': 'Pro Plan (Monthly)',
  'pro_yearly': 'Pro Plan (Yearly)'
};

export const generateInvoicePDF = (invoiceData) => {
  const { payment, user, company } = invoiceData;
  
  // Create new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Add page border
  doc.setDrawColor(224, 224, 224);
  doc.setLineWidth(0.5);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Header background (simulate gradient with rectangles)
  doc.setFillColor(45, 75, 124); // Dark blue
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  doc.setFillColor(50, 130, 184, 0.8); // Mid blue with transparency effect
  doc.rect(0, 0, pageWidth, 60, 'F');

  // Company name and info
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('PlagiaSure', 20, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(company.tagline, 20, 35);
  doc.text(`${company.email} | ${company.website}`, 20, 45);

  // Invoice title (right side)
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - 60, 25);

  // Invoice number with bright green
  doc.setTextColor(82, 222, 151); // Bright green
  doc.setFontSize(9);
  doc.text(`#${payment.id.slice(-8)}`, pageWidth - 60, 35);

  // Date and status
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(`Date: ${new Date(payment.createdAt).toLocaleDateString('en-IN')}`, pageWidth - 60, 42);
  
  doc.setTextColor(82, 222, 151); // Bright green
  doc.setFont('helvetica', 'bold');
  doc.text('Status: PAID', pageWidth - 60, 49);

  // Reset text color for body
  doc.setTextColor(51, 51, 51);

  // From section
  let yPos = 80;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('FROM:', 20, yPos);

  yPos += 10;
  doc.setTextColor(45, 75, 124); // Dark blue
  doc.setFontSize(10);
  doc.text('PlagiaSure Technologies', 20, yPos);

  doc.setTextColor(51, 51, 51);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  yPos += 8;
  doc.text('AI Detection & Plagiarism Prevention', 20, yPos);
  yPos += 6;
  doc.text(`Email: ${company.email}`, 20, yPos);
  yPos += 6;
  doc.text(`Website: ${company.website}`, 20, yPos);

  // Bill To section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 51, 51);
  doc.text('BILL TO:', 120, 80);

  doc.setTextColor(45, 75, 124); // Dark blue
  doc.setFontSize(10);
  doc.text(user.email, 120, 90);

  doc.setTextColor(51, 51, 51);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(user.schoolName || 'Educational Institution', 120, 98);
  doc.text(`Customer ID: ${user.userId}`, 120, 106);

  // Service table
  yPos = 130;
  
  // Table header
  doc.setFillColor(50, 130, 184); // Mid blue
  doc.rect(20, yPos, pageWidth - 40, 15, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION', 25, yPos + 10);
  doc.text('PLAN', 100, yPos + 10);
  doc.text('AMOUNT', 150, yPos + 10);

  // Table row
  yPos += 15;
  doc.setFillColor(250, 250, 250);
  doc.rect(20, yPos, pageWidth - 40, 25, 'F');

  doc.setTextColor(51, 51, 51);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PlagiaSure Premium Subscription', 25, yPos + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Advanced AI Detection & Plagiarism Analysis', 25, yPos + 15);
  doc.text('Full access to premium features and reports', 25, yPos + 22);

  // Plan type
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(planNames[payment.planType] || 'Premium Subscription', 100, yPos + 12);

  // Amount
  doc.setTextColor(82, 222, 151); // Bright green
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs. ${(payment.amount / 100).toLocaleString('en-IN')}`, 150, yPos + 12);

  // Payment details section
  yPos += 40;
  doc.setFillColor(248, 249, 250);
  doc.setDrawColor(221, 221, 221);
  doc.rect(20, yPos, pageWidth - 40, 50, 'FD');

  doc.setTextColor(45, 75, 124); // Dark blue
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT DETAILS', 25, yPos + 12);

  // Payment info in two columns
  const paymentInfo = [
    ['Payment ID:', payment.id],
    ['Order ID:', payment.orderId],
    ['Payment Method:', payment.paymentMethod],
    ['Transaction Date:', new Date(payment.createdAt).toLocaleDateString('en-IN')],
    ['Status:', 'COMPLETED'],
    ['Currency:', payment.currency]
  ];

  doc.setTextColor(102, 102, 102);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  // Left column
  paymentInfo.slice(0, 3).forEach(([label, value], index) => {
    const y = yPos + 25 + (index * 8);
    doc.text(label, 25, y);
    doc.setTextColor(51, 51, 51);
    doc.setFont('helvetica', 'bold');
    doc.text(value, 65, y);
    doc.setTextColor(102, 102, 102);
    doc.setFont('helvetica', 'normal');
  });

  // Right column
  paymentInfo.slice(3).forEach(([label, value], index) => {
    const y = yPos + 25 + (index * 8);
    doc.text(label, 120, y);
    doc.setTextColor(51, 51, 51);
    doc.setFont('helvetica', 'bold');
    doc.text(value, 160, y);
    doc.setTextColor(102, 102, 102);
    doc.setFont('helvetica', 'normal');
  });

  // Total amount box
  yPos += 70;
  const boxWidth = 80;
  const boxX = pageWidth - boxWidth - 20;
  
  doc.setFillColor(82, 222, 151); // Bright green
  doc.rect(boxX, yPos, boxWidth, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL AMOUNT PAID:', boxX + 5, yPos + 8);

  doc.setFontSize(14);
  doc.text(`Rs. ${(payment.amount / 100).toLocaleString('en-IN')}`, boxX + 5, yPos + 16);

  // Thank you section
  yPos += 35;
  doc.setFillColor(58, 183, 149, 0.1); // Teal with transparency
  doc.setDrawColor(58, 183, 149, 0.3);
  doc.rect(20, yPos, pageWidth - 40, 25, 'FD');

  doc.setTextColor(45, 75, 124); // Dark blue
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  const thankYouText = 'Thank you for choosing PlagiaSure!';
  const textWidth = doc.getTextWidth(thankYouText);
  doc.text(thankYouText, (pageWidth - textWidth) / 2, yPos + 10);

  doc.setTextColor(51, 51, 51);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const benefitText = 'Your subscription gives you access to advanced AI detection and plagiarism analysis tools.';
  const benefitWidth = doc.getTextWidth(benefitText);
  doc.text(benefitText, (pageWidth - benefitWidth) / 2, yPos + 18);

  // Footer
  yPos = pageHeight - 30;
  doc.setDrawColor(221, 221, 221);
  doc.line(20, yPos, pageWidth - 20, yPos);

  doc.setTextColor(102, 102, 102);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  const footerText1 = 'This invoice was generated automatically by PlagiaSure Invoice System.';
  const footer1Width = doc.getTextWidth(footerText1);
  doc.text(footerText1, (pageWidth - footer1Width) / 2, yPos + 8);

  const footerText2 = `Generated on ${new Date().toLocaleString('en-IN')} | For support: ${company.email}`;
  const footer2Width = doc.getTextWidth(footerText2);
  doc.text(footerText2, (pageWidth - footer2Width) / 2, yPos + 15);

  const footerText3 = 'PlagiaSure - Advanced AI & Plagiarism Detection Platform';
  const footer3Width = doc.getTextWidth(footerText3);
  doc.text(footerText3, (pageWidth - footer3Width) / 2, yPos + 22);

  return doc;
};

export const downloadInvoicePDF = (invoiceData, filename) => {
  const doc = generateInvoicePDF(invoiceData);
  doc.save(filename || `invoice-${invoiceData.payment.id}.pdf`);
};