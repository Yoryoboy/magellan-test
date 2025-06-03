import { jsPDF } from 'jspdf';
import type { UserData } from '../types/testTypes';
import type { Question } from '../types/question';

/**
 * Format a date in a consistent way
 */
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Generate a PDF summary of the test results
 * @param userData - User data including name, email, etc.
 * @param questions - Array of questions with user answers
 * @param score - Total score achieved
 * @param percentage - Percentage score
 * @returns The generated PDF document
 */
/**
 * Helper function to draw a rounded rectangle
 */
const drawRoundedRect = (doc: jsPDF, x: number, y: number, width: number, height: number, radius: number, color: string) => {
  // Save current state
  const fillStyle = doc.getFillColor();
  
  // Set fill color
  doc.setFillColor(color);
  
  // Draw rounded rectangle
  doc.roundedRect(x, y, width, height, radius, radius, 'F');
  
  // Restore state
  doc.setFillColor(fillStyle);
};

/**
 * Helper function to draw a section header
 */
const drawSectionHeader = (doc: jsPDF, text: string, y: number) => {
  // Draw background
  drawRoundedRect(doc, 10, y - 6, 190, 10, 2, '#4F46E5');
  
  // Add text
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(text, 14, y);
  
  // Reset text color
  doc.setTextColor('#000000');
  doc.setFont('helvetica', 'normal');
};

