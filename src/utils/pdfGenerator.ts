import { jsPDF } from 'jspdf';
import type { UserData } from '../types/testTypes';
import type { Question } from '../types/question';

/**
 * Generate a PDF summary of the test results
 * @param userData - User data including name, email, etc.
 * @param questions - Array of questions with user answers
 * @param score - Total score achieved
 * @param percentage - Percentage score
 * @returns The generated PDF document
 */
export const generateTestSummaryPDF = (
  userData: UserData,
  questions: Question[],
  score: number,
  percentage: number
): jsPDF => {
  try {
    const doc = new jsPDF();
    const totalPoints = questions.reduce((total, q) => total + q.points, 0);
    
    // Add title
    doc.setFontSize(20);
    doc.text('Magellan Written Test - Results Summary', 14, 22);
    
    // Add user information
    doc.setFontSize(12);
    doc.text(`Name: ${userData.name}`, 14, 35);
    doc.text(`Email: ${userData.email}`, 14, 42);
    doc.text(`Test ID: ${userData.taskId || 'N/A'}`, 14, 49);
    doc.text(`Test Date: ${new Date(userData.startTime).toLocaleString()}`, 14, 56);
    doc.text(`Submission Date: ${new Date().toLocaleString()}`, 14, 63);
    
    // Add score information
    doc.setFontSize(14);
    doc.text('Test Results', 14, 75);
    doc.setFontSize(12);
    doc.text(`Score: ${score} out of ${totalPoints} points`, 14, 82);
    doc.text(`Percentage: ${percentage.toFixed(2)}%`, 14, 89);
    
    // Add incorrect answers section
    doc.setFontSize(14);
    doc.text('Incorrect Answers', 14, 105);
    
    // Filter incorrect answers
    const incorrectAnswers = questions.filter(q => 
      q.userAnswer !== null && q.userAnswer !== q.correctAnswer
    );
    
    if (incorrectAnswers.length === 0) {
      doc.setFontSize(12);
      doc.text('All answers were correct!', 14, 112);
    } else {
      // Add incorrect answers as text
      doc.setFontSize(12);
      let yPosition = 112;
      
      incorrectAnswers.forEach((q, index) => {
        // Add question number
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. Question:`, 14, yPosition);
        yPosition += 6;
        
        // Add question text (with word wrap)
        doc.setFont('helvetica', 'normal');
        const questionLines = doc.splitTextToSize(q.question, 180);
        doc.text(questionLines, 20, yPosition);
        yPosition += questionLines.length * 6 + 4;
        
        // Add user's answer
        doc.setFont('helvetica', 'bold');
        doc.text('Your answer:', 20, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(q.userAnswer || 'No answer', 70, yPosition);
        yPosition += 6;
        
        // Add correct answer
        doc.setFont('helvetica', 'bold');
        doc.text('Correct answer:', 20, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(q.correctAnswer, 70, yPosition);
        yPosition += 12;
        
        // Add a new page if we're running out of space
        if (yPosition > 270 && index < incorrectAnswers.length - 1) {
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
