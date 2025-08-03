// src/kit_steps/KitTypeStep.jsx
import React from "react";

const KitTypeStep = ({ kitType, setKitType, onNext }) => {
  const handleNext = () => {
    if (kitType) {
      onNext();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Choose Your Kit Type</h2>
        <p className="text-gray-400">Select the garment you'd like to customize</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* T-Shirt Option */}
        <div
          className={`relative bg-gray-800 rounded-2xl p-8 cursor-pointer transition-all duration-300 border-2 ${
            kitType === "tshirt"
              ? "border-[#A461F9] bg-gray-700 transform scale-105"
              : "border-gray-600 hover:border-gray-500"
          }`}
          onClick={() => setKitType("tshirt")}
        >
          <div className="text-center">
            {/* T-Shirt Icon/Illustration */}
            <div className="w-32 h-32 mx-auto mb-4 bg-gray-600 rounded-lg flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-20 h-20 text-gray-300"
                fill="currentColor"
              >
                <path d="M25 35 L25 25 L35 15 L65 15 L75 25 L75 35 L85 40 L85 85 L15 85 L15 40 Z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">T-Shirt</h3>
            <p className="text-gray-400 text-sm">Classic casual fit</p>
            {kitType === "tshirt" && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-[#A461F9] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Polo Shirt Option */}
        <div
          className={`relative bg-gray-800 rounded-2xl p-8 cursor-pointer transition-all duration-300 border-2 ${
            kitType === "polo"
              ? "border-[#A461F9] bg-gray-700 transform scale-105"
              : "border-gray-600 hover:border-gray-500"
          }`}
          onClick={() => setKitType("polo")}
        >
          <div className="text-center">
            {/* Polo Shirt Icon/Illustration */}
            <div className="w-32 h-32 mx-auto mb-4 bg-gray-600 rounded-lg flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-20 h-20 text-gray-300"
                fill="currentColor"
              >
                <path d="M25 35 L25 25 L35 15 L65 15 L75 25 L75 35 L85 40 L85 85 L15 85 L15 40 Z" />
                <rect x="40" y="15" width="20" height="15" fill="currentColor" />
                <polygon points="45,20 55,20 52,25 48,25" fill="currentColor" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Polo Shirt</h3>
            <p className="text-gray-400 text-sm">Professional collar style</p>
            {kitType === "polo" && (
              <div className="absolute top-4 right-4">
                <div className="w-6 h-6 bg-[#A461F9] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coming Soon Notice for T-Shirt */}
      {kitType === "tshirt" && (
        <div className="text-center mb-6">
          <div className="bg-yellow-900 border border-yellow-600 text-yellow-200 px-4 py-3 rounded-lg inline-block">
            <p className="text-sm">T-Shirt customization coming soon! For now, please select Polo Shirt.</p>
          </div>
        </div>
      )}

      {/* Next Button */}
      <div className="text-center">
        <button
          onClick={handleNext}
          disabled={!kitType || kitType === "tshirt"}
          className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
            kitType && kitType !== "tshirt"
              ? "bg-[#A461F9] text-white hover:bg-[#934ff2] transform hover:scale-105"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          {kitType === "tshirt" ? "Coming Soon" : "Continue to Customization"}
        </button>
      </div>
    </div>
  );
};

export default KitTypeStep;