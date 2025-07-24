import React from 'react';

const Loader = () => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-white z-50">
      <img src="/src/assets/Spinner.svg" alt="Loading..." className="w-6 h-6 animate-spin" />
    </div>
  );
};

export default Loader;
