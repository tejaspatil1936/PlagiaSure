import { jsPDF } from "jspdf";

// Your website color scheme
const colors = {
  darkBlue: "#2D4B7C",
  midBlue: "#3282B8",
  teal: "#3AB795",
  brightGreen: "#52DE97",
  white: "#FFFFFF",
  text: "#333333",
  lightText: "#666666",
};

// Plan names mapping
const planNames = {
  basic_monthly: "Basic Plan (Monthly)",
  basic_yearly: "Basic Plan (Yearly)",
  pro_monthly: "Pro Plan (Monthly)",
  pro_yearly: "Pro Plan (Yearly)",
};

export const generateInvoicePDF = (invoiceData) => {
  const { payment, user, company } = invoiceData;

  // Create new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Modern minimalist header
  doc.setFillColor(45, 75, 124); // Dark blue
  doc.rect(0, 0, pageWidth, 65, "F");

  // Subtle gradient overlay
  doc.setFillColor(50, 130, 184);
  doc.setGState(new doc.GState({ opacity: 0.6 }));
  doc.rect(0, 0, pageWidth, 65, "F");
  doc.setGState(new doc.GState({ opacity: 1 }));

  // Company branding - clean and modern
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.text("PlagiaSure", 25, 32);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Advanced AI & Plagiarism Detection Platform", 25, 44);
  doc.text(`${company.email} • ${company.website}`, 25, 54);

  // Invoice card - modern floating design
  const cardX = pageWidth - 90;
  doc.setFillColor(255, 255, 255, 0.2);
  doc.roundedRect(cardX, 12, 80, 42, 4, 4, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", cardX + 6, 26);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`#${payment.id.slice(-8)}`, cardX + 6, 34);
  doc.text(
    `${new Date(payment.createdAt).toLocaleDateString("en-IN")}`,
    cardX + 6,
    42
  );

  doc.setTextColor(82, 222, 151);
  doc.setFont("helvetica", "bold");
  doc.text("PAID", cardX + 6, 50);

  // Reset for body content
  doc.setTextColor(51, 51, 51);

  // Billing information with modern card design
  let yPos = 85;

  // From card - clean design
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.roundedRect(25, yPos, 75, 50, 6, 6, "FD");

  doc.setTextColor(45, 75, 124);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("FROM", 32, yPos + 15);

  doc.setTextColor(51, 51, 51);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("PlagiaSure Technologies", 32, yPos + 26);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("AI Detection & Plagiarism Prevention", 32, yPos + 35);
  doc.text(`${company.email}`, 32, yPos + 43);

  // To card - matching design
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(110, yPos, 75, 50, 6, 6, "FD");

  doc.setTextColor(45, 75, 124);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO", 117, yPos + 15);

  doc.setTextColor(51, 51, 51);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(user.email, 117, yPos + 26);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(user.schoolName || "Educational Institution", 117, yPos + 35);
  doc.text(`Customer ID: ${user.userId.slice(-8)}`, 117, yPos + 43);

  // Service details - modern table design
  yPos += 70;

  // Table header with rounded corners
  doc.setFillColor(45, 75, 124);
  doc.roundedRect(25, yPos, pageWidth - 50, 20, 4, 4, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("SERVICE DESCRIPTION", 32, yPos + 13);
  doc.text("PLAN", 125, yPos + 13);
  doc.text("AMOUNT", 160, yPos + 13);

  // Service row - clean background
  yPos += 20;
  doc.setFillColor(253, 253, 253);
  doc.rect(25, yPos, pageWidth - 50, 40, "F");

  // Add subtle border
  doc.setDrawColor(240, 240, 240);
  doc.setLineWidth(0.5);
  doc.rect(25, yPos, pageWidth - 50, 40, "S");

  // Service details with better typography
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PlagiaSure Premium Subscription", 32, yPos + 15);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("• Advanced AI content detection", 32, yPos + 24);
  doc.text("• Comprehensive plagiarism analysis", 32, yPos + 32);

  // Plan name with better styling
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(planNames[payment.planType] || "Premium", 125, yPos + 22);

  // Amount with emphasis and proper currency
  doc.setTextColor(82, 222, 151);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Rs. ${(payment.amount / 100).toLocaleString("en-IN")}`,
    160,
    yPos + 22
  );

  // Payment details in modern card
  yPos += 60;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.roundedRect(25, yPos, pageWidth - 50, 65, 6, 6, "FD");

  doc.setTextColor(45, 75, 124);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT DETAILS", 32, yPos + 18);

  // Payment info in organized grid with proper text wrapping
  const paymentDetails = [
    ["Payment ID", payment.id.slice(-12)], // Truncate long IDs
    ["Order ID", payment.orderId.slice(-12)], // Truncate long IDs
    ["Method", payment.paymentMethod],
    ["Date", new Date(payment.createdAt).toLocaleDateString("en-IN")],
    ["Status", "COMPLETED"],
    ["Currency", payment.currency],
  ];

  doc.setTextColor(107, 114, 128);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  paymentDetails.forEach(([label, value], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = col === 0 ? 32 : 125;
    const y = yPos + 30 + row * 12;

    doc.text(`${label}:`, x, y);
    doc.setTextColor(51, 51, 51);
    doc.setFont("helvetica", "bold");

    // Handle long text by truncating if needed
    const maxWidth = 35;
    let displayValue = value;
    if (doc.getTextWidth(value) > maxWidth) {
      displayValue = value.substring(0, 15) + "...";
    }

    doc.text(displayValue, x + 35, y);
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
  });

  // Total amount - prominent modern design
  yPos += 85;
  doc.setFillColor(82, 222, 151);
  doc.roundedRect(pageWidth - 115, yPos, 90, 35, 6, 6, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL PAID", pageWidth - 110, yPos + 15);

  doc.setFontSize(18);
  doc.text(
    `Rs. ${(payment.amount / 100).toLocaleString("en-IN")}`,
    pageWidth - 110,
    yPos + 28
  );

  // Thank you message - clean and professional
  yPos += 55;
  doc.setTextColor(45, 75, 124);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  const thankText = "Thank you for choosing PlagiaSure!";
  const thankWidth = doc.getTextWidth(thankText);
  doc.text(thankText, (pageWidth - thankWidth) / 2, yPos);

  doc.setTextColor(107, 114, 128);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const subText =
    "Your subscription includes premium AI detection and comprehensive plagiarism analysis.";
  const subWidth = doc.getTextWidth(subText);
  doc.text(subText, (pageWidth - subWidth) / 2, yPos + 15);

  // Modern footer - minimal and clean
  yPos += 35;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(25, yPos, pageWidth - 25, yPos);

  doc.setTextColor(107, 114, 128);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");

  const footerText = `Generated on ${new Date().toLocaleDateString(
    "en-IN"
  )} • PlagiaSure Invoice System • ${company.email}`;
  const footerWidth = doc.getTextWidth(footerText);
  doc.text(footerText, (pageWidth - footerWidth) / 2, yPos + 12);

  return doc;
};

export const downloadInvoicePDF = (invoiceData, filename) => {
  const doc = generateInvoicePDF(invoiceData);
  doc.save(filename || `invoice-${invoiceData.payment.id}.pdf`);
};