export const generateTestSummaryPDF = (
  userData: UserData,
  questions: Question[],
  score: number,
  percentage: number
): jsPDF => {
  try {
    const doc = new jsPDF();
    const totalPoints = questions.reduce((total, q) => total + q.points, 0);
    
    // Add page background
    drawRoundedRect(doc, 0, 0, 210, 297, 0, '#FFFFFF');
    
    // Add header background
    drawRoundedRect(doc, 0, 0, 210, 40, 0, '#4F46E5');
    
    // Add title
    doc.setTextColor('#FFFFFF');
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Magellan Written Test', 105, 20, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Results Summary', 105, 30, { align: 'center' });
    doc.setTextColor('#000000');
    doc.setFont('helvetica', 'normal');
    
    // Add user information box - make it taller to accommodate all information
    drawRoundedRect(doc, 10, 50, 190, 60, 4, '#F3F4F6');
    
    // Add user information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('User Information', 105, 60, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    
    const infoStartY = 70;
    const infoLabelWidth = 30; // Width for labels
    const infoValueWidth = 65; // Width for values
    
    // Left column - Labels
    doc.setFont('helvetica', 'bold');
    doc.text('Name:', 20, infoStartY);
    doc.text('Email:', 20, infoStartY + 10);
    doc.text('Test ID:', 20, infoStartY + 20);
    
    // Left column - Values
    doc.setFont('helvetica', 'normal');
    doc.text(userData.name, 20 + infoLabelWidth, infoStartY);
    doc.text(userData.email, 20 + infoLabelWidth, infoStartY + 10);
    doc.text(userData.taskId || 'N/A', 20 + infoLabelWidth, infoStartY + 20);
    
    // Right column - Labels
    doc.setFont('helvetica', 'bold');
    doc.text('Test Date:', 20 + infoLabelWidth + infoValueWidth, infoStartY);
    doc.text('Submission:', 20 + infoLabelWidth + infoValueWidth, infoStartY + 10);
    
    // Right column - Values
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(new Date(userData.startTime)), 20 + infoLabelWidth * 2 + infoValueWidth, infoStartY);
    doc.text(formatDate(new Date()), 20 + infoLabelWidth * 2 + infoValueWidth, infoStartY + 10);
    
    // Add score information box
    const scoreBoxY = 110;
    drawRoundedRect(doc, 10, scoreBoxY, 190, 30, 4, percentage >= 70 ? '#DCFCE7' : '#FEE2E2');
    
    // Add score information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Test Results', 105, scoreBoxY + 10, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(percentage >= 70 ? '#166534' : '#991B1B');
    doc.text(`Score: ${score} out of ${totalPoints} points (${percentage.toFixed(2)}%)`, 105, scoreBoxY + 20, { align: 'center' });
    
    // Reset text color
    doc.setTextColor('#000000');
    doc.setFont('helvetica', 'normal');
    
    // Add incorrect answers section
    const incorrectAnswersSectionY = 150;
    drawSectionHeader(doc, 'Incorrect Answers', incorrectAnswersSectionY);
    
    // Filter incorrect answers
    const incorrectAnswers = questions.filter(q => {
      if (!q.userAnswer) return false;
      
      // Verificar si todas las respuestas del usuario están en las correctas
      const allUserAnswersAreCorrect = q.userAnswer.every(answer => 
        q.correctAnswer.includes(answer)
      );
      
      // Verificar si todas las respuestas correctas están seleccionadas
      const allCorrectAnswersSelected = q.correctAnswer.every(answer => 
        q.userAnswer?.includes(answer) || false
      );
      
      // La respuesta es incorrecta si alguna de las condiciones no se cumple
      return !(allUserAnswersAreCorrect && allCorrectAnswersSelected);
    });
    
    if (incorrectAnswers.length === 0) {
      drawRoundedRect(doc, 10, incorrectAnswersSectionY + 10, 190, 20, 4, '#DCFCE7');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#166534');
      doc.text('All answers were correct!', 105, incorrectAnswersSectionY + 22, { align: 'center' });
      doc.setTextColor('#000000');
      doc.setFont('helvetica', 'normal');
    } else {
      // Add incorrect answers as text
      doc.setFontSize(12);
      let yPosition = incorrectAnswersSectionY + 15;
      
      incorrectAnswers.forEach((q, index) => {
        // Calculate dynamic box height based on content
        let contentHeight = 0;
        
        // Estimate question text height
        const questionLines = doc.splitTextToSize(q.question, 180);
        contentHeight += questionLines.length * 6;
        
        // Estimate user answer height
        const userAnswerText = q.userAnswer ? q.userAnswer.join(', ') : 'No answer';
        const userAnswerLines = doc.splitTextToSize(userAnswerText, 120);
        contentHeight += userAnswerLines.length * 6;
        
        // Estimate correct answer height
        const correctAnswerText = q.correctAnswer.join(', ');
        const correctAnswerLines = doc.splitTextToSize(correctAnswerText, 120);
        contentHeight += correctAnswerLines.length * 6;
        
        // Calculate box height with padding (minimum 40px)
        const boxHeight = Math.max(40, contentHeight + 20);
        
        // Draw the question box with dynamic height
        drawRoundedRect(doc, 10, yPosition - 5, 190, boxHeight, 4, index % 2 === 0 ? '#F3F4F6' : '#FFFFFF');
        
        // Add question number
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. Question:`, 14, yPosition);
        yPosition += 6;
        
        // Add question text (with word wrap)
        doc.setFont('helvetica', 'normal');
        doc.text(questionLines, 20, yPosition);
        yPosition += questionLines.length * 6 + 4;
        
        // Add user's answer with proper wrapping
        doc.setFont('helvetica', 'bold');
        doc.setTextColor('#991B1B'); // Red for incorrect answer
        doc.text('Your answer:', 20, yPosition);
        doc.setFont('helvetica', 'normal');
        
        // Handle multi-line user answers
        doc.text(userAnswerLines, 70, yPosition);
        yPosition += userAnswerLines.length * 6;
        
        // Add correct answer with proper wrapping
        doc.setFont('helvetica', 'bold');
        doc.setTextColor('#166534'); // Green for correct answer
        doc.text('Correct answer:', 20, yPosition);
        doc.setFont('helvetica', 'normal');
        
        // Handle multi-line correct answers
        doc.text(correctAnswerLines, 70, yPosition);
        doc.setTextColor('#000000'); // Reset text color
        yPosition += correctAnswerLines.length * 6 + 10;
        
        // Add a new page if we're running out of space
        // Use a lower threshold to ensure we have enough space for the next question
        if (yPosition > 250 && index < incorrectAnswers.length - 1) {
          doc.addPage();
          yPosition = 20;
        }
      });
    }
    
    return doc;
  } catch (error) {
    console.error('Error in PDF generation:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Generate and download a PDF summary of the test
 * @param userData User data including name, email, and task ID
 * @param questions Array of questions with answers
 * @param score The user's score
 * @param percentage The percentage score
 * @returns void
 */
export const downloadTestSummaryPDF = (
  userData: UserData,
  questions: Question[],
  score: number,
  percentage: number
): void => {
  try {
    const doc = generateTestSummaryPDF(userData, questions, score, percentage);
    doc.save(`magellan-test-summary-${userData.name.replace(/\s+/g, '-')}.pdf`);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

/**
 * Generates a PDF summary of the test results without downloading it
 * This is used for uploading to ClickUp
 * @param userData User data including name, email, and task ID
 * @param questions Array of questions with answers
 * @param score The user's score
 * @param percentage The percentage score
 * @returns The generated PDF object
 */
export const generatePDFForUpload = (
  userData: UserData,
  questions: Question[],
  score: number,
  percentage: number
): jsPDF => {
  return generateTestSummaryPDF(userData, questions, score, percentage);
};
