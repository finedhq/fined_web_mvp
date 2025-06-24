import React from 'react';

const CourseList = ({ courses }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course, index) => (
        <div key={index} className="border p-4 rounded shadow">
          <h2 className="text-lg font-semibold">{course.title}</h2>
          <p>{course.description}</p>
        </div>
      ))}
    </div>
  );
};

export default CourseList;