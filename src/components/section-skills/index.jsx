import React from 'react';

import Section from '../section';
import SummaryItem from '../summary-item';

const SectionSkills = ({ skills }) => {
  return (
    <Section title="Skills">
      {skills.map((skill) => (
        <SummaryItem
          key={skill.name}
          name={skill.name}
          description={skill.description}
          strongSkills={skill.strongSkills}
          familiarSkills={skill.familiarSkills}
        />
      ))}
    </Section>
  );
};

export default SectionSkills;
