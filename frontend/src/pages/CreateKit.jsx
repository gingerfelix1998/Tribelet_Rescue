// src/pages/CreateKit.jsx
import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import KitTypeStep from "../kit_steps/kitTypeStep";
import PoloCustomizationStep from "../kit_steps/poloCustomisation";
import ConfirmOrderStep from "../kit_steps/poloOrder";

const CreateKit = () => {
  const { username } = useContext(UserContext);
  const [step, setStep] = useState(1);

  // Kit customization state
  const [kitType, setKitType] = useState(""); // "polo" or "tshirt"
  const [teamwearColor, setTeamwearColor] = useState("#FFFFFF");
  const [emblemColor, setEmblemColor] = useState("#000000");
  const [teamLogo, setTeamLogo] = useState("");
  const [logoScale, setLogoScale] = useState(100);
  const [frontPrint, setFrontPrint] = useState({
    enabled: false,
    text: "",
    font: "Arial",
    scale: 50,
    color: "#000000"
  });
  const [backPrint, setBackPrint] = useState({
    enabled: false,
    text: "",
    font: "Arial", 
    scale: 50,
    color: "#000000"
  });
  const [teamName, setTeamName] = useState("");
  const [designName, setDesignName] = useState("");

  const progressPercentage = ((step - 1) / 2) * 100; // 3 steps total, so step 1 = 0%, step 2 = 50%, step 3 = 100%

  // Block access if not signed in
  if (!username) {
    return (
      <div className="text-center text-white mt-24">
        <h2 className="text-2xl font-bold mb-4">🔒 You must be signed in to customize a kit</h2>
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
        return (
          <KitTypeStep
            kitType={kitType}
            setKitType={setKitType}
            onNext={() => setStep(2)}
          />
        );
      case 2:
        return (
          <PoloCustomizationStep
            teamwearColor={teamwearColor}
            setTeamwearColor={setTeamwearColor}
            emblemColor={emblemColor}
            setEmblemColor={setEmblemColor}
            teamLogo={teamLogo}
            setTeamLogo={setTeamLogo}
            logoScale={logoScale}
            setLogoScale={setLogoScale}
            frontPrint={frontPrint}
            setFrontPrint={setFrontPrint}
            backPrint={backPrint}
            setBackPrint={setBackPrint}
            teamName={teamName}
            setTeamName={setTeamName}
            designName={designName}
            setDesignName={setDesignName}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        );
      case 3:
        return (
          <ConfirmOrderStep
            kitType={kitType}
            teamwearColor={teamwearColor}
            emblemColor={emblemColor}
            teamLogo={teamLogo}
            frontPrint={frontPrint}
            backPrint={backPrint}
            teamName={teamName}
            designName={designName}
            onBack={() => setStep(2)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Create Custom Kit</h1>
        <p className="text-gray-400">Design your team's perfect look</p>
      </div>

      {step < 3 && (
        <>
          <div className="text-sm text-center font-medium text-gray-400 mb-2">
            Step {step} of 3
          </div>
          <div className="mb-8 max-w-md mx-auto">
            <div className="w-full bg-gray-700 rounded-full h-2.5">
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
  );
};

export default CreateKit;
