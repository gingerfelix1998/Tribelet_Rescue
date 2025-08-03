
// src/kit_steps/PoloCustomizationStep.jsx
import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Import polo shirt images - front views
const poloWhiteFront = require('../assets/Polos/TR505_White_FRONTo.png');
const poloRedFront = require('../assets/Polos/TR505_RED_FRONTo.png');
const poloNavyFront = require('../assets/Polos/TR505_FrenchNavy_FRONTo.png');
const poloBlackFront = require('../assets/Polos/TR505_Black_FRONTo.png');

// Import polo shirt images - back views
const poloWhiteBack = require('../assets/Polos/TR505_White_BACKo.png');
const poloRedBack = require('../assets/Polos/TR505_FireRed_BACKo.png');
const poloNavyBack = require('../assets/Polos/TR505_FrenchNavy_BACKo.png');
const poloBlackBack = require('../assets/Polos/TR505_Black_BACKo.png');

// Import Tribelet logos
const tribeletLogoWhite = require('../assets/Polos/white_kit_logo.png');
const tribeletLogoBlack = require('../assets/Polos/black_kit_logo.png');

const apiUrl = process.env.REACT_APP_API_URL;

const PoloCustomizationStep = ({
  teamwearColor,
  setTeamwearColor,
  emblemColor,
  setEmblemColor,
  teamLogo,
  setTeamLogo,
  logoScale,
  setLogoScale,
  frontPrint,
  setFrontPrint,
  backPrint,
  setBackPrint,
  teamName,
  setTeamName,
  designName,
  setDesignName,
  onNext,
  onBack
}) => {
  const logoUploadRef = useRef(null);
  const frontImageUploadRef = useRef(null);
  const backImageUploadRef = useRef(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [frontImage, setFrontImage] = useState("");
  const [frontImageScale, setFrontImageScale] = useState(100);
  const [useFrontTeamLogo, setUseFrontTeamLogo] = useState(false);
  const [backImage, setBackImage] = useState("");
  const [backImageScale, setBackImageScale] = useState(100);
  const [useBackTeamLogo, setUseBackTeamLogo] = useState(false);
  const [showFrontImage, setShowFrontImage] = useState(true);
  const [showBackImage, setShowBackImage] = useState(true);
  const [manualEmblemColor, setManualEmblemColor] = useState(false);
  const email = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  // Fetch user's teams
  useEffect(() => {
    if (!email) {
      setLoadingTeams(false);
      return;
    }

    const fetchTeams = async () => {
      try {
        const res = await fetch(`${apiUrl}/teams/by-user?email=${email}`);
        const data = await res.json();
        setTeams(data.teams || []);
      } catch (err) {
        console.error("Failed to fetch teams:", err);
      } finally {
        setLoadingTeams(false);
      }
    };

    fetchTeams();
  }, [email]);

  // Handle team selection
  const handleTeamSelect = (value) => {
    if (value === "create-new") {
      // Show confirmation dialog
      setShowConfirmDialog(true);
      // Reset the select to previous value
      return;
    }
    
    setSelectedTeam(value);
    
    if (value === "no-team") {
      // Clear team-related fields
      setTeamLogo("");
      setBackPrint(prev => ({
        ...prev,
        enabled: false,
        text: ""
      }));
      setUseFrontTeamLogo(false);
      setUseBackTeamLogo(false);
      return;
    }
    
    const team = teams.find(t => t.team_id === value);
    if (team) {
      // Set the team logo if available
      if (team.logo_url) {
        setTeamLogo(team.logo_url);
        // Automatically use team logo for front image when team is selected
        setUseFrontTeamLogo(true);
      }
      // Automatically enable back print and set team name
      setBackPrint(prev => ({
        ...prev,
        enabled: true,
        text: team.team_name.toUpperCase()
      }));
    }
  };

  const handleConfirmNavigate = () => {
    setShowConfirmDialog(false);
    navigate("/create");
  };

  const handleCancelNavigate = () => {
    setShowConfirmDialog(false);
  };

  // Function to get the correct polo front image based on selected color
  const getPoloImage = () => {
    // Map colors to imported front view image files
    const colorImageMap = {
      '#FFFFFF': poloWhiteFront,    // White polo front
      '#DC2626': poloRedFront,      // Red polo front
      '#1E3A8A': poloNavyFront,     // Navy polo front
      '#000000': poloBlackFront     // Black polo front
    };
    
    // Return the front image for the selected color, or default to white
    return colorImageMap[teamwearColor] || poloWhiteFront;
  };

  // Function to get the back view polo image
  const getPoloImageBack = () => {
    // Map colors to back view image files
    const colorImageMap = {
      '#FFFFFF': poloWhiteBack,    // White polo back
      '#DC2626': poloRedBack,      // Red polo back
      '#1E3A8A': poloNavyBack,     // Navy polo back
      '#000000': poloBlackBack     // Black polo back
    };
    
    // Return the back image for the selected color, or default to white
    return colorImageMap[teamwearColor] || poloWhiteBack;
  };

  // Color palette options - only available colors
  const colorOptions = [
    "#FFFFFF", // White
    "#DC2626", // Red
    "#1E3A8A", // Navy
    "#000000"  // Black
  ];

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Check image dimensions (max 1000x1000)
          if (img.width > 1000 || img.height > 1000) {
            alert('Image dimensions must not exceed 1000x1000 pixels');
            return;
          }
          setTeamLogo(e.target.result);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFrontImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Check image dimensions (max 1000x1000)
          if (img.width > 1000 || img.height > 1000) {
            alert('Image dimensions must not exceed 1000x1000 pixels');
            return;
          }
          setFrontImage(e.target.result);
          setUseFrontTeamLogo(false); // Uncheck when custom image is uploaded
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Check image dimensions (max 1000x1000)
          if (img.width > 1000 || img.height > 1000) {
            alert('Image dimensions must not exceed 1000x1000 pixels');
            return;
          }
          setBackImage(e.target.result);
          setUseBackTeamLogo(false); // Uncheck when custom image is uploaded
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const updateBackPrint = (field, value) => {
    setBackPrint(prev => ({ ...prev, [field]: value }));
  };

  // Function to get contrasting text color based on shirt color
  const getContrastingTextColor = () => {
    switch(teamwearColor) {
      case '#FFFFFF': // White shirt
        return '#000000'; // Black text
      case '#DC2626': // Red shirt
        return '#FFFFFF'; // White text
      case '#1E3A8A': // Navy shirt
        return '#FFFFFF'; // White text
      case '#000000': // Black shirt
        return '#FFFFFF'; // White text
      default:
        return '#000000'; // Default to black text
    }
  };

  // Function to get the correct Tribelet logo based on shirt color or manual selection
  const getTribeletLogo = () => {
    // If manually selected, use the selected emblem color
    if (manualEmblemColor) {
      return emblemColor === '#FFFFFF' ? tribeletLogoWhite : tribeletLogoBlack;
    }
    
    // Otherwise, auto-select based on shirt color
    switch(teamwearColor) {
      case '#FFFFFF': // White shirt - use black logo
        return tribeletLogoBlack;
      case '#DC2626': // Red shirt - use white logo
        return tribeletLogoWhite;
      case '#1E3A8A': // Navy shirt - use white logo
        return tribeletLogoWhite;
      case '#000000': // Black shirt - use white logo
        return tribeletLogoWhite;
      default:
        return tribeletLogoBlack; // Default to black logo
    }
  };

  // Get the actual image to display for front/back
  const getFrontImageToDisplay = () => {
    if (useFrontTeamLogo && teamLogo) return teamLogo;
    return frontImage;
  };

  const getBackImageToDisplay = () => {
    if (useBackTeamLogo && teamLogo) return teamLogo;
    return backImage;
  };

  return (
    <>
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Leave Kit Customization?</h3>
            <p className="text-gray-600 mb-6">
              You will lose all progress on your current kit design if you navigate to create a new team. Are you sure you want to proceed?
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={handleCancelNavigate}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmNavigate}
                className="px-6 py-2 bg-[#A461F9] text-white rounded-lg hover:bg-[#934ff2] transition font-medium"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 h-fit">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Customize Your Polo</h3>
          
          {/* Team Selection Dropdown */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Select Your Team</label>
            {loadingTeams ? (
              <p className="text-sm text-gray-500">Loading teams...</p>
            ) : (
              <select
                value={selectedTeam}
                onChange={(e) => handleTeamSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a team...</option>
                <option value="no-team">No Team</option>
                {teams.map((team) => (
                  <option key={team.team_id} value={team.team_id}>
                    {team.team_name}
                  </option>
                ))}
                <option value="create-new" className="font-semibold text-[#A461F9]">
                  + Create New Team
                </option>
              </select>
            )}
          </div>

          {/* Teamwear Color */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Teamwear colour</label>
              <div className="flex gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    onClick={() => setTeamwearColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      teamwearColor === color ? "border-blue-500 scale-110" : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Tribelet Emblem Color */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Tribelet emblem colour</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEmblemColor("#FFFFFF");
                    setManualEmblemColor(true);
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    emblemColor === "#FFFFFF" ? "border-blue-500 scale-110" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: "#FFFFFF" }}
                />
                <button
                  onClick={() => {
                    setEmblemColor("#000000");
                    setManualEmblemColor(true);
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    emblemColor === "#000000" ? "border-blue-500 scale-110" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: "#000000" }}
                />
              </div>
            </div>
          </div>

          {/* Front and Back Images - Side by Side */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Front Image */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="showFrontImage"
                  checked={showFrontImage}
                  onChange={(e) => setShowFrontImage(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="showFrontImage" className="text-sm font-medium text-gray-700">Front Image</label>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="useFrontTeamLogo"
                  checked={useFrontTeamLogo}
                  onChange={(e) => setUseFrontTeamLogo(e.target.checked)}
                  disabled={!teamLogo || !showFrontImage}
                  className="w-3 h-3 text-blue-600"
                />
                <label htmlFor="useFrontTeamLogo" className="text-xs text-gray-600">Use team logo</label>
              </div>
              <div className={`border-2 border-dashed border-gray-300 rounded-lg p-3 text-center ${!showFrontImage ? 'opacity-50' : ''}`}>
                {getFrontImageToDisplay() || (!useFrontTeamLogo && teamLogo) ? (
                  <div className="space-y-2">
                    {getFrontImageToDisplay() ? (
                      <img 
                        src={getFrontImageToDisplay().startsWith('data:') || getFrontImageToDisplay().startsWith('http') ? getFrontImageToDisplay() : `data:image/png;base64,${getFrontImageToDisplay()}`} 
                        alt="Front Image" 
                        className="w-12 h-12 object-contain mx-auto" 
                      />
                    ) : (
                      <div className="w-12 h-12 mx-auto flex items-center justify-center text-gray-400">
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                    {!useFrontTeamLogo ? (
                      <>
                        <button
                          onClick={() => frontImageUploadRef.current?.click()}
                          className="text-blue-600 text-xs hover:underline"
                          disabled={!showFrontImage}
                        >
                          {frontImage ? 'Change' : 'Upload'}
                        </button>
                        <p className="text-xs text-gray-400">Max: 1000x1000px, 2MB</p>
                      </>
                    ) : (
                      teamLogo ? (
                        <span className="text-xs text-gray-600">Using logo</span>
                      ) : (
                        <>
                          <button
                            onClick={() => logoUploadRef.current?.click()}
                            className="text-blue-600 text-xs hover:underline"
                            disabled={!showFrontImage}
                          >
                            Upload logo
                          </button>
                          <p className="text-xs text-gray-400">Max: 1000x1000px, 2MB</p>
                        </>
                      )
                    )}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => frontImageUploadRef.current?.click()}
                      className="text-blue-600 text-xs hover:underline"
                      disabled={useFrontTeamLogo || !showFrontImage}
                    >
                      Upload image
                    </button>
                    <p className="text-xs text-gray-400 mt-1">Max: 1000x1000px, 2MB</p>
                  </>
                )}
              </div>
              {getFrontImageToDisplay() && showFrontImage && (
                <div className="mt-2">
                  <label className="block text-xs text-gray-600 mb-1">Scale: {frontImageScale}%</label>
                  <input
                    type="range"
                    min="25"
                    max="100"
                    value={frontImageScale}
                    onChange={(e) => setFrontImageScale(parseInt(e.target.value))}
                    className="w-full h-1"
                  />
                </div>
              )}
              <input
                ref={frontImageUploadRef}
                type="file"
                accept="image/*"
                onChange={handleFrontImageUpload}
                className="hidden"
              />
            </div>

            {/* Back Image */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="showBackImage"
                  checked={showBackImage}
                  onChange={(e) => setShowBackImage(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="showBackImage" className="text-sm font-medium text-gray-700">Back Image</label>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="useBackTeamLogo"
                  checked={useBackTeamLogo}
                  onChange={(e) => setUseBackTeamLogo(e.target.checked)}
                  disabled={!teamLogo || !showBackImage}
                  className="w-3 h-3 text-blue-600"
                />
                <label htmlFor="useBackTeamLogo" className="text-xs text-gray-600">Use team logo</label>
              </div>
              <div className={`border-2 border-dashed border-gray-300 rounded-lg p-3 text-center ${!showBackImage ? 'opacity-50' : ''}`}>
                {getBackImageToDisplay() || (!useBackTeamLogo && teamLogo) ? (
                  <div className="space-y-2">
                    {getBackImageToDisplay() ? (
                      <img 
                        src={getBackImageToDisplay().startsWith('data:') || getBackImageToDisplay().startsWith('http') ? getBackImageToDisplay() : `data:image/png;base64,${getBackImageToDisplay()}`} 
                        alt="Back Image" 
                        className="w-12 h-12 object-contain mx-auto" 
                      />
                    ) : (
                      <div className="w-12 h-12 mx-auto flex items-center justify-center text-gray-400">
                        <span className="text-xs">No image</span>
                      </div>
                    )}
                    {!useBackTeamLogo ? (
                      <>
                        <button
                          onClick={() => backImageUploadRef.current?.click()}
                          className="text-blue-600 text-xs hover:underline"
                          disabled={!showBackImage}
                        >
                          {backImage ? 'Change' : 'Upload'}
                        </button>
                        <p className="text-xs text-gray-400">Max: 1000x1000px, 2MB</p>
                      </>
                    ) : (
                      <span className="text-xs text-gray-600">Using logo</span>
                    )}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => backImageUploadRef.current?.click()}
                      className="text-blue-600 text-xs hover:underline"
                      disabled={useBackTeamLogo || !showBackImage}
                    >
                      Upload image
                    </button>
                    <p className="text-xs text-gray-400 mt-1">Max: 1000x1000px, 2MB</p>
                  </>
                )}
              </div>
              {getBackImageToDisplay() && showBackImage && (
                <div className="mt-2">
                  <label className="block text-xs text-gray-600 mb-1">Scale: {backImageScale}%</label>
                  <input
                    type="range"
                    min="25"
                    max="150"
                    value={backImageScale}
                    onChange={(e) => setBackImageScale(parseInt(e.target.value))}
                    className="w-full h-1"
                  />
                </div>
              )}
              <input
                ref={backImageUploadRef}
                type="file"
                accept="image/*"
                onChange={handleBackImageUpload}
                className="hidden"
              />
            </div>
          </div>
          
          {/* Hidden logo upload input */}
          <input
            ref={logoUploadRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />

          {/* Back Print */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="backPrint"
                checked={backPrint.enabled}
                onChange={(e) => updateBackPrint('enabled', e.target.checked)}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="backPrint" className="text-sm font-medium text-gray-700">Back Print</label>
            </div>
            
            {backPrint.enabled && (
              <div className="space-y-3 ml-6">
                <div>
                  <input
                    type="text"
                    placeholder="Add text"
                    value={backPrint.text}
                    onChange={(e) => {
                      const text = e.target.value;
                      // Limit to 20 characters
                      if (text.length <= 20) {
                        updateBackPrint('text', text);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    maxLength={20}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {backPrint.text.length}/20 characters
                    </span>
                    <span className="text-xs text-gray-500">
                      {backPrint.text.split(' ').filter(word => word.length > 0).length}/3 words max
                    </span>
                  </div>
                  {backPrint.text.split(' ').filter(word => word.length > 0).length > 3 && (
                    <p className="text-xs text-red-500 mt-1">Maximum 3 words allowed</p>
                  )}
                </div>
                <select
                  value={backPrint.font}
                  onChange={(e) => updateBackPrint('font', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times">Times</option>
                  <option value="Georgia">Georgia</option>
                </select>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Scale: {backPrint.scale}%</label>
                  <input
                    type="range"
                    min="25"
                    max="100"
                    value={backPrint.scale}
                    onChange={(e) => updateBackPrint('scale', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Polo Preview */}
        <div className="lg:col-span-2">
          <div className="bg-gray-100 rounded-2xl p-8 min-h-[600px] flex items-center justify-center">
            <div className="max-w-4xl w-full">
              {/* Two separate images showing front and back */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Front View */}
                <div className="relative">
                  <h4 className="text-center text-sm font-medium text-gray-600 mb-4">Front</h4>
                  <div className="relative">
                    <img
                      src={getPoloImage()}
                      alt="Polo Shirt Front"
                      className="w-full h-auto"
                      style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
                    />
                    
                    {/* Tribelet Logo Overlay - Left Chest */}
                    <img
                      src={getTribeletLogo()}
                      alt="Tribelet Logo"
                      className="absolute"
                      style={{
                        top: '25%',
                        left: '25%',
                        width: '15%',
                        height: 'auto',
                        objectFit: 'contain',
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                    
                    {/* Front Image Overlay - Right Chest */}
                    {getFrontImageToDisplay() && showFrontImage && (
                      <img
                        src={getFrontImageToDisplay().startsWith('data:') || getFrontImageToDisplay().startsWith('http') ? getFrontImageToDisplay() : `data:image/png;base64,${getFrontImageToDisplay()}`}
                        alt="Front Image"
                        className="absolute"
                        style={{
                          top: '25%',
                          left: '75%',
                          width: `${frontImageScale * 0.25}%`,
                          height: 'auto',
                          objectFit: 'contain',
                          transform: `translate(-50%, -50%) scale(${frontImageScale / 100})`,
                          transformOrigin: 'center'
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Back View */}
                <div className="relative">
                  <h4 className="text-center text-sm font-medium text-gray-600 mb-4">Back</h4>
                  <div className="relative">
                    <img
                      src={getPoloImageBack()}
                      alt="Polo Shirt Back"
                      className="w-full h-auto"
                      style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
                    />
                    
                    {/* Back Image Overlay */}
                    {getBackImageToDisplay() && showBackImage && (
                      <img
                        src={getBackImageToDisplay().startsWith('data:') || getBackImageToDisplay().startsWith('http') ? getBackImageToDisplay() : `data:image/png;base64,${getBackImageToDisplay()}`}
                        alt="Back Image"
                        className="absolute"
                        style={{
                          top: '20%',
                          left: '50%',
                          width: `${backImageScale * 0.2}%`,
                          height: 'auto',
                          objectFit: 'contain',
                          transform: `translate(-50%, -50%) scale(${backImageScale / 100})`,
                          transformOrigin: 'center'
                        }}
                      />
                    )}
                    
                    {/* Back Print Text */}
                    {backPrint.enabled && backPrint.text && backPrint.text.split(' ').filter(word => word.length > 0).length <= 3 && (
                      <div
                        className="absolute"
                        style={{
                          top: '40%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '60%',
                          maxWidth: '80%',
                          textAlign: 'center',
                          fontSize: `${Math.min(backPrint.scale * 0.3, 24)}px`,
                          fontFamily: backPrint.font,
                          color: getContrastingTextColor(),
                          fontWeight: 'bold',
                          textShadow: getContrastingTextColor() === '#FFFFFF' ? '1px 1px 2px rgba(0,0,0,0.3)' : '1px 1px 2px rgba(255,255,255,0.3)',
                          wordBreak: 'break-word',
                          lineHeight: '1.2'
                        }}
                      >
                        {backPrint.text}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition"
            >
              Back
            </button>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition">
                Save Design
              </button>
              <button
                onClick={onNext}
                className="px-6 py-3 bg-[#A461F9] text-white rounded-xl hover:bg-[#934ff2] transition"
              >
                Review Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PoloCustomizationStep;