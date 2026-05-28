import React from "react";
import PropTypes from "prop-types";

const TeamSection = ({ team }) => (
  <section className="my-12 py-8">
    <h2 className="text-3xl font-bold text-center mb-10">Meet the Team</h2>
    {team.map((sector) => (
      <div key={sector.sector} className="mb-12">
        <h3 className="text-2xl font-semibold mb-6 text-left capitalize">{sector.sector}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {sector.members.map((member) => (
            <div key={member.name} className="bg-white rounded-xl shadow p-6 flex flex-col items-center w-full hover:shadow-lg transition-shadow">
              <img
                src={`/${member.image}`}
                alt={member.name}
                className="w-24 h-24 object-cover rounded-full border-4 border-amber-400 mb-4"
              />
              <div className="text-center">
                <span className="block text-lg font-semibold text-gray-800">{member.name}</span>
                <span className="block text-sm text-gray-500 mt-1">{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </section>
);

TeamSection.propTypes = {
  team: PropTypes.arrayOf(
    PropTypes.shape({
      sector: PropTypes.string.isRequired,
      members: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          role: PropTypes.string.isRequired,
          image: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
};

export default TeamSection; 