import React from 'react';
import ModuleList from '../components/ModuleList';

const CourseOverviewPage = () => {
  const modules = ['Introduction', 'Chapter 1', 'Chapter 2'];
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Course Overview</h1>
      <ModuleList modules={modules} />
    </div>
  );
};

export default CourseOverviewPage;
