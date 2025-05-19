import React from 'react';
import '../styles/alignmentGuide.css';

const AlignmentGuide = ({ show, position, type }) => {
  if (!show) return null;

  const guideStyle = {
    position: 'absolute',
    backgroundColor: '#2196F3',
    pointerEvents: 'none',
    zIndex: 1000,
    ...(type === 'vertical' ? {
      width: '1px',
      height: '100%',
      left: `${position}px`,
      top: 0
    } : {
      width: '100%',
      height: '1px',
      top: `${position}px`,
      left: 0
    }),
  };

  return (
    <div 
      style={guideStyle} 
      className="alignment-guide"
      data-type={type}
    />
  );
};

export default AlignmentGuide; 