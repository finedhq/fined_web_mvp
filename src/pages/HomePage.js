import React from 'react';
import CourseList from '../components/CourseList';
import '../styles/HomePage.css';

const HomePage = () => {
  return (
    <div className="homepage">
      <h2>Explore Courses</h2>
      <CourseList />
    </div>
  );
};

export default HomePage;
