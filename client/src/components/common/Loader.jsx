import React from 'react';
import './Loader.css'; // Import the CSS file
import Spinner from '/src/assets/Spinner.svg'; // Adjust path as needed

const Loader = () => {
  return (
    <div className="loader-overlay">
      <img src={Spinner} alt="Loading..." className="loader-spinner" />
    </div>
  );
};

export default Loader;
