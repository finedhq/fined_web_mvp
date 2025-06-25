import React from 'react';

const ModuleList = ({ modules }) => {
  return (
    <ul className="list-disc pl-5">
      {modules.map((module, index) => (
        <li key={index} className="my-2">
          {module}
        </li>
      ))}
    </ul>
  );
};

export default ModuleList;