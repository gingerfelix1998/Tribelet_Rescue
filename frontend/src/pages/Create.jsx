// src/pages/Create.jsx
import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import IntroStep from "../steps/IntroStep";
import PromptStep from "../steps/PromptStep";
import NameStep from "../steps/NameStep";
import SummaryStep from "../steps/SummaryStep";
import LogoStep from "../steps/LogoStep";
import CompleteStep from "../steps/CompleteStep";

const Create = () => {
  const { username } = useContext(UserContext);
  const [step, setStep] = useState(1);

  const [prompt, setPrompt] = useState("");
  const [teamOptions, setTeamOptions] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [customName, setCustomName] = useState("");
  const [summary, setSummary] = useState("");
  const [logoOptions, setLogoOptions] = useState([]);
  const [selectedLogo, setSelectedLogo] = useState("");

  const teamName = customName || selectedName || "TEAM NAME";
  const progressPercentage = ((step - 1) / 5) * 100;

  // 👇 If not signed in, block access
  if (!username) {
    return (
      <div className="text-center text-white mt-24">
        <h2 className="text-2xl font-bold mb-4">🔒 You must be signed in to create a team</h2>
        <p className="text-gray-400 mb-6">Please log in or create an account to continue.</p>
        <Link
          to="/account"
          className="inline-block bg-[#A461F9] text-white px-6 py-3 rounded-xl hover:bg-[#934ff2] transition"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <IntroStep onNext={() => setStep(2)} />;
      case 2:
        return (
          <PromptStep
            prompt={prompt}
            setPrompt={setPrompt}
            setTeamOptions={setTeamOptions}
            onNext={() => setStep(3)}
          />
        );
      case 3:
        return (
          <NameStep
            teamOptions={teamOptions}
            selectedName={selectedName}
            setSelectedName={setSelectedName}
            customName={customName}
            setCustomName={setCustomName}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        );
      case 4:
        return (
          <SummaryStep
            prompt={prompt}
            summary={summary}
            setSummary={setSummary}
            onNext={() => setStep(5)}
            onBack={() => setStep(3)}
          />
        );
      case 5:
        return (
          <LogoStep
            prompt={prompt}
            teamName={teamName}
            setLogoOptions={setLogoOptions}
            logoOptions={logoOptions}
            setSelectedLogo={setSelectedLogo}
            selectedLogo={selectedLogo}
            onBack={() => setStep(4)}
            onNext={() => setStep(6)}
          />
        );
      case 6:
        return (
          <CompleteStep
            onBack={() => setStep(5)}
            teamName={teamName}
            summary={summary}
            logoUrl={selectedLogo}
          />
        );        
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left: Profile Card */}
      <div className="relative bg-black text-white rounded-3xl shadow-xl p-6 flex flex-col justify-between h-full min-h-[550px] transition-all duration-500 ease-in-out">
        <div className="flex flex-col items-center">
          <div className={`transition-all duration-500 ease-in-out ${
            selectedLogo ? "scale-100" : "scale-95 opacity-50"
          }`}>
            {selectedLogo ? (
              <img
                src={`data:image/png;base64,${selectedLogo}`}
                alt="Logo"
                className="w-32 h-32 object-contain rounded-xl border-2 border-white shadow mb-4"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 mb-4 border-2 border-gray-500">
                Logo
              </div>
            )}
          </div>
          <h2 className={`text-xl font-bold tracking-widest uppercase mb-2 text-center transition-opacity duration-500 ${
            teamName !== "TEAM NAME" ? "opacity-100" : "opacity-50"
          }`}>{teamName}</h2>
          <p className={`text-xs text-gray-300 text-center max-w-xs transition-opacity duration-500 ${
            summary ? "opacity-100" : "opacity-50"
          }`}>
            {summary || "Your team sponsorship pitch will appear here."}
          </p>
        </div>
        <div className="absolute bottom-4 right-4 text-yellow-500 text-xl font-extrabold">2025</div>
      </div>

      {/* Right: Step Content */}
      <div className="bg-gray-50 shadow-xl rounded-3xl p-8 min-h-[550px] transition-all duration-500">
        {step < 6 && (
          <>
            <div className="text-sm text-center font-medium text-gray-500 mb-2">Step {step} of 5</div>
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-[#A461F9] h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </>
        )}
        <div className="transition-opacity duration-500 ease-in-out">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default Create;
