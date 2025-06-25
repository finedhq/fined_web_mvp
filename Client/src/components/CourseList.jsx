import React from 'react';

const CourseList = ({ courses }) => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 p-4">
      {courses.map((course, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition duration-300"
        >
          {course.thumbnail_url && (
            <img
              src={course.thumbnail_url}
              alt={`${course.title} thumbnail`}
              className="w-full h-40 object-cover rounded-t-lg"
            />
          )}

          <div className="p-4">
            <h2 className="text-xl font-semibold text-indigo-700 mb-1">{course.title}</h2>
            <p className="text-sm text-gray-600 mb-2">{course.description}</p>

            <div className="flex justify-between text-sm text-gray-500 mt-3">
              <span>📘 {course.modules_count || 0} modules</span>
              <span>⏱️ {course.duration || 0} mins</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseList;
