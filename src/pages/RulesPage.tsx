import React from 'react';
import type { RulesPageProps } from '../types/testTypes';

const RulesPage: React.FC<RulesPageProps> = ({ onContinue }) => {
  return (
    <div className="min-h-screen bg-white pb-24">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">Magellan Written Test - Official Rules</h1>
        </div>
      </header>

      <main>
        <div className="max-w-4xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-700 font-medium">
                  Note: The following are the official rules that will apply during the actual test. 
                  This current version is for training purposes only.
                </p>
              </div>
              
              <h2 className="text-xl font-semibold mb-4 text-gray-800">FSE Testing</h2>
              <p className="mb-4 text-gray-700">Testing is done within Charter's UAT testing database.</p>
              <p className="mb-4 text-gray-700">The test is a small drafting area that includes aerial, underground, coax, fiber and boundaries. There will be fiber splicing, including couplers, that is read from splice documentations. Ensuring routines are understood and ran are part of the score.</p>
              <p className="mb-4 text-gray-700">General drafting neatness is also checked.</p>
              
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Rules and Guidelines for the FSE Exam:</h2>
              
              <h3 className="text-lg font-medium mb-2 text-gray-800">General Rule Requirements:</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>
                  <strong>Test Section 1:</strong>
                  <ul className="list-disc pl-6 mt-1">
                    <li>1 hour test time max written portion</li>
                    <li>100 Multiple choice questions</li>
                  </ul>
                </li>
                <li>
                  <strong>Test Section 2:</strong>
                  <ul className="list-disc pl-6 mt-1">
                    <li>3 hour test time max drafting portion</li>
                    <li>Verbal Questions at end of drafting for any clarity</li>
                  </ul>
                </li>
                <li>Use Teams properly</li>
                <li>Complete test in testing room(virtual) to which you are assigned on teams.</li>
                <li>Testing space is private and free from noise or distractions, cleared of any preparation materials or unauthorized items. No outside help during this test.</li>
                <li>
                  <strong>Uninterrupted recording of entire screen</strong>
                  <ul className="list-disc pl-6 mt-1">
                    <li>Do not begin drafting until recording has been started</li>
                    <li>Cameras and microphones required to be on throughout the assessment</li>
                  </ul>
                </li>
                <li>No breaks will be allowed (exceptions being for an emergency)</li>
                <li>General and drafting questions asked during the assessment are allowed but may result in a point deduction</li>
                <li>Any form of communication limitations (microphone, language barrier, clarification, etc.) please inform the proctor before the test date.</li>
              </ul>
              
              <p className="mb-4 font-bold text-red-600">*Violation of any these rules will be flagged during your test by the web proctor, and you may fail your test. Severity of violation may result in a ban from testing. One retake is allowed for both sections.</p>
              
              <h3 className="text-lg font-medium mb-2 text-gray-800">Items that are covered/tested for:</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
                <li>
                  <strong>Creating a Workspace</strong>
                  <ul className="list-disc pl-6 mt-1">
                    <li>Naming</li>
                    <li>Putting into Design</li>
                    <li>Toolbars</li>
                    <li>Finding area to draft in</li>
                    <li>Correct region</li>
                  </ul>
                </li>
                <li>
                  <strong>Landbase</strong>
                  <ul className="list-disc pl-6 mt-1">
                    <li>Adding road edge</li>
                    <li>Misc lines</li>
                    <li>Street center lines</li>
                  </ul>
                </li>
                <li>
                  <strong>Support</strong>
                  <ul className="list-disc pl-6 mt-1">
                    <li>Placement of support structures</li>
                    <li>Adding and reconnecting house counts to structures</li>
                    <li>Editing structure types and counts</li>
                    <li>Adding risers</li>
                    <li>Drafting spans</li>
                    <li>Editing spans</li>
                    <li>Other support related functions</li>
                  </ul>
                </li>
                <li>
                  <strong>Addressing – residential and commercial</strong>
                  <ul className="list-disc pl-6 mt-1">
                    <li>SDU</li>
                    <li>MDU</li>
                  </ul>
                </li>
                <li>
                  <strong>RF Drafting</strong>
                  <ul className="list-disc pl-6 mt-1">
                    <li>Setting Spec file</li>
                    <li>Placing Node</li>
                    <li>Adding Actives
                      <ul className="list-disc pl-6">
                        <li>Internal components of actives</li>
                      </ul>
                    </li>
                    <li>Adding passives
                      <ul className="list-disc pl-6">
                        <li>Splices</li>
                        <li>Splitters</li>
                        <li>Terminators</li>
                      </ul>
                    </li>
                    <li>Adding Taps</li>
                    <li>Node Boundary</li>
                    <li>Analyzing Node</li>
                    <li>Other coax related features</li>
                    <li>Understand RF levels</li>
                  </ul>
                </li>
                <li>
                  <strong>Powering</strong>
                  <ul className="list-disc pl-6 mt-1">
                    <li>Place</li>
                    <li>Connecting power supply to power inserter</li>
                    <li>Repower</li>
                    <li>Understand Powering</li>
                  </ul>
                </li>
                <li>
                  <strong>Fiber</strong>
                  <ul className="list-disc pl-6 mt-1">
                    <li>Placing fiber
                      <ul className="list-disc pl-6">
                        <li>Naming</li>
                        <li>Sheath size</li>
                      </ul>
                    </li>
                    <li>Splicing
                      <ul className="list-disc pl-6">
                        <li>Muxing</li>
                      </ul>
                    </li>
                    <li>Placing termination points</li>
                    <li>Create Termination Panel</li>
                    <li>Trace</li>
                    <li>Circuit manage</li>
                    <li>Other Fiber related material</li>
                  </ul>
                </li>
                <li>
                  <strong>Reporting</strong>
                  <ul className="list-disc pl-6 mt-1">
                    <li>Screen Capture</li>
                    <li>PDF</li>
                    <li>HAF</li>
                    <li>Splice</li>
                    <li>BOM</li>
                    <li>Other</li>
                  </ul>
                </li>
                <li>
                  <strong>Overall</strong>
                  <ul className="list-disc pl-6 mt-1">
                    <li>Changing/moving features</li>
                    <li>Deleting properly</li>
                    <li>Disconnecting/ reconnecting items</li>
                    <li>Inserting equipment</li>
                    <li>Workspace status changes</li>
                    <li>Search and load</li>
                    <li>Using Fence</li>
                    <li>Proper tool usage</li>
                  </ul>
                </li>
              </ul>
              
              <p className="mb-2 text-gray-700">The test is to ensure there is no corruption to the database. It combines drafting and verbal questions.</p>
              <p className="mb-2 text-gray-700">Test and other related material are subject to change per the CCI testing department's discretion.</p>
              <p className="mb-4 font-semibold text-gray-700">Study how magellan works, do not study for the test. Drafting efficiency and design clarity are also graded.</p>
              
              <p className="mb-6 text-gray-700">Any and all questions please reach out to your CCI contact and technicaltraining@ccissytems.com</p>
              
              <div className="mt-8">
                <button
                  onClick={onContinue}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Continue to Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RulesPage;
