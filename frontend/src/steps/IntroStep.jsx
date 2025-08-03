const IntroStep = ({ onNext }) => (
  <div className="text-center">
    <h2 className="text-2xl font-bold mb-4">Welcome to Tribelet!</h2>
    <p className="text-gray-600 mb-6">
      You'll walk through 5 quick steps to create your team identity, including name, sponsorship pitch, and logo.
    </p>
    
    <div className="text-left bg-gray-50 p-4 rounded-xl mb-6">
      <p className="text-gray-700 text-sm mb-4">
        This is your chance to really sell your team and pitch why similar small companies should sponsor you! 
        Let us know whether you work in a certain industry (healthcare, tech, insurance, construction, etc.) 
        and whether you are collectively interested in any issues (climate change, cooking, thrift shopping, etc.). 
        There doesn't need to be any structure or format, we'll take care of that for you!
      </p>
      
      <div className="bg-white p-3 rounded-lg border-l-4 border-[#A461F9]">
        <p className="text-xs text-gray-500 mb-2 font-semibold">Example:</p>
        <p className="text-gray-600 text-sm italic">
          "We are 8 software engineers from London who work at different fintech startups. 
          We're passionate about sustainable investing and often discuss ESG strategies during our matches. 
          We play in a local 7-a-side league every Thursday evening and are looking for kit sponsorship 
          from companies that share our values around responsible finance."
        </p>
      </div>
    </div>
    
    <button onClick={onNext} className="bg-[#A461F9] text-white px-6 py-3 rounded-xl hover:bg-[#934ff2] transition">
      Start →
    </button>
  </div>
);
export default IntroStep;