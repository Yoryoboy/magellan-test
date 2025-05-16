import React from 'react';

interface CompletionMessageProps {
  isVisible: boolean;
}

const CompletionMessage: React.FC<CompletionMessageProps> = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">Test Completed</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Your test has been successfully submitted. You will receive feedback soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionMessage;
